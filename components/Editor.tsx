import React, { useState } from 'react';
import { ImageData } from '../types';

interface EditorProps {
  originalImage: ImageData;
  onGenerate: (prompt: string, outputType: OutputType) => void;
  isLoading: boolean;
}

const styleTemplates = [
    { name: 'Cinematic', prompt: ', cinematic style, dramatic lighting, high detail' },
    { name: 'Vintage', prompt: ', vintage photo, grainy, faded colors, retro look' },
    { name: 'Neon', prompt: ', neon punk style, vibrant glowing colors, dark background' },
    { name: '3D Render', prompt: ', 3d render, octane render, high quality' },
];

const eventTemplates = [
    { name: 'Wedding', prompt: 'Turn the uploaded image into a beautiful wedding invitation poster for ' },
    { name: 'Engagement', prompt: 'Turn the uploaded image into an elegant engagement announcement poster for ' },
    { name: 'Birthday', prompt: 'Turn the uploaded image into a fun birthday party invitation for ' },
    { name: 'Baby Shower', prompt: 'Turn the uploaded image into a cute baby shower invitation for ' },
    { name: 'Housewarming', prompt: 'Turn the uploaded image into a cozy housewarming party invitation for ' },
    { name: 'Naming Ceremony', prompt: 'Turn the uploaded image into a poster for a naming ceremony for ' },
    { name: 'Birth Announcement', prompt: 'Turn the uploaded image into a sweet birth announcement poster for ' },
    { name: 'Death Announcement', prompt: 'Turn the uploaded image into a respectful memorial poster for ' },
];

const festivalTemplates = [
    { name: 'Diwali', prompt: 'Turn the uploaded image into a vibrant Diwali festival poster with diyas and fireworks, saying "Happy Diwali"' },
    { name: 'Holi', prompt: 'Turn the uploaded image into a colorful Holi festival poster with splashes of color, with the text "Happy Holi"' },
    { name: 'Navratri', prompt: 'Turn the uploaded image into a festive Navratri poster with Garba dancers and traditional decorations, with the text "Happy Navratri"' },
    { name: 'Raksha Bandhan', prompt: 'Turn the uploaded image into a poster celebrating Raksha Bandhan, adding a decorative rakhi' },
    { name: 'Eid', prompt: 'Turn the uploaded image into an elegant Eid Mubarak poster with a crescent moon and mosque silhouette' },
    { name: 'Ganesh Chaturthi', prompt: 'Turn the uploaded image into a poster for Ganesh Chaturthi, incorporating festive elements like modaks' },
    { name: 'Dussehra', prompt: 'Turn the uploaded image into a poster for Dussehra, themed around the victory of good over evil' },
    { name: 'Janmashtami', prompt: 'Turn the uploaded image into a poster for Janmashtami celebrating the birth of Krishna, adding a flute and peacock feather' },
];

type OutputType = 'Image' | 'Gif' | 'Video';

const Editor: React.FC<EditorProps> = ({ originalImage, onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [activeTemplateTab, setActiveTemplateTab] = useState<'event' | 'festival'>('event');
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<OutputType>('Image');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrompt = `${prompt.trim()}${activeStyle || ''}`.trim();
    if (finalPrompt) {
      onGenerate(finalPrompt, outputType);
    }
  };

  const handleStyleClick = (stylePrompt: string) => {
    setActiveStyle(prev => prev === stylePrompt ? null : stylePrompt);
  };

  const handleTemplateClick = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };
  
  const getButtonText = () => {
    switch (outputType) {
        case 'Image': return 'Generate Poster';
        case 'Gif': return 'Generate GIF';
        case 'Video': return 'Generate Video';
        default: return 'Generate';
    }
  }
  
  const getPlaceholderText = () => {
      switch (outputType) {
          case 'Image': return 'Describe a poster to generate...';
          case 'Gif': return 'Describe an animation, e.g., "make the water ripple"';
          default: return 'Describe your idea...';
      }
  }

  return (
    <div className="bg-base-200 rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-base-300 animate-fade-in">
        <div className="relative rounded-lg overflow-hidden flex items-center justify-center bg-black/20 min-h-[300px]">
            <img 
                src={`data:image/png;base64,${originalImage.base64}`} 
                alt="Original upload" 
                className="max-h-[400px] object-contain rounded-md" 
            />
        </div>

        <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Output Format</p>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-base-300 p-1">
                {(['Image', 'Gif', 'Video'] as OutputType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setOutputType(type)}
                        disabled={isLoading || type === 'Video'}
                        className={`w-full p-2 rounded-md text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                            outputType === type
                                ? 'bg-brand-primary text-white'
                                : 'text-gray-400 hover:bg-base-100'
                        } ${type === 'Video' ? 'cursor-not-allowed' : ''}`}
                        title={type === 'Video' ? `${type} generation coming soon!` : `Generate a ${type}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <p className="text-sm font-semibold text-gray-300 mb-2">Style Templates</p>
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
            <div>
                <div className="flex border-b border-base-300 mb-2">
                    <button 
                        onClick={() => setActiveTemplateTab('event')}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTemplateTab === 'event' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400 hover:text-white'}`}
                    >
                        Event Templates
                    </button>
                    <button 
                        onClick={() => setActiveTemplateTab('festival')}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTemplateTab === 'festival' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400 hover:text-white'}`}
                    >
                        Festival Templates
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {activeTemplateTab === 'event' && eventTemplates.map(template => (
                        <button key={template.name} onClick={() => handleTemplateClick(template.prompt)} disabled={isLoading} className="px-3 py-1 bg-base-300 text-sm text-gray-200 rounded-full hover:bg-brand-secondary transition-colors disabled:opacity-50">
                            {template.name}
                        </button>
                    ))}
                        {activeTemplateTab === 'festival' && festivalTemplates.map(template => (
                        <button key={template.name} onClick={() => handleTemplateClick(template.prompt)} disabled={isLoading} className="px-3 py-1 bg-base-300 text-sm text-gray-200 rounded-full hover:bg-brand-secondary transition-colors disabled:opacity-50">
                            {template.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={getPlaceholderText()}
            className="w-full h-24 p-3 bg-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 resize-none"
            disabled={isLoading}
            />
            <button
            type="submit"
            disabled={isLoading || (!prompt.trim() && !activeStyle)}
            className="w-full flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
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