import { GoogleGenAI, Modality } from "@google/genai";
import { GeneratedContent, PosterLogo, ImageData } from '../types';

const API_KEY = "AIzaSyDeeF_m5XKE2uphF8tT4KZojmk6YFP9zQU";

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * A utility function to retry an async operation with exponential backoff.
 * This is useful for handling rate limit errors (429).
 * @param fn The async function to execute.
 * @param retries Number of retries.
 * @param delay The initial delay in milliseconds.
 * @returns The result of the async function.
 */
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      const errorMessage = String(error);
      const isRateLimitError = errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429") || errorMessage.toLowerCase().includes("resource_exhausted");

      if (isRateLimitError) {
        console.warn(`Rate limit error detected. Retrying in ${delay / 1000}s... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2); // Exponential backoff
      }
    }
    throw error; // Rethrow if not a rate limit error or retries are exhausted
  }
}

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
  maskBase64: string | null,
  logo: PosterLogo | null,
  width?: number,
  height?: number
): Promise<GeneratedContent> {
  try {
    if (maskBase64) {
      // Path for "Magic Edit" (inpainting)
      const imagePart = { inlineData: { data: base64ImageData, mimeType } };
      const textPart = { text: prompt };
      const maskPart = { inlineData: { data: maskBase64, mimeType: 'image/png' } };
      
      const response = await retryWithBackoff(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, maskPart, textPart] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      }));

      let generatedImage: string | null = null;
      let generatedText: string | null = null;
      const responseParts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of responseParts) {
        if (part.text) generatedText = (generatedText || '') + part.text;
        else if (part.inlineData) generatedImage = part.inlineData.data;
      }
      if (!generatedImage && !generatedText) throw new Error("The model did not return any content for magic edit.");
      return { media: generatedImage, mediaType: 'image', text: generatedText };

    } else {
      // Path for Poster Generation (subject preservation) - OPTIMIZED to 1 API call
      
      const finalPrompt = `Carefully identify the main subject in the provided image. Your task is to replace ONLY the background with a new one based on the following description: '${prompt}'. The original subject must be perfectly preserved without any changes and seamlessly composited onto the new background. Ensure the final composition is realistic. Do not add any text.`;
      
      const imagePart = { inlineData: { data: base64ImageData, mimeType } };
      const textPart = { text: finalPrompt };

      const response = await retryWithBackoff(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      }));
      
      let generatedImage: string | null = null;
      let generatedText: string | null = null;
      const responseParts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of responseParts) {
          if (part.text) generatedText = (generatedText || '') + part.text;
          else if (part.inlineData) generatedImage = part.inlineData.data;
      }
      
      if (!generatedImage) {
          throw new Error("The model failed to generate the poster. This might be due to a safety filter or content policy. Please try a different template or image.");
      }
      return { media: generatedImage, mediaType: 'image', text: generatedText ?? "Poster generated successfully." };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429") || errorMessage.toLowerCase().includes("resource_exhausted")) {
        throw new Error("API quota exceeded. We tried a few times, but the server is busy. This can happen due to high demand or usage limits on the API key. Please try again later.");
    }
    throw new Error(`Failed to generate image: ${errorMessage}`);
  }
}

export async function generateVideoFromImage(
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  width?: number,
  height?: number
): Promise<GeneratedContent> {
  try {
    let animationPrompt = `Create a 3-second looping video from the image. The main subject of the original photo should remain mostly static. Animate the background with subtle motion (like gentle zoom, pan, or particle effects) and animate any text elements with a simple, elegant effect (like a gentle fade-in or shimmer).`;

    if (width && height) {
        animationPrompt += ` The output video resolution must be exactly ${width} pixels wide and ${height} pixels high. Do not alter the aspect ratio.`;
    } else {
        animationPrompt += ` Maintain the original aspect ratio.`;
    }

    animationPrompt += ` ${prompt}`;

    let operation = await retryWithBackoff(() => ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: animationPrompt,
      image: {
        imageBytes: base64ImageData,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1
      }
    }));

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await retryWithBackoff(() => ai.operations.getVideosOperation({ operation: operation }));
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation failed to produce a valid output.");
    }

    const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download the generated video. Status: ${videoResponse.status}`);
    }
    
    const videoBlob = await videoResponse.blob();
    const videoBase64 = await blobToBase64(videoBlob);

    return {
      media: videoBase64,
      mediaType: 'video',
      text: `Animated media for: ${prompt}`,
    };

  } catch (error) {
    console.error("Error calling Veo API:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota") || errorMessage.toLowerCase().includes("resource_exhausted")) {
        throw new Error("API quota exceeded. We tried a few times, but the server is busy. This can happen due to high demand or usage limits on the API key. Please try again later.");
    }
    throw new Error("Failed to generate video. This feature is experimental and may not always succeed. Please try a different prompt.");
  }
}

export async function removeImageBackground(
  base64ImageData: string,
  mimeType: string
): Promise<string> {
  try {
    const prompt = "Isolate the main subject of the image, remove the background completely, and provide the output as a PNG with a transparent background. Do not add any extra elements or change the subject.";

    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { text: prompt };

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [imagePart, textPart] },
      config: { responseModalities: [Modality.IMAGE] },
    }));

    const responseParts = response.candidates?.[0]?.content?.parts ?? [];
    let generatedImage: string | null = null;
    for (const part of responseParts) {
      if (part.inlineData) {
        generatedImage = part.inlineData.data;
        break;
      }
    }

    if (!generatedImage) {
      throw new Error("The model failed to remove the background. This might be due to a safety filter or content policy.");
    }

    return generatedImage;

  } catch (error) {
    console.error("Error calling Gemini API for background removal:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429") || errorMessage.toLowerCase().includes("resource_exhausted")) {
      throw new Error("API quota exceeded. We tried a few times, but the server is busy. Please try again later.");
    }
    throw new Error(`Failed to remove background: ${errorMessage}`);
  }
}
