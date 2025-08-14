import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

export interface TranscodeResult {
  outputPath: string;
  thumbnailPath: string;
  duration: number;
}

export async function transcodeVideo(
  inputPath: string,
  outputDir: string,
  filename: string
): Promise<TranscodeResult> {
  const outputPath = path.join(outputDir, `${filename}.mp4`);
  const thumbnailPath = path.join(outputDir, `${filename}_thumb.jpg`);

  return new Promise((resolve, reject) => {
    let duration = 0;

    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size('1280x720')
      .videoBitrate('1000k')
      .audioBitrate('128k')
      .fps(30)
      .on('progress', (progress) => {
        console.log(`Transcoding progress: ${progress.percent}%`);
      })
      .on('end', async () => {
        try {
          // Generate thumbnail
          await generateThumbnail(inputPath, thumbnailPath);
          
          resolve({
            outputPath,
            thumbnailPath,
            duration,
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('codecData', (data) => {
        duration = parseFloat(data.duration);
      })
      .save(outputPath);
  });
}

async function generateThumbnail(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: ['50%'],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x240',
      })
      .on('end', () => resolve())
      .on('error', (error) => reject(error));
  });
}

export async function getVideoDuration(inputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (error, metadata) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(metadata.format.duration || 0);
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

// Interface para futuras integrações com serviços externos
export interface TranscoderService {
  transcode(inputPath: string, outputDir: string, filename: string): Promise<TranscodeResult>;
  validate(inputPath: string): Promise<boolean>;
}

// Implementação local atual
export class LocalTranscoder implements TranscoderService {
  async transcode(inputPath: string, outputDir: string, filename: string): Promise<TranscodeResult> {
    return transcodeVideo(inputPath, outputDir, filename);
  }

  async validate(inputPath: string): Promise<boolean> {
    return validateVideo(inputPath);
  }
}

// Interface para Mux/Cloudflare Stream (futuro)
export class CloudTranscoder implements TranscoderService {
  async transcode(inputPath: string, outputDir: string, filename: string): Promise<TranscodeResult> {
    // TODO: Implementar integração com Mux ou Cloudflare Stream
    throw new Error('Cloud transcoder not implemented yet');
  }

  async validate(inputPath: string): Promise<boolean> {
    // TODO: Implementar validação via API
    return validateVideo(inputPath);
  }
}
