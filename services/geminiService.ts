import { GoogleGenAI, Modality } from "@google/genai";
import { GeneratedContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

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

    return { media: generatedImage, mediaType: 'image', text: generatedText };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image. Please check your prompt and try again.");
  }
}


export async function generateVideoFromImage(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<GeneratedContent> {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: `${prompt}, 3 second seamless loop, high quality`,
      image: {
        imageBytes: base64ImageData,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation failed to produce a valid output.");
    }

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download the generated video. Status: ${videoResponse.status}`);
    }
    
    const videoBlob = await videoResponse.blob();
    const videoBase64 = await blobToBase64(videoBlob);

    return {
      media: videoBase64,
      mediaType: 'video',
      text: `Animated GIF for: ${prompt}`,
    };

  } catch (error) {
    console.error("Error calling Veo API:", error);
    throw new Error("Failed to generate video. This feature is experimental and may not always succeed. Please try a different prompt.");
  }
}