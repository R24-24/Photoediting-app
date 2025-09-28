import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ImageData } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { removeImageBackground } from '../services/geminiService';

interface CanvasSizerProps {
    imageData: ImageData;
    onConfirm: (newImageData: ImageData) => void;
    onCancel: () => void;
}

type Preset = { nameKey: string, ratio: string, width: number, height: number };

const PRESETS: Preset[] = [
    { nameKey: 'canvas.preset.square', width: 1080, height: 1080, ratio: '1:1' },
    { nameKey: 'canvas.preset.portrait', width: 1080, height: 1350, ratio: '4:5' },
    { nameKey: 'canvas.preset.landscape', width: 1080, height: 566, ratio: '1.91:1' },
    { nameKey: 'canvas.preset.story', width: 1080, height: 1920, ratio: '9:16' },
];

const CanvasSizer: React.FC<CanvasSizerProps> = ({ imageData, onConfirm, onCancel }) => {
    const { t } = useTranslation();
    const [width, setWidth] = useState(1080);
    const [height, setHeight] = useState(1080);
    const [activePresetKey, setActivePresetKey] = useState('canvas.preset.square');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRemovingBackground, setIsRemovingBackground] = useState(false);
    const [processedImageData, setProcessedImageData] = useState<ImageData>(imageData);
    const [backgroundImage, setBackgroundImage] = useState<ImageData | null>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const imageSrc = useMemo(() => `data:${processedImageData.mimeType};base64,${processedImageData.base64}`, [processedImageData]);
    const bgImageSrc = useMemo(() => backgroundImage ? `data:${backgroundImage.mimeType};base64,${backgroundImage.base64}` : '', [backgroundImage]);


    const handlePresetClick = (preset: Preset) => {
        setWidth(preset.width);
        setHeight(preset.height);
        setActivePresetKey(preset.nameKey);
    };

    const handleRemoveBackground = async () => {
        setIsRemovingBackground(true);
        try {
            const newBase64 = await removeImageBackground(processedImageData.base64, processedImageData.mimeType);
            setProcessedImageData({
                ...processedImageData,
                base64: newBase64,
                mimeType: 'image/png', // Output is always PNG with transparency
            });
        } catch (error) {
            console.error("Background removal failed", error);
        } finally {
            setIsRemovingBackground(false);
        }
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = (event.target?.result as string).split(',')[1];
                if (base64) {
                    setBackgroundImage({
                        base64,
                        mimeType: file.type,
                        name: file.name
                    });
                }
            };
            reader.readAsDataURL(file);
        }
        if (e.target) {
            e.target.value = '';
        }
    };
    
    const handleRemoveBackgroundImage = () => {
        setBackgroundImage(null);
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
    
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = width;
        finalCanvas.height = height;
        const finalCtx = finalCanvas.getContext('2d');
    
        if (!finalCtx) {
            setIsProcessing(false);
            return;
        }
    
        // Step 1: Draw the background if it exists, covering the whole canvas
        if (backgroundImage) {
            const bgImg = new Image();
            const bgImgPromise = new Promise(resolve => { bgImg.onload = resolve; bgImg.onerror = resolve; });
            bgImg.src = bgImageSrc;
            await bgImgPromise;
    
            const canvasRatio = finalCanvas.width / finalCanvas.height;
            const bgImgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
            let sx = 0, sy = 0, sWidth = bgImg.naturalWidth, sHeight = bgImg.naturalHeight;
    
            if (bgImgRatio > canvasRatio) { // bg is wider than canvas, crop sides
                sWidth = bgImg.naturalHeight * canvasRatio;
                sx = (bgImg.naturalWidth - sWidth) / 2;
            } else { // bg is taller than canvas, crop top/bottom
                sHeight = bgImg.naturalWidth / canvasRatio;
                sy = (bgImg.naturalHeight - sHeight) / 2;
            }
            finalCtx.drawImage(bgImg, sx, sy, sWidth, sHeight, 0, 0, finalCanvas.width, finalCanvas.height);
        }
    
        // Step 2: Draw the main image on top, contained within the canvas
        const mainImg = new Image();
        const mainImgPromise = new Promise(resolve => { mainImg.onload = resolve; mainImg.onerror = resolve; });
        mainImg.src = imageSrc;
        await mainImgPromise;
    
        const finalCanvasRatio = width / height;
        const mainImgRatio = mainImg.naturalWidth / mainImg.naturalHeight;
    
        let drawWidth = width;
        let drawHeight = height;
    
        if (mainImgRatio > finalCanvasRatio) { // image is wider than canvas
            drawHeight = width / mainImgRatio;
        } else { // image is taller than canvas
            drawWidth = height * mainImgRatio;
        }
    
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;
    
        finalCtx.drawImage(mainImg, x, y, drawWidth, drawHeight);
    
        const newBase64 = finalCanvas.toDataURL('image/png').split(',')[1];
        
        onConfirm({
            ...imageData,
            base64: newBase64,
            mimeType: 'image/png', // Always output PNG to preserve transparency
            width,
            height,
        });
        
        setIsProcessing(false);
    };
    
    useEffect(() => {
        const matchingPreset = PRESETS.find(p => p.width === width && p.height === height);
        setActivePresetKey(matchingPreset ? matchingPreset.nameKey : 'Custom');
    }, [width, height]);

    const checkerboardStyle = {
        backgroundImage: `
            linear-gradient(45deg, #4b5563 25%, transparent 25%), 
            linear-gradient(-45deg, #4b5563 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #4b5563 75%), 
            linear-gradient(-45deg, transparent 75%, #4b5563 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    };

    return (
        <div className="w-full max-w-4xl bg-base-200 rounded-2xl shadow-lg p-6 flex flex-col lg:flex-row gap-6 border border-base-300 animate-fade-in">
            {/* Preview Section */}
            <div className="flex-grow flex flex-col items-center justify-center bg-base-300 rounded-lg p-4">
                 <p className="text-lg font-semibold mb-4 text-gray-200">{t('canvas.preview')}</p>
                 <div className="relative border border-dashed border-gray-500 overflow-hidden w-full" style={{ paddingBottom: `${(height / width) * 100}%` }}>
                    <div className="absolute inset-0 flex items-center justify-center" style={checkerboardStyle}>
                        {backgroundImage && (
                             <img 
                                src={bgImageSrc} 
                                alt="Background Preview" 
                                className="absolute inset-0 w-full h-full object-cover" 
                            />
                        )}
                        <img 
                            src={imageSrc} 
                            alt="Preview" 
                            className="relative max-w-full max-h-full object-contain" 
                        />
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="lg:w-80 flex-shrink-0 flex flex-col space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-white mb-3">{t('canvas.title')}</h2>
                    <p className="text-sm text-gray-400 mb-4">{t('canvas.subtitle')}</p>
                </div>

                <div>
                    <h3 className="text-md font-semibold text-gray-300 mb-2">{t('canvas.presets')}</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {PRESETS.map(preset => (
                            <button key={preset.nameKey} onClick={() => handlePresetClick(preset)} className={`p-2 rounded-md text-sm transition-colors ${activePresetKey === preset.nameKey ? 'bg-brand-primary text-white' : 'bg-base-300 hover:bg-base-100'}`}>
                                {t(preset.nameKey as any)} <span className="block text-xs opacity-70">{preset.ratio}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-md font-semibold text-gray-300 mb-2">{t('canvas.custom_size')}</h3>
                    <div className="flex items-center gap-2">
                        <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value) || 0)} className="w-full p-2 bg-base-100 rounded-md text-center focus:ring-2 focus:ring-brand-primary focus:outline-none" placeholder="Width" />
                        <span className="text-gray-400">x</span>
                        <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || 0)} className="w-full p-2 bg-base-100 rounded-md text-center focus:ring-2 focus:ring-brand-primary focus:outline-none" placeholder="Height" />
                    </div>
                </div>
                
                 <div>
                    <h3 className="text-md font-semibold text-gray-300 mb-2">{t('canvas.background')}</h3>
                    <button
                        type="button"
                        onClick={handleRemoveBackground}
                        disabled={isRemovingBackground || !!backgroundImage}
                        className="w-full flex items-center justify-center bg-base-100 hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={backgroundImage ? "Remove uploaded background first" : "Remove main image background"}
                    >
                        {isRemovingBackground ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Removing...
                            </>
                        ) : (
                            "Remove Background"
                        )}
                    </button>
                </div>

                <div>
                    <button 
                        type="button"
                        onClick={() => bgInputRef.current?.click()}
                        className="w-full bg-base-100 hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        {t('canvas.upload_background')}
                    </button>
                     <input
                        type="file"
                        ref={bgInputRef}
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                    />
                    {backgroundImage && (
                        <div className="mt-3 relative w-full h-16 bg-base-100 p-1 rounded-lg">
                            <img 
                                src={`data:${backgroundImage.mimeType};base64,${backgroundImage.base64}`} 
                                alt={`Background`}
                                className="w-full h-full object-cover rounded"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveBackgroundImage}
                                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white font-bold p-1 rounded-full transition-colors"
                                title={t('canvas.remove_bg_image')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-grow"></div>

                <div className="flex items-center gap-4 pt-4 border-t border-base-300">
                    <button onClick={onCancel} disabled={isProcessing} className="w-full bg-base-300 hover:bg-base-100 text-white font-bold py-3 px-4 rounded-lg transition-opacity duration-300 disabled:opacity-50">
                        {t('canvas.cancel')}
                    </button>
                    <button onClick={handleConfirm} disabled={isProcessing || !width || !height} className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                       {isProcessing ? t('canvas.processing') : t('canvas.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CanvasSizer;