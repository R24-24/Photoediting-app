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
    { name: 'Watercolor', prompt: ', watercolor painting style, soft edges, vibrant washes of color' },
    { name: 'Pop Art', prompt: ', pop art style, bold outlines, vibrant flat colors, halftone dots' },
    { name: 'Fantasy', prompt: ', fantasy art style, ethereal lighting, magical elements, enchanted atmosphere' },
];

const eventTemplates: Template[] = [
    { name: 'Wedding', prompt: 'Turn the uploaded image into a beautiful wedding invitation poster', fields: ["Couple's Names", "Date", "Location", "Pincode"] },
    { name: 'Engagement', prompt: 'Turn the uploaded image into an elegant engagement announcement poster', fields: ["Couple's Names", "Date"] },
    { name: 'Birthday', prompt: 'Turn the uploaded image into a fun birthday party invitation', fields: ["Name", "Age", "Date & Time", "Location", "Pincode"] },
    { name: 'Baby Shower', prompt: 'Turn the uploaded image into a cute baby shower invitation', fields: ["Parent(s)-to-be", "Date & Time", "Location", "Pincode"] },
    { name: 'Housewarming', prompt: 'Turn the uploaded image into a cozy housewarming party invitation', fields: ["Host(s) Name(s)", "Date & Time", "Address"] },
    { name: 'Naming Ceremony', prompt: 'Turn the uploaded image into a poster for a naming ceremony', fields: ["Child's Name", "Date & Time", "Location", "Pincode"] },
    { name: 'Birth Announcement', prompt: 'Turn the uploaded image into a sweet birth announcement poster', fields: ["Baby's Name", "Date of Birth", "Parents' Names"] },
    { name: 'Death Announcement', prompt: 'Turn the uploaded image into a respectful memorial poster', fields: ["Name of Deceased", "Life Dates (e.g., 1950-2024)"] },
];

const festivalTemplates: Template[] = [
    { name: 'Diwali', prompt: 'Turn the uploaded image into a vibrant Diwali festival poster with diyas and fireworks, saying "Happy Diwali"' },
    { name: 'Holi', prompt: 'Turn the uploaded image into a colorful Holi festival poster with splashes of color, with the text "Happy Holi"' },
    { name: 'Navratri', prompt: 'Turn the uploaded image into a festive Navratri poster with Garba dancers and traditional decorations, with the text "Happy Navratri"' },
    { name: 'Raksha Bandhan', prompt: 'Turn the uploaded image into a poster celebrating Raksha Bandhan, adding a decorative rakhi' },
    { name: 'Eid', prompt: 'Turn the uploaded image into an elegant Eid Mubarak poster with a crescent moon and mosque silhouette' },
    { name: 'Ganesh Chaturthi', prompt: 'Turn the uploaded image into a poster for Ganesh Chaturthi, incorporating festive elements like modaks' },
    { name: 'Dussehra', prompt: 'Turn the uploaded image into a poster for Dussehra, themed around the victory of good over evil' },
    { name: 'Janmashtami', prompt: 'Turn the uploaded image into a poster for Janmashtami celebrating the birth of Krishna, adding a flute and peacock feather' },
];

type Template = { name: string; prompt: string; fields?: string[]; };
type OutputType = 'Image' | 'Video';

const Editor: React.FC<EditorProps> = ({ originalImage, onGenerate, isLoading }) => {
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'event' | 'festival'>('event');
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<OutputType>('Image');
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    let finalPrompt = activeTemplate.prompt;
    
    const filledFields = Object.entries(customFieldsData)
        .filter(([_, value]) => value.trim() !== '');
    
    if (filledFields.length > 0) {
        const textParts = filledFields.map(([key, value]) => `${key}: "${value.trim()}"`);
        finalPrompt += `, and include the following text, clearly labeled: ${textParts.join(', ')}`;
    }
    
    if (activeStyle) {
      finalPrompt += activeStyle;
    }

    finalPrompt += '. IMPORTANT: Place any generated text thoughtfully and artistically. Ensure text does not obscure or overlap with the main people or subjects in the photo.';
    
    onGenerate(finalPrompt, outputType);
  };

  const handleStyleClick = (stylePrompt: string) => {
    setActiveStyle(prev => prev === stylePrompt ? null : stylePrompt);
  };

  const handleTemplateClick = (template: Template) => {
    if (activeTemplate?.name === template.name) {
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
        case 'Image': return 'Generate Poster';
        case 'Video': return 'Generate Video';
        default: return 'Generate';
    }
  }

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
            <p className="text-sm font-semibold text-gray-300 mb-2">1. Select Output Format</p>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-base-300 p-1">
                {(['Image', 'Video'] as OutputType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setOutputType(type)}
                        disabled={isLoading}
                        className={`w-full p-2 rounded-md text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                            outputType === type
                                ? 'bg-brand-primary text-white'
                                : 'text-gray-400 hover:bg-base-100'
                        }`}
                        title={`Generate a ${type}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <p className="text-sm font-semibold text-gray-300 mb-2">2. Choose a Template</p>
                <div className="flex border-b border-base-300 mb-2">
                    <button 
                        onClick={() => setActiveTemplateTab('event')}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTemplateTab === 'event' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400 hover:text-white'}`}
                    >
                        Events
                    </button>
                    <button 
                        onClick={() => setActiveTemplateTab('festival')}
                        className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTemplateTab === 'festival' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400 hover:text-white'}`}
                    >
                        Festivals
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {(activeTemplateTab === 'event' ? eventTemplates : festivalTemplates).map(template => (
                        <button 
                            key={template.name} 
                            onClick={() => handleTemplateClick(template)} 
                            disabled={isLoading} 
                            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 disabled:opacity-50 ${
                                activeTemplate?.name === template.name 
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
                 <div>
                    <p className="text-sm font-semibold text-gray-300 mb-2">3. Add Style (Optional)</p>
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
            )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            {activeTemplate && activeTemplate.fields && activeTemplate.fields.length > 0 && (
                 <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-300">4. Add Custom Text (Optional)</p>
                    {activeTemplate.fields.map(field => (
                        <div key={field}>
                             <label htmlFor={field} className="text-xs font-medium text-gray-400 mb-1 block">{field}</label>
                             <input
                                id={field}
                                type="text"
                                value={customFieldsData[field] || ''}
                                onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                                placeholder={`Enter ${field.toLowerCase()}...`}
                                className="w-full p-2 bg-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-sm"
                                disabled={isLoading}
                            />
                        </div>
                    ))}
                </div>
            )}
            <button
            type="submit"
            disabled={isLoading || !activeTemplate}
            className="w-full flex items-center justify-center bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/0000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={2}>
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