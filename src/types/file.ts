export interface FileWithPreview extends File {
  preview: string
}

export interface PresignedPostData {
  url: string
  fields: Record<string, string>
  key: string
  fileUrl: string
}
