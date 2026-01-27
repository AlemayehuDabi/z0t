import { GraphState } from "../graph";

  // 3. Routing Logic (The "Decision" Edge)
  export const routeAfterReview = async (state: GraphState) => {
    const { is_verified, iteration_count } = state;

  // If verified, we are done
  if (is_verified) {
    return "end";
  }

  // If failed but we have retries left, go back to the architect
  if (iteration_count < 5) {
    return "retry";
  }

  // Safety break: too many iterations
  return "end";
  };
