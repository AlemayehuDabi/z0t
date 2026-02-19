import { Context } from 'hono';
import {
  FrameworkType,
  StylingType,
  userPromptRequest,
} from '../../../package/type';
import { ProjectService } from './project.service';
import { streamSSE } from 'hono/streaming';
import { workflow } from '../../ai/graph';

export async function createPrompt(c: Context) {
  const requestPayload = await c.req.json<userPromptRequest>();

  // logging the data from the frontend
  console.log('request payload: ', requestPayload);

  // use to verify user
  // const user = await c.get('user');

  // console.log('user: ', user);

  // TODO: Validate the payload—is this a "GENESIS" (New) or "EVOLUTION" (Existing) request?
  const mode = requestPayload.mode;

  //  framework and projectId variable for both
  let projectId = '';
  let frameWork: FrameworkType;
  let prompts = [];
  let userId = requestPayload.userId;
  let styling: StylingType;

  // 2. CONTEXT AGGREGATION (The Performance Layer)
  if (mode == 'GENESIS') {
    requestPayload;
    // TODO: Create a new entry in the Project table.
    const newProject = await ProjectService.createProject(
      requestPayload,
      // i'll change it - user.id
      requestPayload.userId,
    );

    // console log for debug
    console.log('initializing new/genesis project', newProject);

    // set the variable
    projectId = newProject.id;
    frameWork = newProject.frameWork;
    prompts = newProject.prompts.slice(0, 5);
    styling = newProject.styling;
  } else {
    // add new prompt
    // SAVE the new incoming prompt first so it's part of the history
    await ProjectService.addPrompt(
      requestPayload.projectId,
      requestPayload.prompt,
      'USER',
    );

    // TODO: Fetch the last 5 relevant prompts from the database for short-term memory.
    const projectContext = await ProjectService.getProjectContext(
      requestPayload.projectId,
      // user.id
      requestPayload.userId,
    );

    // console log the project context'
    console.log({ projectContext });

    // set the variable
    projectId = projectContext.id;
    frameWork = projectContext.frameWork;
    prompts = projectContext.prompts.slice(0, 5);
    styling = projectContext.styling;

    // first five prompts
    // const fivePrompts = projectContext.prompts.slice(0,5)

    // TODO: Retrieve "ProjectMemory" (The summarized state of the whole app).
    // const projectMemory = await ProjectService.getProjectMemory(requestPayload, user.id)
    // TODO: If the user provided an 'activeFile', pull that specific content from storage.

    // TODO: Capture any 'errorLogs' provided to prioritize a "Fix" agent over a "Feature" agent.
  }

  // 1. Extract just the content strings
  // 2. .reverse() them so the AI reads history from oldest to newest
  const promptHistory = prompts.map((p) => p.content).reverse();

  // 3. MULTI-AGENT DISPATCH (The "Brain" Layer) - stream events
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

    // console log the event stream
    console.log({ eventStream });

    for await (const event of eventStream) {
      const eventType = event.event;

      // 1. Capture Tokens (The "typing" animation)
      if (eventType === 'on_chat_model_stream') {
        const content = event.data.chunk.content;
        if (content) {
          await stream.writeSSE({
            data: content,
            event: 'token', // Frontend will listen for 'token'
          });
        }
      }

      // 2. Capture Node Start (Status updates)
      else if (eventType === 'on_chain_start' && event.name === 'coder') {
        await stream.writeSSE({
          data: 'Agent is writing code...',
          event: 'status',
        });
      }

      // 3. Capture Final Result (The parsed files)
      else if (eventType === 'on_chain_end' && event.name === 'LangGraph') {
        // This is the final state of the graph
        const finalOutput = event.data.output;
        await stream.writeSSE({
          data: JSON.stringify(finalOutput.files),
          event: 'final_files',
        });
      }
    }

    await stream.writeSSE({ data: 'done', event: 'end' });
  });
}
