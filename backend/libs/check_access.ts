import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('YOUR_API_KEY_HERE');

async function checkAccess() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );
    const data = await response.json();

    if (data.error) {
      console.log('API Error:', data.error.message);
      return;
    }

    console.log('--- YOUR ACCESSIBLE MODELS ---');
    data.models.forEach((m: any) => console.log(m.name));
  } catch (e) {
    console.error('Connection error:', e);
  }
}

checkAccess();
