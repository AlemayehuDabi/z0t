import { GraphState } from "../graph";

export const reviewerNode = async (state: GraphState) => {
    console.log("--- REVIEWER: Verifying ---");
    // Logic: Check terminal_output and files
    const verified = state.terminal_output.includes("successful");
    return { is_verified: verified };
  };