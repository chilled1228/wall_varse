import { NextResponse } from 'next/server'
import { getAllResolutions, getAllDeviceTypes } from '@/lib/dynamic-category-service'

export async function GET() {
  try {
    const [resolutions, deviceTypes] = await Promise.all([
      getAllResolutions(),
      getAllDeviceTypes()
    ])

    return NextResponse.json({
      success: true,
      resolutions,
      deviceTypes,
    })
  } catch (error) {
    console.error('Error fetching dynamic options:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dynamic options' },
      { status: 500 }
    )
  }
}