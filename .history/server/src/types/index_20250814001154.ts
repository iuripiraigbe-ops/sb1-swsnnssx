import { z } from 'zod';

// User schemas
export const UserRoleSchema = z.enum(['PROFESSOR', 'ALUNO']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: UserRoleSchema.optional().default('ALUNO'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Professor Profile schemas
export const ProfessorProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  specialties: z.array(z.string()),
  verified: z.boolean(),
  links: z.record(z.string(), z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Video schemas
export const VideoStatusSchema = z.enum(['UPLOADING', 'READY', 'FAILED']);
export type VideoStatus = z.infer<typeof VideoStatusSchema>;

export const CreateVideoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  tags: z.array(z.string()).max(10),
});

export const VideoSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  durationSec: z.number(),
  fileUrl: z.string(),
  thumbUrl: z.string().nullable(),
  status: VideoStatusSchema,
  views: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Comment schemas
export const CreateCommentSchema = z.object({
  text: z.string().min(1).max(500),
});

export const CommentSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  authorId: z.string(),
  text: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Follow schemas
export const FollowSchema = z.object({
  followerId: z.string(),
  followingId: z.string(),
  createdAt: z.date(),
});

// Like schemas
export const LikeSchema = z.object({
  userId: z.string(),
  videoId: z.string(),
  createdAt: z.date(),
});

// Topic schemas
export const TopicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
});

// Report schemas
export const CreateReportSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const ReportSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  reporterId: z.string(),
  reason: z.string(),
  createdAt: z.date(),
  resolvedAt: z.date().nullable(),
});

// Feed schemas
export const FeedTypeSchema = z.enum(['home', 'following']);
export type FeedType = z.infer<typeof FeedTypeSchema>;

export const FeedQuerySchema = z.object({
  for: FeedTypeSchema.optional().default('home'),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).optional().default(10),
});

// Response schemas
export const FeedResponseSchema = z.object({
  videos: z.array(VideoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// File upload
export interface UploadedFile {
  filename: string;
  mimetype: string;
  size: number;
  path: string;
}

// WebSocket events
export interface WebSocketEvent {
  type: 'view' | 'like' | 'comment';
  videoId: string;
  data: any;
}
