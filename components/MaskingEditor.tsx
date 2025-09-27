import React, { useRef, useEffect, useState, useCallback } from 'react';

interface MaskingEditorProps {
  imageUrl: string;
  onApply: (maskBase64: string, prompt: string) => void;
  onCancel: () => void;
}

const MaskingEditor: React.FC<MaskingEditorProps> = ({ imageUrl, onApply, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [prompt, setPrompt] = useState('');

  const getCanvas = () => canvasRef.current;
  const getContext = () => getCanvas()?.getContext('2d');

  const resizeCanvas = useCallback(() => {
    const canvas = getCanvas();
    const image = imageRef.current;
    if (canvas && image) {
      canvas.width = image.clientWidth;
      canvas.height = image.clientHeight;
    }
  }, []);

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.onload = resizeCanvas;
      window.addEventListener('resize', resizeCanvas);
    }
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = getCanvas();
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = getContext();
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getMousePos(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 0, 150, 0.7)';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const handleApply = () => {
    const canvas = getCanvas();
    if (canvas && prompt.trim()) {
        const maskBase64 = canvas.toDataURL('image/png').split(',')[1];
        onApply(maskBase64, prompt);
    }
  }

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/50 animate-fade-in">
        <div className="relative w-full h-full flex items-center justify-center">
            <img
                ref={imageRef}
                src={imageUrl}
                alt="Editing background"
                className="max-h-full max-w-full object-contain pointer-events-none"
                onLoad={resizeCanvas}
            />
            <canvas
                ref={canvasRef}
                className="absolute cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
            />
        </div>
        <div className="absolute bottom-4 w-full px-4 space-y-3">
             <div className="w-full max-w-lg mx-auto bg-base-100/80 backdrop-blur-md rounded-lg p-2 flex items-center space-x-2 shadow-lg">
                <input 
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe your edit, e.g. 'make the car red'"
                    className="flex-grow bg-transparent focus:outline-none text-white px-2"
                />
                 <button onClick={handleApply} disabled={!prompt.trim()} className="px-4 py-2 bg-brand-primary text-white rounded-md font-semibold disabled:opacity-50 transition-colors">
                    Apply
                 </button>
                 <button onClick={onCancel} className="px-4 py-2 bg-base-300 text-white rounded-md font-semibold transition-colors">
                    Cancel
                 </button>
            </div>
            <div className="w-full max-w-lg mx-auto bg-base-100/80 backdrop-blur-md rounded-lg p-2 flex items-center space-x-3 shadow-lg">
                <label className="text-sm font-medium text-white">Brush Size</label>
                <input
                    type="range"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    </div>
  );
};

export default MaskingEditor;
