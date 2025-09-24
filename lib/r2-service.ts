import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// R2 Client Configuration - initialized lazily to work with server-side only
let r2Client: S3Client | null = null

function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  }
  return r2Client
}

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

export class R2Service {
  private static instance: R2Service
  private bucketName = process.env.R2_BUCKET_NAME!
  private publicUrl = process.env.R2_PUBLIC_URL!

  static getInstance(): R2Service {
    if (!R2Service.instance) {
      R2Service.instance = new R2Service()
    }
    return R2Service.instance
  }

  // Upload file to R2
  async uploadFile(file: File, key: string): Promise<UploadResult> {
    try {
      const buffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(buffer)

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: uint8Array,
        ContentType: file.type,
        ContentDisposition: 'inline',
      })

      await getR2Client().send(command)

      const publicUrl = `${this.publicUrl}/${key}`

      return {
        success: true,
        url: publicUrl,
        key: key,
      }
    } catch (error) {
      console.error('Error uploading to R2:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  // Delete file from R2
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })

      await getR2Client().send(command)

      return { success: true }
    } catch (error) {
      console.error('Error deleting from R2:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      }
    }
  }

  // Generate presigned URL for uploading
  async getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    })

    return await getSignedUrl(getR2Client(), command, { expiresIn: 3600 })
  }

  // Generate wallpaper key based on title and timestamp
  generateWallpaperKey(title: string, extension: string): string {
    const timestamp = Date.now()
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    return `wallpapers/${sanitizedTitle}-${timestamp}.${extension}`
  }

  // Get public URL from key
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`
  }

  // Extract key from public URL
  extractKeyFromUrl(url: string): string | null {
    if (url.startsWith(this.publicUrl)) {
      return url.replace(`${this.publicUrl}/`, '')
    }
    return null
  }

  // Validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 50MB.',
      }
    }

    return { valid: true }
  }

  // Get file extension from mime type
  getExtensionFromMimeType(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        return 'jpg'
      case 'image/png':
        return 'png'
      case 'image/webp':
        return 'webp'
      default:
        return 'jpg'
    }
  }
}

// Export singleton instance
export const r2Service = R2Service.getInstance()