const axios = require('axios');

// This function is the serverless replacement for your Express route.
module.exports = async (req, res) => {
    // Vercel automatically handles .env variables, so no need for dotenv
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

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
        model: "llama3-70b-8192"
    };

    const headers = {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(apiUrl, payload, { headers });
        // Send the AI's response back to the frontend
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error calling Groq API:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
};
