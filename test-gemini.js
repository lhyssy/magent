import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');

if (!apiKey) {
  console.error('No API key found');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
  try {
    console.log('Testing gemini-1.5-pro...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent('Hello, how are you?');
    const response = await result.response;
    const text = response.text();
    console.log('Success with gemini-1.5-pro:', text.substring(0, 100));
  } catch (error) {
    console.error('Error with gemini-1.5-pro:', error.message);
    
    try {
      console.log('Testing gemini-pro...');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('Hello, how are you?');
      const response = await result.response;
      const text = response.text();
      console.log('Success with gemini-pro:', text.substring(0, 100));
    } catch (error2) {
      console.error('Error with gemini-pro:', error2.message);
    }
  }
}

testGemini();