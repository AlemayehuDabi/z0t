import { GraphState } from '../graph';

const MAX_RETRIES = 3;
const PASS_SCORE = 85;

// 3. Routing Logic (The "Decision" Edge)
export const routeAfterReview = async (
  state: GraphState,
): Promise<'retry_architect' | 'retry_terminal' | 'retry_coder' | 'end'> => {
  const { iteration_count } = state;

  if (state.review.score >= PASS_SCORE) {
    return 'end';
  }

  // If failed but we have retries left, go back to the architect
  if (iteration_count >= MAX_RETRIES) {
    return 'end';
  }

  switch (state.review.retry_from) {
    case 'architect':
      return 'retry_architect';
    case 'terminal':
      return 'retry_terminal';
    default:
      return 'retry_coder';
  }
};
