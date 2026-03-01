import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type getGeminiRespProps = {
  userPrompt: string;
  modelName?: string;
  systemMessage: string;
};

export async function getGeminiResponse({
  userPrompt,
  modelName = 'gemini-2.5-flash',
  systemMessage,
}: getGeminiRespProps): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemMessage,
    });

    // // response
    const completion = await model.generateContent(userPrompt);

    // log to check
    console.log({ completion });

    // adjust later
    return completion.response.text() || '';
  } catch (error) {
    console.error('Error fetching Gemini response:', error);
    return "Sorry, I couldn't generate a response.";
  }
}
