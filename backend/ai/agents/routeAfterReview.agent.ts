import { END } from "@langchain/langgraph";
import { GraphState } from "../graph";

  // 3. Routing Logic (The "Decision" Edge)
  export const routeAfterReview = async (state: GraphState) => {
    if (state.is_verified || state.iteration_count > 10) {
      return END; // Stop if verified OR we hit loop limit
    }
    return "coderNode"; // Go back to coder to fix issues
  };
