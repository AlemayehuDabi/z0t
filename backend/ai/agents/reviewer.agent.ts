import { getGroqResponse } from '../../libs/groq';
import { GraphState } from '../graph';
import { reviewerPromptGen } from '../prompts/reviewer.prompt';

export const reviewerNode = async (state: GraphState) => {
  console.log('--- REVIEWER: Verifying ---');
  // Logic: Check terminal_output and files4

  // variable
  const framework = state.framework;
  const plan = state.plan;
  const files = state.files;
  const terminal_output = state.terminal_result.logs;

  // prompt
  const systemPrompt = reviewerPromptGen(
    framework,
    plan,
    files,
    terminal_output,
  );

  // ai response
  const response = await getGroqResponse({
    userPrompt: state.user_prompt.join('\n'),
    systemMessage: systemPrompt,
  });

  console.log({ response });

  return {
    response,
  };
};
