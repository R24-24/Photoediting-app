import React, { useState, useEffect } from 'react';
import { ImageData, PosterLogo, CustomTextConfig } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useTemplates, Template } from '../i18n/templates';

interface EditorProps {
  originalImage: ImageData;
  onGenerate: (prompt: string, outputType: OutputType, logoForPoster: PosterLogo | null, customTextConfig: CustomTextConfig | null) => void;
  isLoading: boolean;
}

const styleTemplates = [
    { name: 'Cinematic', prompt: 'cinematic style, dramatic lighting, high detail' },
    { name: 'Vintage', prompt: 'vintage photo, grainy, faded colors, retro look' },
    { name: 'Neon', prompt: 'neon punk style, vibrant glowing colors, dark background' },
    { name: '3D Render', prompt: '3d render, octane render, high quality' },
    { name: 'Watercolor', prompt: 'watercolor painting style, soft edges, vibrant washes of color' },
    { name: 'Pop Art', prompt: 'pop art style, bold outlines, vibrant flat colors, halftone dots' },
    { name: 'Fantasy', prompt: 'fantasy art style, ethereal lighting, magical elements, enchanted atmosphere' },
];

type OutputType = 'Image' | 'Video';

const Editor: React.FC<EditorProps> = ({ originalImage, onGenerate, isLoading }) => {
  const { t } = useTranslation();
  const { eventTemplates, festivalTemplates } = useTemplates();
  
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'event' | 'festival'>('event');
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<OutputType>('Image');
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(48);

  useEffect(() => {
    // Reset active template when switching tabs
    setActiveTemplate(null);
  }, [activeTemplateTab]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    let finalPrompt = activeTemplate.prompt;

    if (activeStyle) {
      finalPrompt += `, with a ${activeStyle}`;
    }

    // This is the crucial instruction to prevent the AI from adding any text.
    finalPrompt += '. IMPORTANT: Do NOT add any text, words, or letters to the image. The final output should be a poster with only the image content, without any text overlay. Focus only on the visual style and elements described in the prompt.';
    
    const customTextConfig: CustomTextConfig | null = customText.trim() 
        ? { text: customText, color: textColor, fontSize }
        : null;

    // The logo is now removed, so pass null.
    onGenerate(finalPrompt, outputType, null, customTextConfig);
  };

  const handleStyleClick = (stylePrompt: string) => {
    setActiveStyle(prev => prev === stylePrompt ? null : stylePrompt);
  };

  const handleTemplateClick = (template: Template) => {
    if (activeTemplate?.nameKey === template.nameKey) {
        setActiveTemplate(null);
    } else {
        setActiveTemplate(template);
    }
  };
  
  const getButtonText = () => {
    switch (outputType) {
        case 'Image': return t('editor.generate_poster');
        case 'Video': return t('editor.generate_video');
        default: return t('editor.generate_poster');
    }
  }
  
  const isSubmitDisabled = isLoading || !activeTemplate;

  let stepCounter = 1;

  return (
    <div className="bg-base-200 rounded-2xl shadow-lg p-6 flex flex-col gap-6 border border-base-300 animate-fade-in">
        <div className="relative rounded-lg overflow-hidden flex items-center justify-center bg-black/20 min-h-[300px]">
            <img 
                src={`data:image/png;base64,${originalImage.base64}`} 
                alt="Original upload" 
                className="max-h-[400px] object-contain rounded-md" 
            />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <p className="text-sm font-semibold text-gray-300 mb-2">{stepCounter++}. {t('editor.output_format')}</p>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-base-300 p-1">
                    {(['Image', 'Video'] as OutputType[]).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => type === 'Image' && setOutputType(type)}
                            disabled={isLoading || type === 'Video'}
                            className={`w-full p-2 rounded-md text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                outputType === type
                                    ? 'bg-brand-primary text-white'
                                    : 'text-gray-400 hover:bg-base-100'
                            }`}
                            title={type === 'Video' ? 'Video Generation (Coming Soon)' : 'Generate an Image'}
                        >
                            {t(type === 'Image' ? 'editor.image' : 'editor.video')}
                            {type === 'Video' && (
                                <span className="text-xs font-bold text-yellow-800 bg-yellow-400 px-2 py-0.5 rounded-full">
                                    {t('editor.coming_soon')}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-sm font-semibold text-gray-300 mb-2">{stepCounter++}. {t('editor.choose_template')}</p>
                    <div className="flex border-b border-base-300 mb-2">
                        <button 
                            type="button"
                            onClick={() => setActiveTemplateTab('event')}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTemplateTab === 'event' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t('editor.events')}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTemplateTab('festival')}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTemplateTab === 'festival' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t('editor.festivals')}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(activeTemplateTab === 'event' ? eventTemplates : festivalTemplates).map(template => (
                            <button 
                                type="button"
                                key={template.nameKey} 
                                onClick={() => handleTemplateClick(template)} 
                                disabled={isLoading} 
                                className={`px-3 py-1 text-sm rounded-full transition-all duration-200 disabled:opacity-50 ${
                                    activeTemplate?.nameKey === template.nameKey 
                                    ? 'bg-brand-secondary text-white ring-2 ring-offset-2 ring-offset-base-200 ring-brand-light' 
                                    : 'bg-base-300 text-gray-200 hover:bg-brand-secondary'
                                }`}
                            >
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {activeTemplate && (
                <>
                <div>
                    <p className="text-sm font-semibold text-gray-300 mb-2">{stepCounter++}. {t('editor.style')}</p>
                    <div className="flex flex-wrap gap-2">
                        {styleTemplates.map(style => (
                            <button 
                                type="button"
                                key={style.name} 
                                onClick={() => handleStyleClick(style.prompt)} 
                                disabled={isLoading} 
                                className={`px-3 py-1 text-sm rounded-full transition-all duration-200 disabled:opacity-50 ${
                                    activeStyle === style.prompt 
                                    ? 'bg-brand-primary text-white ring-2 ring-offset-2 ring-offset-base-200 ring-brand-light' 
                                    : 'bg-base-300 text-gray-200 hover:bg-brand-primary'
                                }`}
                            >
                                {style.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 p-3 bg-base-300 rounded-lg">
                    <p className="text-sm font-semibold text-gray-300">{stepCounter++}. {t('editor.custom_text_title')}</p>
                    <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder={t('editor.custom_text_placeholder')}
                        className="w-full p-2 bg-base-100 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm"
                        rows={2}
                        disabled={isLoading}
                    />
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <label htmlFor="textColor" className="text-xs font-medium text-gray-400 whitespace-nowrap">{t('editor.text_color')}</label>
                            <input
                                id="textColor"
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-8 h-8 p-0 border-none rounded-md cursor-pointer bg-transparent"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                             <label htmlFor="fontSize" className="text-xs font-medium text-gray-400">{t('editor.font_size')}</label>
                             <input
                                id="fontSize"
                                type="range"
                                min="16"
                                max="128"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full h-2 bg-base-100 rounded-lg appearance-none cursor-pointer"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>
                </>
            )}
            
            <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 mt-4"
                >
                {isLoading ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('editor.generating')}
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {getButtonText()}
                    </>
                )}
            </button>
        </form>
    </div>
  );
};

export default Editor;