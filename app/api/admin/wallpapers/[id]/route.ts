import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { r2Service } from '@/lib/r2-service'

// GET - Get wallpaper by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'wallpapers', params.id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Wallpaper not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      wallpaper: {
        id: docSnap.id,
        ...docSnap.data(),
      },
    })
  } catch (error) {
    console.error('Error getting wallpaper:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update wallpaper
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, category, tags, resolution, deviceType } = body

    // Validate required fields
    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const docRef = doc(db, 'wallpapers', params.id)

    // Check if wallpaper exists
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Wallpaper not found' },
        { status: 404 }
      )
    }

    // Parse tags
    const tagsArray = Array.isArray(tags)
      ? tags.map(tag => tag.toLowerCase())
      : tags?.split(',').map((tag: string) => tag.trim().toLowerCase()).filter((tag: string) => tag.length > 0) || []

    // Update wallpaper
    const updateData = {
      title: title.toUpperCase(),
      category: category.toLowerCase(),
      tags: tagsArray,
      resolution: resolution || '1080x1920',
      deviceType: deviceType || 'phone',
      updatedAt: serverTimestamp(),
    }

    await updateDoc(docRef, updateData)

    return NextResponse.json({
      success: true,
      wallpaper: {
        id: params.id,
        ...docSnap.data(),
        ...updateData,
      },
    })
  } catch (error) {
    console.error('Error updating wallpaper:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete wallpaper
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'wallpapers', params.id)

    // Get wallpaper data first
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Wallpaper not found' },
        { status: 404 }
      )
    }

    const wallpaperData = docSnap.data()

    // Delete from R2 if r2Key exists
    if (wallpaperData.r2Key) {
      try {
        await r2Service.deleteFile(wallpaperData.r2Key)
      } catch (r2Error) {
        console.error('Error deleting from R2:', r2Error)
        // Continue with Firestore deletion even if R2 deletion fails
      }
    }

    // Delete from Firestore
    await deleteDoc(docRef)

    return NextResponse.json({
      success: true,
      message: 'Wallpaper deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting wallpaper:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}