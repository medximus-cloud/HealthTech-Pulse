export enum Platform {
  LINKEDIN = 'LinkedIn',
  TWITTER = 'Twitter'
}

export enum ContentType {
  NEWS_ANALYSIS = 'News Analysis',
  POLL = 'Poll',
  QUESTION = 'Discussion Question',
  VIDEO_SCRIPT = 'Video Script'
}

export interface GeneratedContent {
  postText: string;
  imagePrompt: string;
}

export interface GenerationResult {
  content: GeneratedContent | null;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export enum GenerationStep {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface TrendItem {
  headline: string;
  summary: string;
}

export interface Source {
  title: string;
  uri: string;
}

export interface TrendsResult {
  trends: TrendItem[];
  sources: Source[];
}

export interface ScheduledPost {
  id: string;
  content: GeneratedContent;
  imageUrl: string | null;
  platform: Platform;
  scheduledDate: string; // ISO string
  createdAt: number;
}