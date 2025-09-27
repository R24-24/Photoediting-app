import { GoogleGenAI, Modality } from "@google/genai";
import { GeneratedContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function editImageWithPrompt(
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  maskBase64: string | null
): Promise<GeneratedContent> {
  try {
    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    const textPart = { text: prompt };

    const parts: any[] = [imagePart, textPart];

    if (maskBase64) {
      const maskPart = {
        inlineData: {
          data: maskBase64,
          mimeType: 'image/png',
        }
      };
      parts.splice(1, 0, maskPart); // Insert mask between image and prompt
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let generatedImage: string | null = null;
    let generatedText: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                generatedText = (generatedText || '') + part.text;
            } else if (part.inlineData) {
                generatedImage = part.inlineData.data;
            }
        }
    }
    
    if (!generatedImage && !generatedText) {
        throw new Error("The model did not return any content. Try a different prompt.");
    }

    return { image: generatedImage, text: generatedText };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image. Please check your prompt and try again.");
  }
}
