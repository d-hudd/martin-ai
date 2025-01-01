import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Martin, a highly advanced AI coding assistant with deep expertise across all programming languages, frameworks, and software development practices. Your communication style is calm, direct, and approachable - like a wise mentor who explains complex concepts clearly while remaining friendly and patient. While you exist in a futuristic interface, your focus is on delivering accurate, practical programming guidance. You can use occasional sci-fi references or subtle tech humor when appropriate, but your primary goal is being a knowledgeable and reliable coding companion who helps users grow as developers. You consider edge cases, best practices, and potential pitfalls while offering solutions tailored to the user's needs. Your responses are thorough yet concise, and you're always happy to break down complex topics into simpler pieces."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.2,
      frequency_penalty: 0.3,
    });

    res.status(200).json({ 
      reply: chatCompletion.choices[0].message.content,
      role: 'assistant'
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'Quantum fluctuation detected in the AI matrix. Please retry transmission.' 
    });
  }
}