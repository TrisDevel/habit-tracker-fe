import axios from "axios";

const OPENAI_API_KEY = "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"; // Replace with your OpenAI API key
const API_URL = "https://api.openai.com/v1/chat/completions";

export const aiService = {
  getHabitInsights: async (habitData) => {
    try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4",
        messages: [
        {
          role: "system",
          content:
            "You are an expert in habits and personal development.",
        },
        {
          role: "user",
          content: `
            Name: ${habitData.name}
            Description: ${habitData.description}
            Completion rate: ${habitData.completionRate}%

            Based on the data, please analyze and provide:
            - 3 short tips for improvement (under 50 characters each)
            - extremely motivational encouragement sentence  (in " ") 
          `,
        },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        },
      }
    );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("AI Service Error:", error);
      return "Unable to generate insights at this time.";
    }
  },
};
