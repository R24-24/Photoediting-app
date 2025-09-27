import React, { useState, useCallback } from 'react';
import { GeneratedContent, ImageData } from './types';
import { editImageWithPrompt, generateVideoFromImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import Editor from './components/Editor';
import PosterDisplay from './components/PosterDisplay';
import Header from './components/Header';
import Loader from './components/Loader';
import CanvasSizer from './components/CanvasSizer';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [imageToSize, setImageToSize] = useState<ImageData | null>(null);
  const [isSizingCanvas, setIsSizingCanvas] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingType, setLoadingType] = useState<'image' | 'video'>('image');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (imageData: ImageData) => {
    setImageToSize(imageData);
    setIsSizingCanvas(true);
    setGeneratedContent(null);
    setError(null);
  };
  
  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setImageToSize(null);
    setIsSizingCanvas(false);
    setGeneratedContent(null);
    setError(null);
    setIsLoading(false);
  }, []);
  
  const handleCanvasConfirm = useCallback((newImageData: ImageData) => {
    setOriginalImage(newImageData);
    setImageToSize(null);
    setIsSizingCanvas(false);
  }, []);

  const handleCancelSizing = useCallback(() => {
    setImageToSize(null);
    setIsSizingCanvas(false);
  }, []);

  const handleGenerate = useCallback(async (prompt: string, outputType: 'Image' | 'Video') => {
    if (!originalImage) {
      setError("Please upload an image first.");
      return;
    }

    setLoadingType(outputType === 'Image' ? 'image' : 'video');
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      if (outputType === 'Video') {
        const result = await generateVideoFromImage(originalImage.base64, originalImage.mimeType, prompt, originalImage.width, originalImage.height);
        setGeneratedContent(result);
      } else { // 'Image'
        const result = await editImageWithPrompt(originalImage.base64, originalImage.mimeType, prompt, null);
        setGeneratedContent(result);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Generation failed: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage]);

  const showResetButton = !!originalImage || isSizingCanvas;

  return (
    <div className="min-h-screen bg-base-100 font-sans flex flex-col">
      <Header onReset={handleReset} showReset={showResetButton}/>
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
        {!originalImage && !isSizingCanvas && (
          <ImageUploader onImageUpload={handleImageUpload} />
        )}

        {isSizingCanvas && imageToSize && (
            <CanvasSizer 
                imageData={imageToSize}
                onConfirm={handleCanvasConfirm}
                onCancel={handleCancelSizing}
            />
        )}

        {originalImage && !isSizingCanvas && (
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Editor 
              originalImage={originalImage}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            <div className="bg-base-200 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 min-h-[400px] lg:min-h-[600px] border border-base-300">
              {isLoading && <Loader loadingType={loadingType} />}
              {error && (
                <div className="text-center text-red-400">
                  <h3 className="text-xl font-bold mb-2">Error</h3>
                  <p>{error}</p>
                </div>
              )}
              {!isLoading && !error && generatedContent && (
                 <PosterDisplay 
                    generatedContent={generatedContent} 
                    originalImageName={originalImage.name}
                />
              )}
              {!isLoading && !error && !generatedContent && (
                <div className="text-center text-gray-400">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M12 14.5v5.714c0 .597.237 1.17.659 1.591L17.25 21M12 14.5c-.251.023-.501.05-.75.082M7.5 12.572c.622.069 1.25.107 1.885.107L12 12.68v5.714a2.25 2.25 0 01-.659 1.591L7.5 21M5 10.25a2.25 2.25 0 012.25-2.25h.5a2.25 2.25 0 012.25 2.25v.25M19 10.25a2.25 2.25 0 00-2.25-2.25h-.5a2.25 2.25 0 00-2.25 2.25v.25" />
                   </svg>
                  <h3 className="text-xl font-semibold">Your Creation Awaits</h3>
                  <p className="mt-2 max-w-sm">Use the tools to edit your image, or enter a prompt to generate a poster. Your results will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;