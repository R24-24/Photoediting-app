import React, { useState, useCallback, useEffect } from 'react';
import { GeneratedContent, ImageData, PosterLogo, Purchase } from './types';
import { editImageWithPrompt, generateVideoFromImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import Editor from './components/Editor';
import PosterDisplay from './components/PosterDisplay';
import Header from './components/Header';
import Loader from './components/Loader';
import CanvasSizer from './components/CanvasSizer';
import { useLanguage } from './context/LanguageContext';
import { useTranslation } from './hooks/useTranslation';
import Auth from './components/Auth';
import PurchaseHistoryModal from './components/PurchaseHistoryModal';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [imageToSize, setImageToSize] = useState<ImageData | null>(null);
  const [isSizingCanvas, setIsSizingCanvas] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingType, setLoadingType] = useState<'image' | 'video'>('image');
  const [error, setError] = useState<string | null>(null);
  
  const [tokens, setTokens] = useState<number>(3);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const { language } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated || !lockoutEndTime) {
        setTimeUntilReset('');
        return;
    }

    const intervalId = setInterval(() => {
        const now = Date.now();
        const timeLeft = lockoutEndTime - now;

        if (timeLeft <= 0) {
            setTokens(prev => {
                const newTokens = prev + 3;
                localStorage.setItem('tokens', String(newTokens));
                return newTokens;
            });
            setLockoutEndTime(null);
            localStorage.removeItem('lockoutEndTime');
            setTimeUntilReset('');
            clearInterval(intervalId);
        } else {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            setTimeUntilReset(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, lockoutEndTime]);


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
  }, []);

  const handleSignInSuccess = () => {
    setIsAuthenticated(true);
    const storedTokens = localStorage.getItem('tokens');
    const storedLockoutTime = localStorage.getItem('lockoutEndTime');
    const storedHistory = localStorage.getItem('purchaseHistory');

    const lockoutTime = storedLockoutTime ? parseInt(storedLockoutTime, 10) : null;

    if (lockoutTime && Date.now() >= lockoutTime) {
      const currentTokens = storedTokens ? parseInt(storedTokens, 10) : 0;
      const newTokens = currentTokens + 3;
      setTokens(newTokens);
      localStorage.setItem('tokens', String(newTokens));
      setLockoutEndTime(null);
      localStorage.removeItem('lockoutEndTime');
    } else {
      setTokens(storedTokens ? parseInt(storedTokens, 10) : 3);
      setLockoutEndTime(lockoutTime);
    }
    setPurchaseHistory(storedHistory ? JSON.parse(storedHistory) : []);
  };

  const handleSignOut = useCallback(() => {
    setOriginalImage(null);
    setImageToSize(null);
    setIsSizingCanvas(false);
    setGeneratedContent(null);
    setError(null);
    setIsLoading(false);
    setIsAuthenticated(false);
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

  const handleGenerate = useCallback(async (prompt: string, outputType: 'Image' | 'Video', logoForPoster: PosterLogo | null) => {
    if (tokens <= 0) {
      return;
    }
    if (!originalImage) {
      setError("Please upload an image first.");
      return;
    }

    setLoadingType(outputType === 'Image' ? 'image' : 'video');
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    const originalTokenCount = tokens;
    const newTokenCount = originalTokenCount - 1;
    setTokens(newTokenCount);
    localStorage.setItem('tokens', String(newTokenCount));

    if (newTokenCount === 0) {
        const newLockoutEndTime = Date.now() + 24 * 60 * 60 * 1000;
        setLockoutEndTime(newLockoutEndTime);
        localStorage.setItem('lockoutEndTime', String(newLockoutEndTime));
    }

    try {
      if (outputType === 'Video') {
        const result = await generateVideoFromImage(originalImage.base64, originalImage.mimeType, prompt, originalImage.width, originalImage.height);
        setGeneratedContent(result);
      } else { // 'Image'
        const result = await editImageWithPrompt(
            originalImage.base64, 
            originalImage.mimeType, 
            prompt, 
            null, 
            logoForPoster,
            originalImage.width,
            originalImage.height
        );
        setGeneratedContent(result);
      }
    } catch (e) {
      setTokens(originalTokenCount);
      localStorage.setItem('tokens', String(originalTokenCount));
      // If we just entered lockout on this failed attempt, cancel it
      if (newTokenCount === 0 && lockoutEndTime) {
        setLockoutEndTime(null);
        localStorage.removeItem('lockoutEndTime');
      }
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Generation failed: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, tokens, lockoutEndTime]);
  
  const handleBuyTokens = useCallback((tokensToAdd: number, amount: number) => {
    const newTokens = tokens + tokensToAdd;
    setTokens(newTokens);
    localStorage.setItem('tokens', String(newTokens));

    const newPurchase: Purchase = {
        date: new Date().toISOString(),
        tokens: tokensToAdd,
        amount,
    };
    const updatedHistory = [newPurchase, ...purchaseHistory];
    setPurchaseHistory(updatedHistory);
    localStorage.setItem('purchaseHistory', JSON.stringify(updatedHistory));
  }, [tokens, purchaseHistory]);


  const fontClass = language === 'en' ? 'font-sans' : 'font-devanari';

  return (
    <div className={`min-h-screen bg-base-100 ${fontClass} flex flex-col`}>
      <Header 
        onSignOut={handleSignOut} 
        showSignOut={isAuthenticated} 
        tokens={tokens} 
        timeUntilReset={timeUntilReset}
        onShowHistory={() => setIsHistoryModalOpen(true)}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
        {!isAuthenticated ? (
            <Auth onSignInSuccess={handleSignInSuccess} />
        ) : (
            <>
                <PurchaseHistoryModal 
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    history={purchaseHistory}
                />
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
                      onReset={handleReset}
                      tokens={tokens}
                      timeUntilReset={timeUntilReset}
                      onBuyTokens={handleBuyTokens}
                    />
                    <div className="bg-base-200 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 min-h-[400px] lg:min-h-[600px] border border-base-300">
                      {isLoading && <Loader loadingType={loadingType} />}
                      {error && (
                        <div className="text-center text-red-400">
                          <h3 className="text-xl font-bold mb-2">{t('error.title')}</h3>
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
                          <h3 className="text-xl font-semibold">{t('display.creation_awaits')}</h3>
                          <p className="mt-2 max-w-sm">{t('display.creation_awaits_desc')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </>
        )}
      </main>
    </div>
  );
};

export default App;
