import { GraphState } from "../graph";

export const coderNode = async (state: GraphState) => {
    console.log("--- CODER: Writing Files ---");
    // Logic: Read the plan, generate code
    return { 
      files: [{ path: "src/App.tsx", content: "export default function..." }] 
    };
  };
  