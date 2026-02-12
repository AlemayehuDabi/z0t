import { GraphState } from '../graph';

const MAX_RETRIES = 3;
const PASS_SCORE = 85;

export const routeAfterReview = async (
  state: GraphState,
): Promise<'retry_architect' | 'retry_terminal' | 'retry_coder' | 'end'> => {
  const { iteration_count, review } = state;

  if (review.score >= PASS_SCORE) {
    return 'end';
  }

  if (iteration_count >= MAX_RETRIES) {
    console.log('end b/c of max retries');

    console.log('----------- Max_retries ----------\n \n');
    console.log(`${state}\n`);

    console.log('Done!!!');
    return 'end';
  }

  switch (review.retry_from) {
    case 'architect':
      return 'retry_architect';
    case 'terminal':
      return 'retry_terminal';
    default:
      return 'retry_coder';
  }
};
