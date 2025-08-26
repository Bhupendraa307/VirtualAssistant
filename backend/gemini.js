import axios from 'axios';

const geminiResponse = async (command, assistantName, userName) => {
    try {
        // Validate required parameters
        if (!command || !assistantName || !userName) {
            throw new Error('Missing required parameters: command, assistantName, or userName');
        }

        const apiUrl = process.env.GEMINI_API_URL;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiUrl || !apiKey) {
            throw new Error('Gemini API configuration is missing. Please check your environment variables.');
        }

        // Enhanced prompt with better structure and examples
        const prompt = `You are a virtual assistant named "${assistantName}" created by "${userName}".

You are NOT Google. You are a voice-enabled AI assistant that helps users with various tasks.

Your task is to understand the user's natural language input and respond with a JSON object in this exact format:

{
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" | "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" | "instagram_open" | "facebook_open" | "weather_show",
  "userInput": "<cleaned user input without your name>",
  "response": "<short, friendly spoken response>"
}

Type meanings:
- "general": factual questions, greetings, or general conversation
- "google_search": user wants to search something on Google
- "youtube_search": user wants to search something on YouTube  
- "youtube_play": user wants to play a specific video/song
- "calculator_open": user wants to open calculator
- "instagram_open": user wants to open Instagram
- "facebook_open": user wants to open Facebook
- "weather_show": user wants weather information
- "get_time": user asks for current time
- "get_date": user asks for today's date
- "get_day": user asks what day it is
- "get_month": user asks for current month

Important rules:
1. If user asks who created you, mention "${userName}"
2. For search queries, extract only the search term in userInput
3. Keep responses short and natural for voice output
4. Always respond with valid JSON only
5. If unsure, use "general" type

User input: "${command}"

Respond with JSON only:`;

        const response = await axios.post(
            `${apiUrl}?key=${apiKey}`,
            {
                contents: [
                    {
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            },
            {
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'VirtualAssistant/1.0'
                },
                timeout: 30000 // 30 second timeout
            }
        );

        // Extract and validate response
        const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error('No response generated from Gemini API');
        }

        // Try to parse JSON response
        try {
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                
                // Validate required fields
                if (!parsed.type || !parsed.userInput || !parsed.response) {
                    throw new Error('Invalid response structure from Gemini');
                }
                
                return generatedText;
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            throw new Error('Invalid response format from AI service');
        }

    } catch (error) {
        console.error("Error in geminiResponse:", error);
        
        // Provide user-friendly error messages
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. Please try again.');
        } else if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please check your API key.');
        } else if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('AI service is temporarily unavailable. Please try again later.');
        } else {
            throw new Error(error.message || 'Failed to get AI response. Please try again.');
        }
    }
};

export default geminiResponse;