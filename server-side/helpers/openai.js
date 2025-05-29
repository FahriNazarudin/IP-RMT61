require("dotenv").config(); 
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

async function getAIResponse(question) {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [
      {
        role: "user",
        content: question,
      }, 
    ],
  });
  return completion.choices[0].message.content;
}
// Helper function to extract keywords from AI response
function extractKeywordsFromResponse(response) {
  // Simple implementation - extract words that might be movie titles or genres
  const words = response.split(/[,.!?:;()\[\]{}""]/);
  return words
    .filter((word) => word.length > 3)
    .map((word) => word.trim())
    .filter(Boolean);
}

module.exports = { getAIResponse, extractKeywordsFromResponse };
