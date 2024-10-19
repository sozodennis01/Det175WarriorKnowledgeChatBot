// index.mjs

import OpenAI from 'openai';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_DET175_DEV,
});

const PORT = process.env.PORT || 3000;
// Session management
var chatHistory = [];

async function main() {
    const app = express();
    app.use(bodyParser.json());
    //app.use(helmet()); helmet breaks things ignore it for now.

    // Serve static files from the 'public' directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use(express.static(path.join(__dirname, 'public')));

    // Read the text file content
    const textFilePath = path.join(__dirname, 'public/DET175_CadetHandbook_F24_9OCT2024.txt');
    const textFileContent = fs.readFileSync(textFilePath, 'utf8');

    const limiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute window
        max: 5, // limit each IP to 5 requests per 1 minute
    });

    app.post('/chat', limiter, async (req, res) => {
        const userMessage = req.body.message;
        // Only add user's message if it's not the initial request
        if (userMessage)
            chatHistory.push({ role: 'user', content: userMessage });

        // Prepare messages for OpenAI API
        const currentTimestamp = new Date().toISOString();
        const messages = [
            {
                role: 'system',
                content: `The current date and time is ${currentTimestamp}. You are a helpful assistant that quizzes the user on the following from the DET175 Cadet Handbook Information Fall 2024 9OCT2024 :
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
                Try not to give any hints in the questions iteslf.
                If the user asks a question unrelated to the Cadet Handbook Information, Air Force, military, or Space Force, politely refuse to answer by responding, "I can only quiz you on topics related to the AFROTC Cadet Handbook, Air Force, military, or Space Force. 
                Please ask questions relevant to these areas. Do not repeat questions.
                Start with a random question from SECTION LLAB 9, LLAB 8, LLAB 7, LLAB 6, LLAB 5, LLAB 4, LLAB 3, or LLAB 2.`,
            },
            ...chatHistory,
        ];

        //console.log(messages[0].content)

        // Call OpenAI API - note by default its 0 so lets start with 1.0.
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 1.0,
                max_completion_tokens: 150,
            });

            const assistantMessage = response.choices[0].message.content;

            // Add assistant's message to the conversation history
            chatHistory.push({ role: 'assistant', content: assistantMessage });

            res.json({ message: assistantMessage });
        } catch (error) {
            // Add error message so users can send pic to me?
            const errorMessage = "SERVER ERROR: " + error.message;
            chatHistory.push({ role: 'assistant', content: errorMessage });
            res.json({ message: errorMessage });
            console.error('OpenAI API error:', error);
            res.status(500).json({ message: 'Sorry, something went wrong with OpenAPI?' });
            return;
        }

    });

    app.listen(PORT, () => {
        console.log('Chatbot is running on port ${PORT}`)');
    });
}

main();
