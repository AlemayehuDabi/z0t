import { streamSSE } from 'hono/streaming';
import { workflow } from '../ai/graph';
import { Context } from 'hono';
import { FrameworkType } from '../../package/type';
import { ProjectService } from '../src/services/project.service';
import { GenerationType, StylingType } from '../generated/prisma/enums';
import { parseLLMResponse } from '../utlis/parse-llm-response';

const NODE_TO_GENERATE: Record<string, GenerationType> = {
  architect: GenerationType.ARCHITECTURE,
  coder: GenerationType.CODE,
  Refactor: GenerationType.REFACTOR,
  Review: GenerationType.REVIEW,
  Terminal: GenerationType.TERMINAL,
};

export const StreamEvents = ({
  c,
  promptHistory,
  projectId,
  frameWork,
  styling,
  mode,
  userId,
}: {
  c: Context;
  promptHistory: string[];
  projectId: string;
  frameWork: FrameworkType;
  styling: StylingType;
  mode: 'GENESIS' | 'EVOLUTION';
  userId: string;
}) => {
  return streamSSE(c, async (stream) => {
    // stream event input/option
    const eventStream = workflow.streamEvents(
      {
        user_prompt: promptHistory,
        project_id: projectId,
        framework: frameWork,
        styling: styling,
        mode,
        userId,
      },
      { version: 'v2' },
    );

    let currentNode: string | null = null;
    const nodeOutputs: Record<string, string> = {};

    // Send a heartbeat every 10 seconds to keep connection alive
    const heartbeat = setInterval(() => {
      stream.writeSSE({ data: 'heartbeat', event: 'token' }).catch(() => {
        // Ignore errors - stream may have closed
      });
    }, 10000);
    // console log the event stream
    // console.log('This is the event stream: ', eventStream);

    try {
      for await (const event of eventStream) {
        const eventType = event.event;

        // 1. Capture Tokens (The "typing" animation)
        switch (eventType) {
          case 'on_chat_model_stream':
            const content = event.data?.chunk?.content;

            if (!content) break;

            if (event.name === 'coder') {
              await stream.writeSSE({
                data: content,
                event: 'token', // Frontend will listen for 'token'
              });
            }
            // inside node only
            if (currentNode) {
              nodeOutputs[currentNode] =
                (nodeOutputs[currentNode] || '') + content;
            }

            break;

          // 2. Capture Node Start (Status updates)
          case 'on_chain_start':
            if (event.name === 'architect') {
              await stream.writeSSE({
                data: 'Planning project architecture...',
                event: 'status',
              });
            }

            if (event.name === 'coder') {
              await stream.writeSSE({
                data: 'Agent is writing code...',
                event: 'status',
              });
            }
            break;

          case 'on_chain_end':
            let finalOutput;
            const output = event.data.output;

            if (event.name === 'coder') {
              finalOutput = parseLLMResponse(output);
            }

            if (event.name === 'reviewer') {
              finalOutput = output
                .replace(/^```json\s*/, '')
                .replace(/```$/, '');
            }

            if (event.name === 'LangGraph') {
              finalOutput = event.data?.output;

              if (finalOutput?.files) {
                await stream.writeSSE({
                  data: JSON.stringify(finalOutput.files),
                  event: 'final_files',
                });
              }
            }

            currentNode = event.name;
            break;
        }
      }

      // SAVE ONLY AFTER STREAM FINISHES
      for (const [node, ouput] of Object.entries(nodeOutputs)) {
        const generationType = NODE_TO_GENERATE[node];
        if (!generationType) continue;

        // 5. PERSISTENCE (Save the result)
        // TODO: Save the code changes to your database or file system
        await ProjectService.saveInteraction({
          projectId,
          userContent: promptHistory.join('\n'),
          aiOutput: ouput,
          type: generationType,
          modelName: 'gemini-2.5-flash',
        });
      }
    } finally {
      clearInterval(heartbeat);
    }

    await stream.writeSSE({ data: 'done', event: 'end' });
  });
};
