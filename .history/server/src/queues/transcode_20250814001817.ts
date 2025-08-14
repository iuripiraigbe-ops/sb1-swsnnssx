import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { LocalTranscoder } from '../services/transcoder.js';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const transcoder = new LocalTranscoder();

// Create queue
const transcodeQueue = new Queue('video-transcode', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Worker to process transcode jobs
const worker = new Worker('video-transcode', async (job) => {
  const { videoId, inputPath } = job.data;
  
  try {
    console.log(`Starting transcode for video ${videoId}`);
    
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
        fileUrl: result.outputPath,
        thumbUrl: result.thumbnailPath,
        durationSec: Math.round(result.duration),
        status: 'READY',
      },
    });
    
    // Clean up original file
    await fs.unlink(inputPath);
    
    console.log(`Transcode completed for video ${videoId}`);
    
    return { success: true, videoId };
  } catch (error) {
    console.error(`Transcode failed for video ${videoId}:`, error);
    
    // Update video status to failed
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' },
    });
    
    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  concurrency: 2, // Process 2 videos at a time
});

// Handle worker events
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed for video ${job.data.videoId}`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed for video ${job.data.videoId}:`, err);
});

// Function to add transcode job to queue
export async function addTranscodeJob(videoId: string, inputPath: string) {
  await transcodeQueue.add('transcode', {
    videoId,
    inputPath,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
}

// Function to get queue status
export async function getQueueStatus() {
  const waiting = await transcodeQueue.getWaiting();
  const active = await transcodeQueue.getActive();
  const completed = await transcodeQueue.getCompleted();
  const failed = await transcodeQueue.getFailed();
  
  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
  };
}

// Graceful shutdown
export async function shutdownQueue() {
  await worker.close();
  await transcodeQueue.close();
}
