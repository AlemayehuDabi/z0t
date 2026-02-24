import Groq from 'groq-sdk';
// Get API key from environment variable
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type getGroqRespProps = {
  userPrompt: string;
  modelName?: string;
  systemMessage: string;
};

export async function getGroqResponse({
  userPrompt,
  modelName = 'qwen/qwen3-32b',
  systemMessage,
}: getGroqRespProps): Promise<string> {
  try {
    // response
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt },
      ],
      model: modelName,
      temperature: 0.5, // Adjust creativity (0.0 - 2.0)
      max_tokens: 1024,
    });

    // log to check
    console.log({ completion });

    // adjust later
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error fetching Groq response:', error);
    return "Sorry, I couldn't generate a response.";
  }
}
