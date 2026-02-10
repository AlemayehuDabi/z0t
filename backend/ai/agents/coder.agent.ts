import * as path from 'path';
import { getGroqResponse } from '../../libs/groq';
import { orderedPrompt } from '../../utlis/orderedPrompt';
import { FileNode, GraphState } from '../graph';
import { coderPromptGen } from '../prompts/coder.prompt';

// extract the files in the `Record<string, FileNode>` format form the llm response
export const parseLLMResponse = (text: string): Record<string, FileNode> => {
  const files: Record<string, FileNode> = {}; // start empty

  // Regex to match <file path="...">...</file>
  // [^"]+ matches the path inside quotes
  // [\s\S]*? matches everything inside (including newlines), non-greedy
  const regex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;

  let match;

  while ((match = regex.exec(text)) !== null) {
    const [_, rawPath, content] = match;

    // remove uncessary symbols from the path
    const normalized = path.normalize(rawPath);

    // check if there is folder mis-match
    if (path.isAbsolute(normalized) || normalized.includes('..')) {
      console.warn(`Skipping unsafe path: ${rawPath}`);
      continue;
    }
    // add the objects
    files[normalized] = {
      path: normalized,
      content,
      isBinary: false,
      lastUpdated: Date.now(),
    };
  }

  return files;
};

export const coderNode = async (state: GraphState) => {
  console.log('--- CODER: Writing Files ---');
  // Logic: Read the plan, generate code

  const user_prompt = state.user_prompt;
  const plan = state.plan;
  const framework = state.framework;
  const styling = state.styling;

  // missing or null state properties
  if (!user_prompt || !plan) {
    throw new Error(
      'CODER: Misssing required state properties (user_prompt or plan)',
    );
  }

  // generate system prompt
  const system_prompt = coderPromptGen(plan, framework, styling);

  // logging system prompt
  // console.log('system prompt for coder node: ', system_prompt);

  // formatted prompt
  const formatted_prompt = orderedPrompt(user_prompt);

  let response: string;
  try {
    response = await getGroqResponse({
      userPrompt: formatted_prompt,
      systemMessage: system_prompt,
    });

    // console.log('response from coding agent: ', response);
  } catch (error) {
    console.log('CODER: LLM failed', error);
    throw new Error('CODER: LLM failed to response');
  }

  // log the response
  // console.log('The response from the llm for coder node: ', response);

  // use adaptor extract the files
  const extractedFiles = parseLLMResponse(response);

  console.log({ extractedFiles });

  // 4. PERSISTENCE (Save the result)
  // TODO: Save the code changes to your database or file system

  // return
  return { files: extractedFiles };
};
