import { getGroqResponse } from "../../libs/groq"
import { GraphState } from "../graph"
import { architectPromptGen } from "../prompts/architect.prompt"

export const architectNode = async (state: GraphState) => {
    console.log("--- ARCHITECT: Planning ---");
    // Logic: Call LLM to generate a plan based on user_prompt + framework
    return { 
        plan: ["1. Setup project", "2. Create components"], 
        iteration_count: 1 
    };
};

