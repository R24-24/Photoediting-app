import React, { useState, useRef, useEffect } from 'react';
import { ImageData, PosterLogo } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useTemplates, Template } from '../i18n/templates';

interface EditorProps {
  originalImage: ImageData;
  onGenerate: (prompt: string, outputType: OutputType, logoForPoster: PosterLogo | null) => void;
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
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'event' | 'festival'>('event');
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<OutputType>('Image');
  const [headlineText, setHeadlineText] = useState<string>('');
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, string>>({});
  const [logoForPoster, setLogoForPoster] = useState<PosterLogo | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    if (activeTemplateTab === 'event') {
      setLogoForPoster(null);
      setPhoneNumber('');
      setAddress('');
    }
  }, [activeTemplateTab]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        if (base64) {
            setLogoForPoster({ base64, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    let finalPrompt = activeTemplate.prompt;

    if (headlineText.trim()) {
        finalPrompt += ` Please add the following text prominently on the poster: "${headlineText.trim()}". Also ensure all other text on the poster is in the same language as this text.`;
    }

    const filledFields = Object.entries(customFieldsData)
        .filter(([_, value]) => value.trim() !== '');
    
    if (filledFields.length > 0) {
        const textParts = filledFields.map(([key, value]) => `${key}: "${value.trim()}"`);
        finalPrompt += ` Please add the following text to the poster: ${textParts.join('; ')}.`;
    }

    if (logoForPoster) {
        finalPrompt += ' The final image input provided is a logo. Please place this logo tastefully on the poster, usually in a corner or at the top/bottom.';
    }

    if (phoneNumber.trim() || address.trim()) {
        let footerText = ' Add a footer section with the following details:';
        if (phoneNumber.trim()) footerText += ` Phone: ${phoneNumber.trim()}`;
        if (address.trim()) footerText += `${phoneNumber.trim() ? '; ' : ''} Address: ${address.trim()}`;
        finalPrompt += footerText + '.';
    }

    if (activeStyle) {
      finalPrompt += `, with a ${activeStyle}`;
    }

    finalPrompt += '. IMPORTANT: Artistically integrate all text and the logo onto the image. Everything should be legible, well-placed, and must not cover the main subjects or faces in the photo.';
    
    onGenerate(finalPrompt, outputType, logoForPoster);
  };

  const handleStyleClick = (stylePrompt: string) => {
    setActiveStyle(prev => prev === stylePrompt ? null : stylePrompt);
  };

  const handleTemplateClick = (template: Template) => {
    if (activeTemplate?.nameKey === template.nameKey) {
        setActiveTemplate(null);
        setCustomFieldsData({});
    } else {
        setActiveTemplate(template);
        setCustomFieldsData({});
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setCustomFieldsData(prev => ({
        ...prev,
        [fieldName]: value,
    }));
  };
  
  const getButtonText = () => {
    switch (outputType) {
        case 'Image': return t('editor.generate_poster');
        case 'Video': return t('editor.generate_video');
        default: return t('editor.generate_poster');
    }
  }
  
  const isCustomTextMandatory = activeTemplateTab === 'event' && !!activeTemplate?.fields?.length;

  const areMandatoryFieldsFilled = isCustomTextMandatory
    ? activeTemplate!.fields!.every(field => customFieldsData[field]?.trim())
    : true;

  const isSubmitDisabled = isLoading || !activeTemplate || !areMandatoryFieldsFilled;

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

        <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">{stepCounter++}. {t('editor.output_format')}</p>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-base-300 p-1">
                {(['Image', 'Video'] as OutputType[]).map((type) => (
                    <button
                        key={type}
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
                        onClick={() => setActiveTemplateTab('event')}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTemplateTab === 'event' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400 hover:text-white'}`}
                    >
                        {t('editor.events')}
                    </button>
                    <button 
                        onClick={() => setActiveTemplateTab('festival')}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTemplateTab === 'festival' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400 hover:text-white'}`}
                    >
                        {t('editor.festivals')}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {(activeTemplateTab === 'event' ? eventTemplates : festivalTemplates).map(template => (
                        <button 
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
            
            {activeTemplate && (
                <>
                <div>
                     <p className="text-sm font-semibold text-gray-300 mb-2">{stepCounter++}. {t('editor.headline_input')}</p>
                     <div className="flex flex-wrap gap-2">
                        <input
                            type="text"
                            value={headlineText}
                            onChange={(e) => setHeadlineText(e.target.value)}
                            placeholder={t('editor.headline_placeholder')}
                            className="w-full p-2 bg-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                 <div>
                    <p className="text-sm font-semibold text-gray-300 mb-2">{stepCounter++}. {t('editor.style')}</p>
                    <div className="flex flex-wrap gap-2">
                        {styleTemplates.map(style => (
                            <button 
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
                {activeTemplateTab === 'festival' && (
                    <>
                        <div>
                            <p className="text-sm font-semibold text-gray-300 mb-2">{stepCounter++}. {t('editor.upload_logo_poster')}</p>
                            {logoForPoster ? (
                                <div className="flex items-center gap-4 bg-base-300 p-2 rounded-lg">
                                    <img src={`data:${logoForPoster.mimeType};base64,${logoForPoster.base64}`} alt="Poster logo" className="h-12 w-auto object-contain bg-white/10 p-1 rounded" />
                                    <button
                                        onClick={() => setLogoForPoster(null)}
                                        className="bg-red-600 text-white font-semibold py-1 px-3 rounded-lg hover:bg-red-700 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {t('editor.remove_logo_button')}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => logoInputRef.current?.click()}
                                    className="w-full bg-base-300 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-primary transition-colors duration-300"
                                    disabled={isLoading}
                                >
                                    {t('editor.upload_logo_button')}
                                </button>
                            )}
                            <input
                                type="file"
                                ref={logoInputRef}
                                onChange={handleLogoFileChange}
                                accept="image/png, image/jpeg"
                                className="hidden"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-300 mb-2">{stepCounter++}. {t('editor.add_footer')}</p>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder={t('editor.phone_number')}
                                    className="w-full p-2 bg-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm"
                                    disabled={isLoading}
                                />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder={t('editor.address')}
                                    className="w-full p-2 bg-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </>
                )}
                </>
            )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            {activeTemplate && activeTemplate.fields && activeTemplate.fields.length > 0 && (
                 <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-300">{stepCounter++}. {isCustomTextMandatory ? t('editor.custom_text_mandatory') : t('editor.custom_text')}</p>
                    {activeTemplate.fields.map(field => (
                        <div key={field}>
                             <label htmlFor={field} className="text-xs font-medium text-gray-400 mb-1 block">
                                {field}
                                {isCustomTextMandatory && <span className="text-red-400 ml-1">*</span>}
                             </label>
                             <input
                                id={field}
                                type="text"
                                value={customFieldsData[field] || ''}
                                onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                                placeholder={`Enter ${field.toLowerCase()}...`}
                                className="w-full p-2 bg-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm"
                                disabled={isLoading}
                                required={isCustomTextMandatory}
                            />
                        </div>
                    ))}
                </div>
            )}
            <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
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