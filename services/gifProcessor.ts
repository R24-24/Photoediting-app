// This tells TypeScript that the FFmpeg object might exist on the window.
interface FFmpegInstance {
  isLoaded: () => boolean;
  load: () => Promise<void>;
  run: (...args: string[]) => Promise<void>;
  FS: (method: 'writeFile' | 'readFile' | 'unlink', ...args: any[]) => any;
}

interface FFmpegGlobal {
    createFFmpeg: (options: any) => FFmpegInstance;
    fetchFile: (data: Blob | File | Uint8Array) => Promise<Uint8Array>;
}

declare global {
  interface Window {
    FFmpeg?: FFmpegGlobal;
  }
}

let ffmpegInstance: FFmpegInstance | null = null;
let ffmpegLoadingPromise: Promise<FFmpegInstance> | null = null;

async function getFFmpeg(): Promise<FFmpegInstance> {
    if (ffmpegInstance) {
        return ffmpegInstance;
    }

    if (ffmpegLoadingPromise) {
        return ffmpegLoadingPromise;
    }

    ffmpegLoadingPromise = new Promise(async (resolve, reject) => {
        try {
            if (!window.FFmpeg) {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/ffmpeg.min.js";
                script.onload = () => {
                    if (!window.FFmpeg) {
                        return reject(new Error("FFmpeg script loaded but not initialized."));
                    }
                    const { createFFmpeg } = window.FFmpeg;
                    const instance = createFFmpeg({
                        log: false, // Set to true for debugging
                        corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
                    });
                    instance.load().then(() => {
                        ffmpegInstance = instance;
                        resolve(instance);
                    }).catch(reject);
                };
                script.onerror = () => reject(new Error("Failed to load FFmpeg script."));
                document.head.appendChild(script);
            } else {
                const { createFFmpeg } = window.FFmpeg;
                const instance = createFFmpeg({
                    log: false,
                    corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
                });
                await instance.load();
                ffmpegInstance = instance;
                resolve(instance);
            }
        } catch (e) {
            reject(e);
        }
    });

    return ffmpegLoadingPromise;
}

const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

/**
 * Converts a video blob (MP4) to an animated GIF using FFmpeg.
 * @param videoBase64 The base64 encoded string of the input MP4 video.
 * @returns A promise that resolves to the base64 encoded string of the output GIF.
 */
export async function convertVideoToGif(videoBase64: string): Promise<string> {
    const ffmpeg = await getFFmpeg();
    if (!window.FFmpeg) {
        throw new Error("FFmpeg library not available.");
    }
    const { fetchFile } = window.FFmpeg;
    
    const videoBlob = base64ToBlob(videoBase64, 'video/mp4');

    const inputName = 'input.mp4';
    const outputName = 'output.gif';

    ffmpeg.FS('writeFile', inputName, await fetchFile(videoBlob));

    try {
        await ffmpeg.run('-i', inputName, '-vf', 'fps=15,scale=512:-1:flags=lanczos', outputName);

        const data = ffmpeg.FS('readFile', outputName);
        
        let binary = '';
        const bytes = new Uint8Array(data);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);

    } catch(e) {
        console.error("Error during FFmpeg conversion:", e);
        throw new Error("Failed to convert video to GIF.");
    } finally {
        try {
            ffmpeg.FS('unlink', inputName);
            ffmpeg.FS('unlink', outputName);
        } catch (e) {
            console.error("Error unlinking files from ffmpeg FS", e);
        }
    }
}