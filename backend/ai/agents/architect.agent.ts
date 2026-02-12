import { getGroqResponse } from '../../libs/groq';
import { ProjectService } from '../../src/services/project.service';
import { orderedPrompt } from '../../utlis/orderedPrompt';
import { GraphState } from '../graph';
import { architectPromptGen } from '../prompts/architect.prompt';

export const architectNode = async (state: GraphState) => {
  console.log('--- ARCHITECT: Planning ---');

  // 1. variables
  const user_prompt = state.user_prompt;
  const frameWork = state.framework;
  const mode = state.mode;

  // 2. formatted / ordered prompt
  const formattedPrompt = orderedPrompt(user_prompt);

  // 3. Logic: Call LLM to generate a plan based on user_prompt + framework
  // arch prompt
  const prompt = architectPromptGen({
    framework: frameWork,
    prompt: formattedPrompt,
    mode,
    styling: state.styling,
    iteration_count: state.iteration_count,
    review: state.review,
    files: state.files,
    terminal: state.terminal_result,
  });

  // 4. aiOutput
  const response = await getGroqResponse({
    userPrompt: `${state.user_prompt}`,
    systemMessage: prompt,
    modelName: 'llama-3.3-70b-versatile', // this default but check if it need to change or remove it
  });

  // 5. PERSISTENCE (Save the result)
  // TODO: Save the code changes to your database or file system
  await ProjectService.saveInteraction({
    projectId: state.project_id,
    userContent: '',
    aiOutput: response,
    type: 'ARCHITECTURE',
    modelName: 'llama-3.3-70b-versatile',
  });

  // console log the response
  console.log('the response from arch: ', response);

  // 6. return the output to the graph
  return {
    plan: response,
  };
};
