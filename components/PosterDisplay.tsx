import React, { useState, useRef, MouseEvent } from 'react';
import { GeneratedContent, CustomTextConfig } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface PosterDisplayProps {
  generatedContent: GeneratedContent;
  originalImageName: string;
  customTextConfig: CustomTextConfig | null;
}

const PosterDisplay: React.FC<PosterDisplayProps> = ({ generatedContent, originalImageName, customTextConfig }) => {
    const { media, mediaType, text } = generatedContent;
    const { t } = useTranslation();

    const imageContainerRef = useRef<HTMLDivElement>(null);
    const displayedImageRef = useRef<HTMLImageElement>(null);
    const draggableTextRef = useRef<HTMLDivElement>(null);

    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (!imageContainerRef.current) return;
        e.preventDefault();
        setIsDragging(true);
        const containerRect = imageContainerRef.current.getBoundingClientRect();
        setDragStart({
            x: e.clientX - containerRect.left - position.x,
            y: e.clientY - containerRect.top - position.y,
        });
    };
    
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !imageContainerRef.current || !draggableTextRef.current) return;
        e.preventDefault();
        const containerRect = imageContainerRef.current.getBoundingClientRect();
        let newX = e.clientX - containerRect.left - dragStart.x;
        let newY = e.clientY - containerRect.top - dragStart.y;
        
        // Boundary checks to keep the text within the container
        newX = Math.max(0, Math.min(newX, containerRect.width - draggableTextRef.current.offsetWidth));
        newY = Math.max(0, Math.min(newY, containerRect.height - draggableTextRef.current.offsetHeight));

        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDownload = () => {
        if (!media) return;

        const nameParts = originalImageName.split('.');
        nameParts.pop(); // remove extension
        const name = nameParts.join('.');

        if (mediaType === 'video') {
            const link = document.createElement('a');
            link.href = `data:video/mp4;base64,${media}`;
            link.download = `${name}-animation.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(image, 0, 0);

            if (customTextConfig?.text && imageContainerRef.current && displayedImageRef.current) {
                const container = imageContainerRef.current;
                const displayedImg = displayedImageRef.current;

                // Scale factor between displayed image and original image
                const scale = image.naturalWidth / displayedImg.clientWidth;

                // Calculate the offset of the displayed image within its container (for letterboxing)
                const imgOffsetX = (container.clientWidth - displayedImg.clientWidth) / 2;
                const imgOffsetY = (container.clientHeight - displayedImg.clientHeight) / 2;

                // Calculate the text's position relative to the top-left of the image
                const textX_relative = position.x - imgOffsetX;
                const textY_relative = position.y - imgOffsetY;

                // Scale the position and font size for the canvas
                const canvasX = textX_relative * scale;
                const canvasY = textY_relative * scale;
                const canvasFontSize = customTextConfig.fontSize * scale;
                const lineHeight = canvasFontSize * 1.1; // Match CSS line-height
                const lines = customTextConfig.text.split('\n');

                // Set styles on the canvas context to match the displayed text
                ctx.font = `bold ${canvasFontSize}px 'Poppins', sans-serif`;
                ctx.fillStyle = customTextConfig.color;
                ctx.textBaseline = 'top';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 3 * scale;
                ctx.shadowOffsetX = 1 * scale;
                ctx.shadowOffsetY = 1 * scale;

                // Draw each line of text
                lines.forEach((line, index) => {
                    ctx.fillText(line, canvasX, canvasY + (index * lineHeight));
                });
            }
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${name}-poster.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        image.src = `data:image/png;base64,${media}`;
    };


  return (
    <div className="w-full h-full flex flex-col items-center justify-between space-y-4 animate-fade-in">
        <div 
            ref={imageContainerRef}
            className="relative flex-grow flex items-center justify-center w-full min-h-0"
            onMouseMove={handleMouseMove} 
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves container
        >
            {mediaType === 'video' && media ? (
                <video
                    src={`data:video/mp4;base64,${media}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="max-h-full max-w-full object-contain rounded-lg"
                />
            ) : mediaType === 'image' && media ? (
                 <>
                    <img
                        ref={displayedImageRef}
                        src={`data:image/png;base64,${media}`}
                        alt="Generated poster"
                        className="max-h-full max-w-full object-contain rounded-lg pointer-events-none"
                    />
                    {customTextConfig?.text && (
                        <div
                            ref={draggableTextRef}
                            onMouseDown={handleMouseDown}
                            className="absolute p-2 select-none"
                            style={{
                                left: `${position.x}px`,
                                top: `${position.y}px`,
                                color: customTextConfig.color,
                                fontSize: `${customTextConfig.fontSize}px`,
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 'bold',
                                cursor: isDragging ? 'grabbing' : 'grab',
                                textShadow: '0px 1px 3px rgba(0,0,0,0.5)',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.1',
                            }}
                        >
                            {customTextConfig.text}
                        </div>
                    )}
                 </>
            ) : (
                <div className="p-4 bg-base-300 rounded-lg max-w-full overflow-y-auto">
                    <p className="text-gray-200 whitespace-pre-wrap">{text}</p>
                </div>
            )}
        </div>
        <div className="w-full flex-shrink-0">
             {text && media && (
                <div className="bg-base-300/50 p-3 rounded-lg mb-4 max-h-24 overflow-y-auto">
                    <p className="text-sm text-gray-300">{text}</p>
                </div>
            )}
            {media && (
                <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {mediaType === 'video' ? t('display.download_video') : t('display.download_poster')}
                </button>
            )}
        </div>
    </div>
  );
};

export default PosterDisplay;
