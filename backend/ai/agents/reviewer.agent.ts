import { getGeminiResponse } from '../../libs/gemini';
import { getGroqResponse } from '../../libs/groq';
import { GraphState, ReviewType } from '../graph';
import { reviewerPromptGen } from '../prompts/reviewer.prompt';

const PASS_SCORE = 85;

export const reviewerNode = async (state: GraphState) => {
  console.log('--- REVIEWER: Verifying ---');

  const framework = state.framework;
  const plan = state.plan;
  const files = state.files;
  const terminal_output = state.terminal_result.logs;

  // Build the system prompt
  const systemPrompt = reviewerPromptGen(
    framework,
    plan,
    files,
    terminal_output,
  );

  // Call the AI - groq
  // let raw = await getGroqResponse({
  //   userPrompt: state.user_prompt.join('\n'),
  //   systemMessage: systemPrompt,
  // });

  let raw = await getGeminiResponse({
    userPrompt: state.user_prompt.join('\n'),
    systemMessage: systemPrompt,
  });

  console.log({ raw });

  raw = raw.replace(/^```json\s*/, '').replace(/```$/, '');

  // Parse safely
  let review: ReviewType;

  try {
    review = JSON.parse(raw) as ReviewType;
  } catch (err) {
    console.error('Reviewer returned invalid JSON:', raw);
    review = {
      score: 0,
      is_verified: false,
      verdict: 'REJECTED',
      feedback: ['Reviewer returned invalid JSON format.'],
      suggested_fixes: ['Ensure reviewer returns valid JSON.'],
      retry_from: 'coder',
      confidence: 0,
    };
  }

  // Determine if iteration should increment
  const iterationIncrement = review.score < PASS_SCORE ? 1 : 0;

  // Return structured GraphState update
  return {
    review,
    iteration_count: iterationIncrement,
  };
};
