import { GraphState } from '../graph';

export const reviewerNode = async (state: GraphState) => {
  console.log('--- REVIEWER: Verifying ---');
  // Logic: Check terminal_output and files4

  const verified = state.terminal_result.logs.includes('success');

  return { iteration_count: 1 };
};
