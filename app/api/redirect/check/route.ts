import { NextRequest, NextResponse } from 'next/server'
import { redirectService } from '@/lib/redirect-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing path parameter'
        },
        { status: 400 }
      )
    }

    const redirect = await redirectService.getRedirect(path)

    if (redirect) {
      return NextResponse.json({
        success: true,
        redirect: {
          from: redirect.from,
          to: redirect.to,
          type: redirect.type
        },
        message: 'Redirect found'
      })
    } else {
      return NextResponse.json({
        success: true,
        redirect: null,
        message: 'No redirect needed'
      })
    }

  } catch (error) {
    console.error('Error checking redirect:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}