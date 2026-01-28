import { getGroqResponse } from "../../libs/groq";
import { orderedPrompt } from "../../utlis/orderedPrompt";
import { GraphState } from "../graph";
import { coderPromptGen } from "../prompts/coder.prompt";

export const coderNode = async (state: GraphState) => {
    console.log("--- CODER: Writing Files ---");
    // Logic: Read the plan, generate code
    
    const user_prompt = state.user_prompt
    const plan = state.plan
    const frameWork = state.framework
    const iteration_count= state.iteration_count
    const files=state.files

    // generate system prompt
    const system_prompt = coderPromptGen(frameWork, plan, files, iteration_count)

    // logging system prompt
    console.log("system prompt for coder node: ", system_prompt)

    // formatted prompt
    const formatted_prompt = orderedPrompt(user_prompt)

    const response =  await getGroqResponse({userPrompt: formatted_prompt, systemMessage: system_prompt})

    // log the response
    console.log("The response from the llm for coder node: ", response)


    // use tool

    // save the response to db


    return { 
      files: [{ path: "src/App.tsx", content: "export default function..." }] 
    };
  };
  