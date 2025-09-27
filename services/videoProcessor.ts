// This tells TypeScript that the FFmpeg object might exist on the window.
interface FFmpegInstance {
  isLoaded: () => boolean;
  load: () => Promise<void>;
  run: (...args: string[]) => Promise<void>;
  FS: (method: 'writeFile' | 'readFile' | 'unlink', ...args: any[]) => any;
}

interface FFmpegGlobal {
    createFFmpeg: (options: any) => FFmpegInstance;
    fetchFile: (data: Blob | File) => Promise<Uint8Array>;
}

declare global {
  interface Window {
    FFmpeg?: FFmpegGlobal;
  }
}

let ffmpegInstance: FFmpegInstance | null = null;

async function getFFmpeg(): Promise<FFmpegInstance> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }
  
  if (!window.FFmpeg) {
      throw new Error("FFmpeg library not loaded. It might be a network issue. Please refresh the page.");
  }

  const { createFFmpeg } = window.FFmpeg;
  ffmpegInstance = createFFmpeg({
    log: false, // Set to true for debugging
    corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
  });

  if (!ffmpegInstance.isLoaded()) {
    await ffmpegInstance.load();
  }

  return ffmpegInstance;
}

export async function mergeVideoAndAudio(videoBlob: Blob, audioFile: File): Promise<Blob> {
    const ffmpeg = await getFFmpeg();
    
    if (!window.FFmpeg) {
        throw new Error("FFmpeg library not loaded.");
    }
    const { fetchFile } = window.FFmpeg;

    const videoName = 'input.mp4';
    const audioName = 'input.audio';
    const outputName = 'output.mp4';

    // Write files to ffmpeg's virtual file system
    ffmpeg.FS('writeFile', videoName, await fetchFile(videoBlob));
    ffmpeg.FS('writeFile', audioName, await fetchFile(audioFile));

    try {
        // Run the ffmpeg command to merge video and audio.
        // -c:v copy: Copies the video stream without re-encoding, which is very fast.
        // -c:a aac: Encodes the audio to AAC, a standard for MP4.
        // -shortest: Finishes the output when the shortest input stream (usually the video) ends.
        await ffmpeg.run('-i', videoName, '-i', audioName, '-c:v', 'copy', '-c:a', 'aac', '-shortest', outputName);

        const data = ffmpeg.FS('readFile', outputName);

        return new Blob([data.buffer], { type: 'video/mp4' });

    } finally {
        // Clean up the virtual file system
        try {
            ffmpeg.FS('unlink', videoName);
            ffmpeg.FS('unlink', audioName);
            ffmpeg.FS('unlink', outputName);
        } catch (e) {
            console.error("Error unlinking files from ffmpeg FS", e);
        }
    }
}
