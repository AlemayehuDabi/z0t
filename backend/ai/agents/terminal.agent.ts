import { getGeminiResponse } from '../../libs/gemini';
import { getGroqResponse } from '../../libs/groq';
import { ProjectService } from '../../src/services/project.service';
import { orderedPrompt } from '../../utlis/orderedPrompt';
import { GraphState } from '../graph';
import { terminalPromptGen } from '../prompts/terminal.prompt';

export const terminalNode = async (state: GraphState) => {
  console.log('--- TERMINAL: Running Build ---');
  // Logic: Execute 'npm run build' or 'vitest'

  const userPrompt = state.user_prompt;
  const formattedPrompt = orderedPrompt(userPrompt);

  const logs = state.terminal_result.logs.join('\n');

  // here there need to be two kind of prompt if there is a review or error
  // one for genesis and the other for evolution/error/fix
  const systemMessage = terminalPromptGen(
    state.plan,
    state.files,
    state.iteration_count,
    state.terminal_result,
    logs,
  );

  // const response = await getGroqResponse({
  //   userPrompt: formattedPrompt,
  //   systemMessage,
  // });

  const response = await getGeminiResponse({
    userPrompt: formattedPrompt,
    systemMessage,
  });

  console.log('terminal response: ', response);

  // db call if and only score is greater than 85 or iteration_count greater than 5

  // save in the db
  await ProjectService.saveInteraction({
    projectId: state.project_id,
    userContent: state.user_prompt.join('\n'),
    aiOutput: response,
    modelName: 'gemini-2.5-flash',
    type: 'TERMINAL',
  });

  // change this w/ a proper return
  return {
    terminal: response,
  };
};
