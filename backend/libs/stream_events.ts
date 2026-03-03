import { streamSSE } from 'hono/streaming';
import { workflow } from '../ai/graph';
import { Context } from 'hono';
import { FrameworkType } from '../../package/type';
import { StylingType } from '../generated/prisma/enums';

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
            if (content) {
              await stream.writeSSE({
                data: content,
                event: 'token', // Frontend will listen for 'token'
              });
            }
            break;
            break;

          // 2. Capture Node Start (Status updates)
          case 'on_chain_start':
            if (event.name === 'coder') {
              await stream.writeSSE({
                data: 'Agent is writing code...',
                event: 'status',
              });
            }
            break;

          case 'on_chain_end':
            if (event.name === 'LangGraph') {
              const finalOutput = event.data?.output;

              if (finalOutput?.files) {
                await stream.writeSSE({
                  data: JSON.stringify(finalOutput.files),
                  event: 'final_files',
                });
              }
            }
            break;
            break;
        }
      }
    } finally {
      clearInterval(heartbeat);
    }

    await stream.writeSSE({ data: 'done', event: 'end' });
  });
};
