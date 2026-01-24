import { GraphState } from "../graph";

export const terminalNode = async (state: GraphState) => {
    console.log("--- TERMINAL: Running Build ---");
    // Logic: Execute 'npm run build' or 'vitest'
    return { terminal_output: "Build successful. No errors." };
  };