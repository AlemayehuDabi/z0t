import { getGroqResponse } from "../../libs/groq"
import { GraphState } from "../graph"
import { architectPromptGen } from "../prompts/architect.prompt"

export const architectNode = async (state: GraphState) => {
    console.log("--- ARCHITECT: Planning ---");

    // variables
    const user_prompt = state.user_prompt
    const frameWork = state.framework


    // Logic: Call LLM to generate a plan based on user_prompt + framework

    // arch prompt
    const prompt = architectPromptGen({framework: frameWork, prompt: user_prompt})

    const response = await getGroqResponse({
        userPrompt: state.user_prompt,
        systemMessage: prompt
    })

    // console log the response
    console.log("the response from arch: ", response)

    return { 
        plan: response,
    };
};

