import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import * as dotenv from 'dotenv';

dotenv.config();

// base model
let singlton: ChatGoogleGenerativeAI | null = null;

const baseModel = (modelName: string) => {
  if (!singlton) {
    singlton = new ChatGoogleGenerativeAI({
      model: modelName,
      apiKey: process.env.GOOGLE_API_KEY,
      streaming: true,
      maxOutputTokens: 8192,
    });
  }
  return singlton;
};

// the stream or invoke
type GetGeminiRespProps = {
  userPrompt: string;
  modelName?: string;
  systemMessage: string;
};

export async function getGeminiResponse({
  userPrompt,
  systemMessage,
  modelName = 'gemini-2.5-flash',
}: GetGeminiRespProps) {
  try {
    // calling the class once
    const model = baseModel(modelName);

    // response
    const completion = await model.stream([
      ['system', systemMessage],
      ['human', userPrompt],
    ]);

    // log to check
    console.log({ completion }, { typeForCompletion: typeof completion });

    // adjust later
    return completion;
  } catch (error) {
    console.error('Error fetching Gemini response:', error);
    return "Sorry, I couldn't generate a response.";
  }
}
