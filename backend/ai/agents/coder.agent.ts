import { getGroqResponse } from '../../libs/groq';
import { orderedPrompt } from '../../utlis/orderedPrompt';
import { GraphState } from '../graph';
import { coderPromptGen } from '../prompts/coder.prompt';
import { ProjectService } from '../../src/services/project.service';
import { parseLLMResponse } from '../../utlis/parse-llm-response';

export const coderNode = async (state: GraphState) => {
  console.log('--- CODER: Writing Files ---');
  // Logic: Read the plan, generate code

  const user_prompt = state.user_prompt;
  const plan = state.plan;
  const framework = state.framework;
  const styling = state.styling;
  const iteration_count = state.iteration_count;
  const review = state.review;
  const files = state.files;

  // missing or null state properties
  if (!user_prompt || !plan) {
    throw new Error(
      'CODER: Misssing required state properties (user_prompt or plan)',
    );
  }

  // generate system prompt
  const system_prompt = coderPromptGen(
    plan,
    framework,
    styling,
    iteration_count,
    review,
    files,
  );

  // logging system prompt
  // console.log('system prompt for coder node: ', system_prompt);

  // formatted prompt
  const formatted_prompt = orderedPrompt(user_prompt);

  let response: string;
  try {
    response = await getGroqResponse({
      userPrompt: formatted_prompt,
      systemMessage: system_prompt,
    });

    // console.log('response from coding agent: ', response);
  } catch (error) {
    console.log('CODER: LLM failed', error);
    throw new Error('CODER: LLM failed to response');
  }

  // log the response
  // console.log('The response from the llm for coder node: ', response);

  // use adaptor extract the files
  const extractedFiles = parseLLMResponse(response);

  console.log({ extractedFiles });

  // 4. PERSISTENCE (Save the result)
  // TODO: Save the code changes to your database or file system
  await ProjectService.saveInteraction({
    projectId: state.project_id,
    userContent: '',
    aiOutput: extractedFiles,
    type: 'CODE',
    modelName: 'qwen/qwen3-32b',
  });

  // return
  return { files: extractedFiles };
};
