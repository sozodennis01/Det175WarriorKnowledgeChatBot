// api/chat.js

import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI API
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_DET175_DEV,
  })
);

// Read the text file content at build time
const textFileContent = fs.readFileSync(
  path.join(process.cwd(), 'public', 'DET175_CadetHandbook_F24_9OCT2024.txt'),
  'utf8'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const userMessage = req.body.message || 'Hi';
  const chatHistory = req.body.chatHistory || [];

  // Prepare messages for OpenAI API
  const currentTimestamp = new Date().toISOString();
  const messages = [
    {
      role: 'system',
      content: `The current date and time is ${currentTimestamp}. You are a helpful assistant that quizzes the user on the following from the DET175 Cadet Handbook Information Fall 2024 9OCT2024:
      \n\n${textFileContent}\n\n
      Start by asking a question related to the content. Questions should vary in type and difficulty.
      The goal is to test the user's knowledge from each LLAB, which corresponds to "weeks" when the user mentions them. If the user specifies a particular LLAB or week, focus the questions on that section.

      Generate different types of questions based on the content:
      - Factual recall questions (e.g., "What are the core values of the Air Force?")
      - Rank identification questions (e.g., "Describe the insignia for a Cadet Captain.")
      - Mission or vision-related questions (e.g., "What is the mission of the Space Force?")
      - Heritage and historical fact questions (e.g., "Who was the first Chinese-American fighter pilot from Detachment 175?")
      - Leadership and organizational questions (e.g., "Who is the Operations Officer for Detachment 175?")
      - Questions about key doctrines or codes (e.g., "What does Article I of the Armed Forces Code of Conduct state?")

      Use the handbook information to generate randomized and diverse questions each time. When providing feedback,
      be concise and reaffirm the correct answer if given correctly or gently correct it if given incorrectly.
      Try not to give any hints in the questions itself.
      If the user asks a question unrelated to the Cadet Handbook Information, Air Force, military, or Space Force, politely refuse to answer by responding, "I can only quiz you on topics related to the AFROTC Cadet Handbook, Air Force, military, or Space Force.
      Please ask questions relevant to these areas. Do not repeat questions.
      Start with a random question from SECTION LLAB 9, LLAB 8, LLAB 7, LLAB 6, LLAB 5, LLAB 4, LLAB 3, or LLAB 2."`,
    },
    ...chatHistory,
    { role: 'user', content: userMessage },
  ];

  //see if this runs
  console.log(messages[0].content.message)

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4', // Replace with your model
      messages: messages,
      temperature: 1.0,
      max_tokens: 150,
    });

    const assistantMessage = response.data.choices[0].message.content;

    res.status(200).json({ message: assistantMessage });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ message: 'Sorry, something went wrong with OpenAI.' });
  }
}
