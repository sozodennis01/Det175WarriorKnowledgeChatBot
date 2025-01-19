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

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Serve static files from the 'public' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Read the text file content
const textFilePath = path.join(__dirname, 'public/DET175_CadetHandbook_S25_16JAN2025.txt');
const textFileContent = fs.readFileSync(textFilePath, 'utf8');

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 15, // limit each IP to 15 requests per 1 minute
});

// In-memory session store
const sessions = new Map(); // Key: UUID, Value: { chatHistory: Array, lastActive: Date }

// Session timeout configuration
const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 30 minutes
var users = 0;

// Periodic session cleanup
setInterval(() => {
    const now = Date.now();

    // Create a new Date object from the timestamp
    const currentDate = new Date(now);

    // Define the Hawaii time options for formatting
    const options = {
        timeZone: 'Pacific/Honolulu', // Hawaii time zone
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false // Optional: 12-hour format
    };

    // Format the date to Hawaii time zone
    const hawaiiTime = new Intl.DateTimeFormat('en-US', options).format(currentDate);

    console.log('Running cleanup at: ' + hawaiiTime + "\nNumber of users: " + users);
    if (sessions.size > 25) {
        sessions.clear();
        users = 0;
        console.log('Wiped all sessions after cleanup.');
    }
    else {
        let deleted = 0;
        for (const [uuid, session] of sessions.entries()) {
            if (now - session.lastActive > SESSION_TIMEOUT_MS) {
                sessions.delete(uuid);
                console.log(`Session ${uuid} has been cleaned up due to inactivity.`);
                users--;
                deleted++;
            }
        }
        console.log('Total sessions cleaned up: ' + deleted);
    }
}, 60 * 60 * 1000); // Run cleanup every 60 minutes

// POST /chat route with rate limiting
try {
    app.post('/chat', limiter, async (req, res) => {

        const { uuid, message } = req.body;

        if (!uuid) {
            console.error("A client doesn't have an UUID? Assume null?");
            return res.status(400).json({ message: 'Error: UUID is required.' });
        }

        // Initialize session if it doesn't exist
        if (!sessions.has(uuid)) {
            sessions.set(uuid, { chatHistory: [], lastActive: Date.now() });
            users++;
            console.log(`Session ${uuid} created - assumed ${users} users`);
        }

        const session = sessions.get(uuid);
        session.lastActive = Date.now(); // Update last active timestamp

        const userMessage = message;

        // Only add user's message if it's not the initial request
        if (userMessage) {
            session.chatHistory.push({ role: 'user', content: userMessage });
        }

        // Prepare messages for OpenAI API
        const currentTimestamp = new Date().toISOString();
        const systemMessage = {
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
            Try not to give any hints in the questions itself.
            If the user asks a question unrelated to the Cadet Handbook Information, Air Force, military, or Space Force, politely refuse to answer by responding, "I can only quiz you on topics related to the AFROTC Cadet Handbook, Air Force, military, or Space Force. 
            Please ask questions relevant to these areas. Do not repeat questions.
            Start with a random question from SECTION LLAB 1.`,
        };

        // Prepare messages array
        const messages = [systemMessage, ...session.chatHistory];

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.90,
            max_completion_tokens: 200,
            store: true
        });

        const assistantMessage = response.choices[0].message.content;

        // Add assistant's message to the conversation history
        session.chatHistory.push({ role: 'assistant', content: assistantMessage });

        res.json({ message: assistantMessage });

    });
} catch (error) {
    console.error('Error in /chat route:', error);
    res.status(500).json({ message: 'Sorry, something went wrong with the server.' });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Chatbot is running on port ${PORT}`);
});
