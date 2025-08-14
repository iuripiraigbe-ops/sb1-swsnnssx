import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'node:child_process';

export interface TranscodeResult {
  outputPath: string;
  thumbnailPath: string;
  duration: number;
}

// Function to get video duration using ffprobe
export async function getVideoDurationWithFfprobe(inputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const p = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      inputPath
    ]);
    
    let out = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.on('close', () => resolve(Math.floor(parseFloat(out || '0'))));
    p.on('error', reject);
  });
}

// Validate video duration (max 90 seconds)
export async function validateVideoDuration(inputPath: string): Promise<boolean> {
  try {
    const duration = await getVideoDurationWithFfprobe(inputPath);
    return duration <= 90;
  } catch (error) {
    console.error('Error validating video duration:', error);
    return false;
  }
}

export async function transcodeVideo(
  inputPath: string,
  outputDir: string,
  filename: string
): Promise<TranscodeResult> {
  const outputPath = path.join(outputDir, `${filename}.mp4`);
  const thumbnailPath = path.join(outputDir, `${filename}_thumb.jpg`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset fast',
        '-crf 23',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart',
        '-vf scale=720:-2', // Scale to 720p
      ])
      .output(outputPath)
      .on('end', async () => {
        try {
          // Generate thumbnail
          await generateThumbnail(inputPath, thumbnailPath);
          
          // Get duration
          const duration = await getVideoDurationWithFfprobe(outputPath);
          
          resolve({
            outputPath,
            thumbnailPath,
            duration,
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject)
      .run();
  });
}

async function generateThumbnail(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: ['50%'], // Take screenshot at 50% of video
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x240',
      })
      .on('end', () => resolve())
      .on('error', reject);
  });
}

export async function getVideoDuration(inputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(Math.floor(metadata.format.duration || 0));
    });
  });
}

export async function validateVideo(inputPath: string): Promise<boolean> {
  try {
    const duration = await getVideoDuration(inputPath);
    return duration <= 90; // Máximo 90 segundos
  } catch (error) {
    return false;
  }
}

export interface TranscoderService {
  transcode(inputPath: string, outputDir: string, filename: string): Promise<TranscodeResult>;
  validate(inputPath: string): Promise<boolean>;
}

export class LocalTranscoder implements TranscoderService {
  async transcode(inputPath: string, outputDir: string, filename: string): Promise<TranscodeResult> {
    return transcodeVideo(inputPath, outputDir, filename);
  }

  async validate(inputPath: string): Promise<boolean> {
    return validateVideoDuration(inputPath);
  }
}

// Placeholder for future cloud transcoder integration
export class CloudTranscoder implements TranscoderService {
  async transcode(inputPath: string, outputDir: string, filename: string): Promise<TranscodeResult> {
    // TODO: Implement cloud transcoding (Mux, Cloudflare Stream, etc.)
    throw new Error('Cloud transcoding not implemented yet');
  }

  async validate(inputPath: string): Promise<boolean> {
    return validateVideoDuration(inputPath);
  }
}
