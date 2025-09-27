import React from 'react';
import { GeneratedContent } from '../types';

interface PosterDisplayProps {
  generatedContent: GeneratedContent;
  originalImageName: string;
}

const PosterDisplay: React.FC<PosterDisplayProps> = ({ generatedContent, originalImageName }) => {
    const { image, text } = generatedContent;

    const handleDownload = () => {
        const link = document.createElement('a');
        
        const nameParts = originalImageName.split('.');
        nameParts.pop(); // remove extension
        const name = nameParts.join('.');

        if (image) {
            link.href = `data:image/png;base64,${image}`;
            link.download = `${name}-poster.png`;
        } else {
            return;
        }

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


  return (
    <div className="w-full h-full flex flex-col items-center justify-between space-y-4 animate-fade-in">
        <div className="flex-grow flex items-center justify-center w-full min-h-0">
            {image ? (
                 <img
                    src={`data:image/png;base64,${image}`}
                    alt="Generated poster"
                    className="max-h-full max-w-full object-contain rounded-lg"
                 />
            ) : (
                <div className="p-4 bg-base-300 rounded-lg max-w-full overflow-y-auto">
                    <p className="text-gray-200 whitespace-pre-wrap">{text}</p>
                </div>
            )}
        </div>
        <div className="w-full flex-shrink-0">
             {text && image && (
                <div className="bg-base-300/50 p-3 rounded-lg mb-4 max-h-24 overflow-y-auto">
                    <p className="text-sm text-gray-300">{text}</p>
                </div>
            )}
            {image && (
                <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Poster
                </button>
            )}
        </div>
    </div>
  );
};

export default PosterDisplay;