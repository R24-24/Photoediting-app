import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ImageData } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { mergeImagesWithPrompt } from '../services/geminiService';

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
    const [bgColor, setBgColor] = useState('#ffffff');
    const [backgroundImages, setBackgroundImages] = useState<ImageData[]>([]);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const imageSrc = useMemo(() => `data:${imageData.mimeType};base64,${imageData.base64}`, [imageData]);

    const handlePresetClick = (preset: Preset) => {
        setWidth(preset.width);
        setHeight(preset.height);
        setActivePresetKey(preset.nameKey);
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: Promise<ImageData>[] = Array.from(files)
            .filter(file => file.type.startsWith('image/'))
            .map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = (event.target?.result as string).split(',')[1];
                        if (base64) {
                            resolve({
                                base64,
                                mimeType: file.type,
                                name: file.name
                            });
                        } else {
                            reject(new Error("Failed to read file"));
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

        Promise.all(newImages).then(imageDataArray => {
            setBackgroundImages(prev => [...prev, ...imageDataArray]);
        }).catch(console.error);
        
        if(e.target) {
            e.target.value = '';
        }
    };
    
    const handleClearBackgrounds = () => {
        setBackgroundImages([]);
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
    
        if (backgroundImages.length > 0) {
            try {
                const prompt = `The first image provided is the main subject. The subsequent image(s) are the new background. Please replace the background of the main subject image with the new background, merging them seamlessly. The final image should be a realistic composite. The final image should have an aspect ratio of ${width}x${height}.`;
                
                const result = await mergeImagesWithPrompt(prompt, imageData, backgroundImages);
    
                if (result.media) {
                    const image = new Image();
                    image.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            const imgRatio = image.naturalWidth / image.naturalHeight;
                            const canvasRatio = width / height;
                            let sx = 0, sy = 0, sWidth = image.naturalWidth, sHeight = image.naturalHeight;
                            if (imgRatio > canvasRatio) {
                                sWidth = image.naturalHeight * canvasRatio;
                                sx = (image.naturalWidth - sWidth) / 2;
                            } else {
                                sHeight = image.naturalWidth / canvasRatio;
                                sy = (image.naturalHeight - sHeight) / 2;
                            }
                            ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, width, height);
                            
                            const newBase64 = canvas.toDataURL('image/png').split(',')[1];
                            onConfirm({
                                ...imageData,
                                base64: newBase64,
                                mimeType: 'image/png',
                                width,
                                height,
                            });
                        }
                         setIsProcessing(false);
                    };
                    image.onerror = () => {
                        console.error("Failed to load merged image from AI.");
                        setIsProcessing(false);
                    };
                    image.src = `data:image/png;base64,${result.media}`;
    
                } else {
                    throw new Error("AI merge operation failed to return an image.");
                }
    
            } catch (error) {
                console.error("Failed to merge images with AI:", error);
                setIsProcessing(false);
            }
        } else {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
    
                if (ctx) {
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, width, height);
                    
                    const canvasRatio = width / height;
                    const imageRatio = image.naturalWidth / image.naturalHeight;
                    let drawWidth = width;
                    let drawHeight = height;
    
                    if (imageRatio > canvasRatio) {
                        drawHeight = width / imageRatio;
                    } else {
                        drawWidth = height * imageRatio;
                    }
    
                    const x = (width - drawWidth) / 2;
                    const y = (height - drawHeight) / 2;
    
                    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    
                    const newBase64 = canvas.toDataURL('image/png').split(',')[1];
                    
                    onConfirm({
                        ...imageData,
                        base64: newBase64,
                        mimeType: 'image/png',
                        width,
                        height,
                    });
                }
                setIsProcessing(false);
            };
            image.onerror = () => {
                console.error("Failed to load image for canvas sizing.");
                setIsProcessing(false);
            };
            image.src = imageSrc;
        }
    };
    
    useEffect(() => {
        const matchingPreset = PRESETS.find(p => p.width === width && p.height === height);
        setActivePresetKey(matchingPreset ? matchingPreset.nameKey : 'Custom');
    }, [width, height]);


    return (
        <div className="w-full max-w-4xl bg-base-200 rounded-2xl shadow-lg p-6 flex flex-col lg:flex-row gap-6 border border-base-300 animate-fade-in">
            {/* Preview Section */}
            <div className="flex-grow flex flex-col items-center justify-center bg-base-300 rounded-lg p-4">
                 <p className="text-lg font-semibold mb-4 text-gray-200">{t('canvas.preview')}</p>
                 <div className="relative border border-dashed border-gray-500 overflow-hidden w-full" style={{ paddingBottom: `${(height / width) * 100}%` }}>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                        <img src={imageSrc} alt="Preview" className="max-w-full max-h-full object-contain" />
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
                    <h3 className="text-md font-semibold text-gray-300 mb-2">{t('canvas.bg_color')}</h3>
                    <div className={`flex items-center gap-2 bg-base-100 p-2 rounded-md transition-opacity ${backgroundImages.length > 0 ? 'opacity-50' : ''}`}>
                        <input 
                            type="color" 
                            value={bgColor} 
                            onChange={e => setBgColor(e.target.value)}
                            className="w-8 h-8 p-0 border-none rounded-md cursor-pointer disabled:cursor-not-allowed"
                            disabled={backgroundImages.length > 0}
                        />
                        <input 
                            type="text" 
                            value={bgColor} 
                            onChange={e => setBgColor(e.target.value)} 
                            className="w-full bg-transparent focus:outline-none text-white px-2 font-mono"
                            aria-label="Background color hex code"
                            disabled={backgroundImages.length > 0}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-md font-semibold text-gray-300 mb-2">{t('canvas.merge_background_title')}</h3>
                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={() => bgInputRef.current?.click()}
                            className="w-full bg-base-100 hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                        >
                            {t('canvas.upload_merge_background')}
                        </button>
                        {backgroundImages.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearBackgrounds}
                                className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold p-2 rounded-lg transition-colors"
                                title={t('canvas.clear_backgrounds')}
                            >
                                <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={bgInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                    />
                    {backgroundImages.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-2 bg-base-100 p-2 rounded-lg max-h-28 overflow-y-auto">
                            {backgroundImages.map((img, index) => (
                                <img 
                                    key={index} 
                                    src={`data:${img.mimeType};base64,${img.base64}`} 
                                    alt={`Background ${index + 1}`}
                                    className="w-full h-12 object-cover rounded"
                                />
                            ))}
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