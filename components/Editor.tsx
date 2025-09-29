import React, { useState, useEffect, useRef } from 'react';
import { ImageData, PosterLogo } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useTemplates, Template } from '../i18n/templates';

interface EditorProps {
  originalImage: ImageData;
  onGenerate: (prompt: string, outputType: OutputType, logoForPoster: PosterLogo | null) => void;
  isLoading: boolean;
  onReset: () => void;
  tokens: number;
  timeUntilReset?: string;
  onBuyTokens: (tokens: number, amount: number) => void;
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

const Editor: React.FC<EditorProps> = ({ originalImage, onGenerate, isLoading, onReset, tokens, timeUntilReset, onBuyTokens }) => {
  const { t } = useTranslation();
  const { eventTemplates, festivalTemplates, businessTemplates } = useTemplates();
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'event' | 'festival' | 'business'>('event');
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<OutputType>('Image');
  const [textFields, setTextFields] = useState<Record<string, string>>({});

  // Festival-specific state
  const [logo, setLogo] = useState<PosterLogo | null>(null);
  const [footerContact, setFooterContact] = useState('');
  const [footerEmail, setFooterEmail] = useState('');
  const [footerWebsite, setFooterWebsite] = useState('');

  // Product Advertising specific state
  const [brandTagline, setBrandTagline] = useState('');
  const [brandOffers, setBrandOffers] = useState('');


  useEffect(() => {
    setActiveTemplate(null);
  }, [activeTemplateTab]);
  
  useEffect(() => {
    setTextFields({});
    setLogo(null);
    setFooterContact('');
    setFooterEmail('');
    setFooterWebsite('');
    setBrandTagline('');
    setBrandOffers('');
  }, [activeTemplate]);

  const handleTextFieldChange = (id: string, value: string) => {
    setTextFields(prev => ({ ...prev, [id]: value }));
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = (event.target?.result as string).split(',')[1];
            if (base64) {
                setLogo({ base64, mimeType: file.type });
            }
        };
        reader.readAsDataURL(file);
    }
    if (e.target) {
        e.target.value = ''; // Reset file input
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    let finalPrompt = '';
    let dimensionInstruction = '';
    if (originalImage.width && originalImage.height) {
        dimensionInstruction = `- Dimensions: The final output image MUST have the exact dimensions of ${originalImage.width} pixels wide by ${originalImage.height} pixels high. Do not alter the aspect ratio or the dimensions.\n`;
    }

    if (activeTemplate.nameKey === 'templates.business.product_advertising') {
        finalPrompt = `Create a compelling and eye-catching poster for product advertising.
${dimensionInstruction}- Main Subject: Use the main subject from the provided image. Perfectly preserve the subject without any changes and seamlessly composite them onto a new, professional background that matches this theme: '${activeTemplate.prompt}'.
- Text Instructions: IMPORTANT - Do NOT add any random text, headlines, or information. Only use the text elements provided below. If a text element is not provided, do not include it.
- Final Output: The output should be a complete poster with the subject, new background, and integrated text. Do not output just the background.`;

        if (brandTagline.trim()) {
            finalPrompt += `\n- Tagline: Artistically integrate the following tagline into the poster. It should be stylish but legible: "${brandTagline.trim()}"`;
        }
        if (brandOffers.trim()) {
            finalPrompt += `\n- Offer: Prominently display the following offer text to attract customers. Make it a key visual element: "${brandOffers.trim()}"`;
        }
    } else if (activeTemplateTab === 'event') {
        const textDetails = activeTemplate.fields
            ?.map(field => {
                const value = textFields[field.id] || '';
                if (!value.trim()) return null;
                const label = t(field.labelKey as any);
                return `${label}: ${value}`;
            })
            .filter(Boolean)
            .join('\n');
        
        finalPrompt = `Create a beautiful and aesthetically pleasing poster for an '${activeTemplate.name}' event.
${dimensionInstruction}- Main Subject: Use the main subject from the provided image. Perfectly preserve the subject without any changes and seamlessly composite them onto a new background.
- Background: The new background should be based on this theme: '${activeTemplate.prompt}'.
- Text Integration: Artistically and elegantly integrate the following text details into the poster's design. The text should be legible, well-placed, and use a beautiful font that complements the theme. Avoid simple text overlays; make the text part of the overall artistic composition.
- Final Output: The output should be a complete poster with the subject, new background, and integrated text. Do not output just the background.`;

        if (textDetails) {
            finalPrompt += `\n\nText details to include:\n${textDetails}`;
        }
    } else { // Festival or Business
        const templateType = activeTemplateTab === 'business'
            ? `a poster for a '${activeTemplate.name}' business`
            : `a poster for the '${activeTemplate.name}' festival`;
        
        finalPrompt = `Create a beautiful and aesthetically pleasing poster for ${templateType}.
${dimensionInstruction}- Main Subject: Use the main subject from the provided image. Perfectly preserve the subject without any changes and seamlessly composite them onto a new background that matches the theme.
- Background: The new background should be based on this theme: '${activeTemplate.prompt}'.
- Final Output: The output should be a complete poster with the subject and new background. Do not output just the background.`;
    }

    const footerDetails = [
        footerContact.trim() && `${t('templates.fields.contact')}: ${footerContact.trim()}`,
        footerEmail.trim() && `${t('templates.fields.email')}: ${footerEmail.trim()}`,
        footerWebsite.trim() && `${t('templates.fields.website')}: ${footerWebsite.trim()}`
    ].filter(Boolean).join(' | ');

    if (logo) {
        finalPrompt += `\n- Logo: A logo is provided as a separate image. Place this logo tastefully and subtly in one of the corners, such as the bottom-right or top-right. Ensure it is legible but not distracting.`;
    }
    if (footerDetails) {
        finalPrompt += `\n- Footer: Add the following contact information as a clean, professional-looking footer at the bottom of the poster. Use a small, legible font that complements the overall design:\n${footerDetails}`;
    }

    if (activeStyle) {
      finalPrompt += `\n\n- Additional Style: Apply a ${activeStyle} style to the overall image.`;
    }

    onGenerate(finalPrompt, outputType, logo);
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
  
  const isSubmitDisabled = isLoading || !activeTemplate || tokens <= 0;

  let stepCounter = 1;
  
  const templatesToShow = activeTemplateTab === 'event' 
        ? eventTemplates 
        : activeTemplateTab === 'festival'
        ? festivalTemplates
        : businessTemplates;

  return (
    <div className="bg-base-200 rounded-2xl shadow-lg p-6 flex flex-col gap-6 border border-base-300 animate-fade-in">
        <div className="relative rounded-lg overflow-hidden flex items-center justify-center bg-black/20 min-h-[300px]">
            <img 
                src={`data:image/png;base64,${originalImage.base64}`} 
                alt="Original upload" 
                className="max-h-[400px] object-contain rounded-md" 
            />
            <button
                type="button"
                onClick={onReset}
                disabled={isLoading}
                className="absolute top-3 right-3 flex items-center gap-2 bg-base-300/70 backdrop-blur-sm hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('editor.start_over')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span className="text-sm hidden md:inline">{t('editor.start_over')}</span>
            </button>
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
                        <button 
                            type="button"
                            onClick={() => setActiveTemplateTab('business')}
                            className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTemplateTab === 'business' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t('editor.business')}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {templatesToShow.map(template => (
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
            )}

            {activeTemplate?.fields && (
                <div className="space-y-4 p-4 bg-base-300 rounded-lg animate-fade-in">
                    <p className="text-sm font-semibold text-gray-300 -mt-1 mb-2">{stepCounter++}. {t('editor.fill_details')}</p>
                    
                    {activeTemplate.fields.map(field => (
                        <div key={field.id}>
                            <label htmlFor={field.id} className="block text-xs font-medium text-gray-400 mb-1">{t(field.labelKey as any)}</label>
                            <input
                                id={field.id}
                                type="text"
                                value={textFields[field.id] || ''}
                                onChange={(e) => handleTextFieldChange(field.id, e.target.value)}
                                placeholder={t(field.placeholderKey as any)}
                                className="w-full p-2 bg-base-100 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm"
                                disabled={isLoading}
                            />
                        </div>
                    ))}
                </div>
            )}

            {activeTemplate && activeTemplateTab !== 'event' && (
                <>
                    {/* Logo Upload */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-300">{stepCounter++}. {t('editor.upload_logo')}</p>
                        <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" />
                        
                        {!logo ? (
                            <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                disabled={isLoading}
                                className="w-full p-4 border-2 border-dashed border-base-300 rounded-lg text-gray-400 hover:border-brand-light transition-colors"
                            >
                                {t('uploader.drop_here')}
                            </button>
                        ) : (
                            <div className="relative w-24 h-24 bg-base-100 p-1 rounded-lg">
                                <img src={`data:${logo.mimeType};base64,${logo.base64}`} alt="Logo preview" className="w-full h-full object-contain rounded" />
                                <button
                                    type="button"
                                    onClick={() => setLogo(null)}
                                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white font-bold p-1 rounded-full transition-colors"
                                    title={t('editor.remove_logo')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Product Advertising Fields */}
                    {activeTemplate.nameKey === 'templates.business.product_advertising' && (
                        <div className="space-y-4 pt-4 mt-4 border-t border-base-300/30 animate-fade-in">
                            <p className="text-sm font-semibold text-gray-300">{stepCounter++}. {t('editor.add_text')}</p>
                            <div>
                                <label htmlFor="brandTagline" className="block text-xs font-medium text-gray-400 mb-1">{t('templates.fields.tagline')}</label>
                                <input
                                    id="brandTagline"
                                    type="text"
                                    value={brandTagline}
                                    onChange={(e) => setBrandTagline(e.target.value)}
                                    placeholder={t('templates.placeholders.tagline')}
                                    className="w-full p-2 bg-base-100 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="brandOffers" className="block text-xs font-medium text-gray-400 mb-1">{t('templates.fields.offer')}</label>
                                <input
                                    id="brandOffers"
                                    type="text"
                                    value={brandOffers}
                                    onChange={(e) => setBrandOffers(e.target.value)}
                                    placeholder={t('templates.placeholders.offer')}
                                    className="w-full p-2 bg-base-100 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}
                     {/* Footer Details */}
                    <div className="space-y-4">
                        <p className="text-sm font-semibold text-gray-300">{stepCounter++}. {t('editor.edit_footer')}</p>
                        <div>
                            <label htmlFor="footerContact" className="block text-xs font-medium text-gray-400 mb-1">{t('templates.fields.contact')}</label>
                            <input id="footerContact" type="text" value={footerContact} onChange={e => setFooterContact(e.target.value)} placeholder={t('templates.placeholders.contact')} className="w-full p-2 bg-base-100 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm" disabled={isLoading} />
                        </div>
                        <div>
                            <label htmlFor="footerEmail" className="block text-xs font-medium text-gray-400 mb-1">{t('templates.fields.email')}</label>
                            <input id="footerEmail" type="email" value={footerEmail} onChange={e => setFooterEmail(e.target.value)} placeholder={t('templates.placeholders.email')} className="w-full p-2 bg-base-100 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm" disabled={isLoading} />
                        </div>
                        <div>
                            <label htmlFor="footerWebsite" className="block text-xs font-medium text-gray-400 mb-1">{t('templates.fields.website')}</label>
                            <input id="footerWebsite" type="text" value={footerWebsite} onChange={e => setFooterWebsite(e.target.value)} placeholder={t('templates.placeholders.website')} className="w-full p-2 bg-base-100 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm" disabled={isLoading} />
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
            {tokens <= 0 && timeUntilReset && !isLoading && (
                <div className="text-center p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg mt-4 space-y-3 animate-fade-in">
                    <p className="text-yellow-400 font-semibold">
                        You've run out of free daily tokens.
                    </p>
                    <p className="text-gray-300 text-sm">
                        Your free tokens will reset in: <span className="font-bold text-white">{timeUntilReset}</span>
                    </p>
                    <p className="text-gray-300 text-sm font-semibold pt-2 border-t border-yellow-700/50">
                        Or refill now:
                    </p>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => onBuyTokens(5, 10)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 transform hover:scale-105"
                        >
                            Buy 5 Tokens (₹10)
                        </button>
                        <button
                            type="button"
                            onClick={() => onBuyTokens(50, 25)}
                            className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 transform hover:scale-105"
                        >
                            Buy 50 Tokens (₹25)
                        </button>
                    </div>
                </div>
            )}
        </form>
    </div>
  );
};

export default Editor;
