import { GoogleGenAI, Modality } from "@google/genai";
import { GeneratedContent, PosterLogo, ImageData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      // Path for Poster Generation (subject preservation)
      
      // Step 1: Remove background to isolate subject
      const removeBgPrompt = "Carefully identify the main subject in the image and completely remove the background, replacing it with a transparent background. The output must be a PNG file preserving only the main subject with high fidelity, without any shadows or leftover artifacts from the background.";
      const removeBgResponse = await retryWithBackoff(() => ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: { parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: removeBgPrompt }] },
          config: { responseModalities: [Modality.IMAGE] }
      }));
      const subjectPart = removeBgResponse.candidates?.[0]?.content?.parts?.[0];
      if (!subjectPart?.inlineData?.data) {
          throw new Error("Failed to isolate the main subject. The AI could not remove the background. Try an image with a clearer subject.");
      }
      const subjectImageBase64 = subjectPart.inlineData.data;

      // Step 2: Generate new background from the template prompt
      const bgPrompt = `${prompt}. This image should be a high-quality, visually appealing background. Do NOT include any text, words, or letters. Do not include any people or prominent subjects, as another subject will be placed on top of this background.`;
      
      let imagenAspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1';
      if (width && height) {
          const ratio = width / height;
          const ratios = { '1:1': 1, '3:4': 0.75, '4:3': 4/3, '9:16': 9/16, '16:9': 16/9 };
          const closestRatioKey = Object.keys(ratios).reduce((prev, curr) => 
              Math.abs((ratios as any)[curr] - ratio) < Math.abs((ratios as any)[prev] - ratio) ? curr : prev
          );
          imagenAspectRatio = closestRatioKey as '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
      }

      const bgResponse = await retryWithBackoff(() => ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: bgPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: imagenAspectRatio,
          },
      }));

      const backgroundImageBase64 = bgResponse.generatedImages?.[0]?.image?.imageBytes;
      if (!backgroundImageBase64) {
          throw new Error("Failed to generate a new background image from the template.");
      }

      // Step 3: Composite subject onto background
      const compositePrompt = "Combine the following two images. The first image is the background. The second image is the main subject with a transparent background. Place the subject onto the background naturally. Adjust lighting, shadows, and positioning for a realistic and visually appealing composition. The final image should have the same dimensions as the background image. Do not add any text.";
      
      const compositeResponse = await retryWithBackoff(() => ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: { parts: [
              { inlineData: { data: backgroundImageBase64, mimeType: 'image/png' } },
              { inlineData: { data: subjectImageBase64, mimeType: 'image/png' } },
              { text: compositePrompt }
          ]},
          config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
      }));
      
      let generatedImage: string | null = null;
      let generatedText: string | null = null;
      const compositeParts = compositeResponse.candidates?.[0]?.content?.parts ?? [];
      for (const part of compositeParts) {
          if (part.text) generatedText = (generatedText || '') + part.text;
          else if (part.inlineData) generatedImage = part.inlineData.data;
      }
      
      if (!generatedImage) {
          throw new Error("The model failed to composite the final image. Please try again.");
      }
      return { media: generatedImage, mediaType: 'image', text: "Poster generated successfully." };
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

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
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

export async function mergeImagesWithPrompt(
  prompt: string,
  mainImage: ImageData,
  backgroundImages: ImageData[]
): Promise<GeneratedContent> {
  try {
    const parts: any[] = [];
    
    parts.push({
      inlineData: {
        data: mainImage.base64,
        mimeType: mainImage.mimeType,
      },
    });

    backgroundImages.forEach(bgImage => {
      parts.push({
        inlineData: {
          data: bgImage.base64,
          mimeType: bgImage.mimeType,
        },
      });
    });

    parts.push({ text: prompt });

    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    }));

    let generatedImage: string | null = null;
    let generatedText: string | null = null;

    const responseParts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of responseParts) {
        if (part.text) {
            generatedText = (generatedText || '') + part.text;
        } else if (part.inlineData) {
            generatedImage = part.inlineData.data;
        }
    }
    
    if (!generatedImage) {
        throw new Error("The model did not return a merged image. This might be due to a safety filter. Try a different background or prompt.");
    }

    return { media: generatedImage, mediaType: 'image', text: generatedText };
  } catch (error) {
    console.error("Error calling Gemini API for image merge:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429") || errorMessage.toLowerCase().includes("resource_exhausted")) {
        throw new Error("API quota exceeded. We tried a few times, but the server is busy. This can happen due to high demand or usage limits on the API key. Please try again later.");
    }
    if (error instanceof Error && error.message.includes("The model did not return a merged image")) {
        throw error;
    }
    throw new Error("Failed to merge images. Please check the uploaded images and try again.");
  }
}
