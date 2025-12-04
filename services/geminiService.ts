import { GoogleGenAI, Type } from "@google/genai";
import { GestureType } from "../types";

// Initialize GenAI
// Note: API Key must be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeGestureFrame = async (base64Image: string): Promise<GestureType> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found for Gemini");
    return GestureType.NONE;
  }

  try {
    const prompt = `
      Analyze the hand gesture. Return JSON.
      - OPEN_PALM (fingers spread)
      - CLOSED_FIST
      - PINCH (thumb+index)
      - NONE
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gesture: {
              type: Type.STRING,
              enum: ["OPEN_PALM", "CLOSED_FIST", "PINCH", "NONE"]
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return GestureType.NONE;

    const data = JSON.parse(text);
    return data.gesture as GestureType;

  } catch (error) {
    // Re-throw to allow controller to handle backoff
    throw error;
  }
};