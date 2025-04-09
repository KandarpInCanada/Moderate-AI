export interface ImageMetadata {
  id: string
  key: string
  filename: string
  url: string
  size: number
  lastModified: Date | string
  uploadDate?: string
  labels: string[]
  faces: number
  location: string
  confidence?: number
  dimensions?: string
  rekognitionDetails: {
    labels: Array<{ name: string; confidence: number }>
    faces: number
    celebrities: Array<{ name: string; confidence: number }>
    text: string[]
    analyzedAt: string
  }
}
