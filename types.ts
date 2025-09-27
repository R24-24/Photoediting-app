export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface GeneratedContent {
  media: string | null;
  mediaType: 'image' | 'video' | null;
  text: string | null;
}

export type ToolType = 'select' | 'magic-edit' | 'crop' | 'adjust' | 'text' | 'filter';