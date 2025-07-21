// Load environment variables from a .env file
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the static files (style.css, script.js) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Explicit GET route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '.', 'index.html'));
});

// This is our secure API endpoint for Groq
app.post('/api/analyze', async (req, res) => {
    // Get the Groq API Key securely from environment variables
    const GROQ_API_KEY = process.env.API_KEY;

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'Groq API key is not configured on the server.' });
    }

    // Get the prompt from the frontend's request
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is missing from the request.' });
    }

    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    const payload = {
        messages: [{
            role: "user",
            content: prompt
        }],
        model: "llama3-70b-8192" // Using a powerful Llama 3 model
    };

    const headers = {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(apiUrl, payload, { headers });
        
        // Send the AI's response back to the frontend
        res.json(response.data);

    } catch (error) {
        console.error("Error calling Groq API:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
