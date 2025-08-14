import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { LocalTranscoder } from '../services/transcoder.js';
import { promises as fs } from 'fs';
import path from 'path';
import { redis as connection } from '../lib/redis.js';

const prisma = new PrismaClient();
const transcoder = new LocalTranscoder();

// Create queue
const transcodeQueue = new Queue('video-transcode', {
  connection,
});

// Worker to process transcode jobs
const worker = new Worker('video-transcode', async (job) => {
  const { videoId, inputPath } = job.data;
  
  try {
    // Update video status to processing
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'UPLOADING' },
    });

    // Create output directory
    const outputDir = path.join(process.env.UPLOAD_DIR || './uploads', 'processed');
    await fs.mkdir(outputDir, { recursive: true });

    // Transcode video
    const result = await transcoder.transcode(inputPath, outputDir, videoId);

    // Update video with processed data
    await prisma.video.update({
      where: { id: videoId },
      data: {
        fileUrl: `/videos/${videoId}/file`,
        thumbUrl: `/videos/${videoId}/thumb`,
        durationSec: result.duration,
        status: 'READY',
      },
    });

    // Clean up temporary file
    await fs.unlink(inputPath);

    console.log(`✅ Video ${videoId} transcoded successfully`);
  } catch (error) {
    console.error(`❌ Error transcoding video ${videoId}:`, error);
    
    // Update video status to failed
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' },
    });

    // Clean up temporary file
    try {
      await fs.unlink(inputPath);
    } catch (cleanupError) {
      console.error('Error cleaning up temp file:', cleanupError);
    }

    throw error;
  }
}, {
  connection,
  concurrency: 2,
});

// Worker event handlers
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id || 'unknown'} failed:`, err);
});

worker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

export async function addTranscodeJob(videoId: string, inputPath: string) {
  await transcodeQueue.add('transcode', { videoId, inputPath }, {
    removeOnComplete: true,
    removeOnFail: 50,
  });
}

export { transcodeQueue };
