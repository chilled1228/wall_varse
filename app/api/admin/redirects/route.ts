import { NextRequest, NextResponse } from 'next/server'
import { redirectService } from '@/lib/redirect-service'

// GET - Get all redirect rules and legacy redirects
export async function GET() {
  try {
    // Get custom redirect rules
    const customRedirects = redirectService.getActiveRedirects()

    // Generate legacy redirects
    const legacyRedirects = await redirectService.generateLegacyRedirects()

    return NextResponse.json({
      success: true,
      customRedirects,
      legacyRedirects,
      total: customRedirects.length + legacyRedirects.length
    })

  } catch (error) {
    console.error('Error getting redirects:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get redirects'
      },
      { status: 500 }
    )
  }
}

// POST - Add new redirect rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from, to, type = '301' } = body

    if (!from || !to) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: from, to'
        },
        { status: 400 }
      )
    }

    // Validate redirect type
    if (type !== '301' && type !== '302') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid redirect type. Must be 301 or 302'
        },
        { status: 400 }
      )
    }

    // Add redirect rule
    redirectService.addRedirectRule(from, to, type)

    return NextResponse.json({
      success: true,
      message: 'Redirect rule added successfully',
      redirect: {
        from,
        to,
        type
      }
    })

  } catch (error) {
    console.error('Error adding redirect rule:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add redirect rule'
      },
      { status: 500 }
    )
  }
}