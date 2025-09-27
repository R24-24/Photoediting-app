import React, { useState, useMemo, useEffect } from 'react';
import { ImageData } from '../types';
import { useTranslation } from '../hooks/useTranslation';

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
    const [removeBackground, setRemoveBackground] = useState(false);

    const imageSrc = useMemo(() => `data:${imageData.mimeType};base64,${imageData.base64}`, [imageData]);

    const handlePresetClick = (preset: Preset) => {
        setWidth(preset.width);
        setHeight(preset.height);
        setActivePresetKey(preset.nameKey);
    };

    const handleConfirm = () => {
        setIsProcessing(true);
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                // Draw background color only if not removing background
                if (!removeBackground) {
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, width, height);
                }
                
                // Calculate image position and size to fit (contain)
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
                    mimeType: 'image/png', // Always png from canvas
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
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: removeBackground ? 'transparent' : bgColor, backgroundImage: removeBackground ? `linear-gradient(45deg, #4b5563 25%, transparent 25%), linear-gradient(-45deg, #4b5563 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4b5563 75%), linear-gradient(-45deg, transparent 75%, #4b5563 75%)` : 'none', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
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
                    <div className={`flex items-center gap-2 bg-base-100 p-2 rounded-md transition-opacity ${removeBackground ? 'opacity-50' : ''}`}>
                        <input 
                            type="color" 
                            value={bgColor} 
                            onChange={e => setBgColor(e.target.value)}
                            className="w-8 h-8 p-0 border-none rounded-md cursor-pointer disabled:cursor-not-allowed"
                            disabled={removeBackground}
                        />
                        <input 
                            type="text" 
                            value={bgColor} 
                            onChange={e => setBgColor(e.target.value)} 
                            className="w-full bg-transparent focus:outline-none text-white px-2 font-mono"
                            aria-label="Background color hex code"
                            disabled={removeBackground}
                        />
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 hover:text-white">
                        <input 
                            type="checkbox" 
                            checked={removeBackground}
                            onChange={e => setRemoveBackground(e.target.checked)}
                            className="w-4 h-4 rounded bg-base-100 border-base-300 text-brand-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-primary"
                        />
                        {t('canvas.remove_bg')}
                    </label>
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
