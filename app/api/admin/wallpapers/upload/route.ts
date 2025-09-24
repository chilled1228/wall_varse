import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { r2Service } from '@/lib/r2-service'
import { slugService } from '@/lib/slug-service'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const slug = formData.get('slug') as string
    const tags = formData.get('tags') as string
    const resolution = formData.get('resolution') as string
    const deviceType = formData.get('deviceType') as string

    // Validate required fields
    if (!file || !title || !category || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = r2Service.validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Generate unique key for the file
    const extension = r2Service.getExtensionFromMimeType(file.type)
    const key = r2Service.generateWallpaperKey(title, extension)

    // Upload to R2
    const uploadResult = await r2Service.uploadFile(file, key)
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      )
    }

    // Parse tags
    const tagsArray = tags
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : []

    // Calculate file size
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1)

    // Create wallpaper document in Firestore
    const wallpaperData = {
      title: title.toUpperCase(),
      category: category.toLowerCase(),
      slug: slug,
      slugHistory: [slug],
      customSlug: true,
      downloads: 0,
      likes: 0,
      imageUrl: uploadResult.url!,
      r2Key: uploadResult.key!,
      resolution: resolution || '1080x1920',
      deviceType: deviceType || 'phone',
      tags: tagsArray.map(tag => tag.toLowerCase()),
      fileSize: `${fileSizeInMB} MB`,
      createdAt: serverTimestamp(),
    }

    // Add to Firestore
    const wallpapersCollection = collection(db, 'wallpapers')
    const docRef = await addDoc(wallpapersCollection, wallpaperData)

    return NextResponse.json({
      success: true,
      wallpaper: {
        id: docRef.id,
        ...wallpaperData,
        imageUrl: uploadResult.url,
      },
    })
  } catch (error) {
    console.error('Error uploading wallpaper:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}