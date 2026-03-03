import { Context } from 'hono';
import {
  FrameworkType,
  StylingType,
  userPromptRequest,
} from '../../../package/type';
import { ProjectService } from './project.service';
import { StreamEvents } from '../../libs/stream_events';

export async function createPrompt(c: Context) {
  const requestPayload = await c.req.json<userPromptRequest>();

  // logging the data from the frontend
  // console.log('request payload: ', requestPayload);

  // use to verify user
  // const user = await c.get('user');

  // console.log('user: ', user);

  // TODO: Validate the payload—is this a "GENESIS" (New) or "EVOLUTION" (Existing) request?
  const mode = requestPayload.mode;

  //  framework and projectId variable for both
  let projectId = '';
  let frameWork: FrameworkType;
  let prompts = [];
  const userId = requestPayload.userId;
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
  return StreamEvents({
    c,
    promptHistory,
    projectId,
    frameWork,
    styling,
    mode,
    userId,
  });
}
