import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'
import { collection, addDoc, doc, setDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { slugService } from '@/lib/slug-service'

interface CSVRow {
  title: string
  imageUrl: string
  category: string
  tags?: string
  resolution?: string
  deviceType?: string
  customSlug?: string
  description?: string
}

interface ImportResult {
  success: boolean
  rowNumber: number
  wallpaper?: any
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No CSV file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'File must be a CSV file' },
        { status: 400 }
      )
    }

    // Read and parse CSV file
    const csvContent = await file.text()
    let parsedData: CSVRow[]

    try {
      parsedData = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSV format' },
        { status: 400 }
      )
    }

    if (parsedData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'CSV file is empty' },
        { status: 400 }
      )
    }

    // Get existing categories
    const existingCategories = new Set<string>()
    const categoriesCollection = collection(db, 'categories')

    // Get predefined categories
    const predefinedCategories = [
      'nature', 'abstract', 'minimal', 'dark', 'colorful',
      'space', 'animals', 'cars', 'architecture'
    ]
    predefinedCategories.forEach(cat => existingCategories.add(cat))

    // Check for existing custom categories in database
    try {
      const categoriesSnapshot = await getDocs(categoriesCollection)
      categoriesSnapshot.docs.forEach(doc => {
        existingCategories.add(doc.data().slug)
      })
    } catch (error) {
      console.warn('Could not fetch existing categories:', error)
    }

    const results: ImportResult[] = []
    const newCategories = new Set<string>()
    const wallpapersCollection = collection(db, 'wallpapers')

    // Process each row
    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i]
      const rowNumber = i + 2 // +2 because of header row and 0-based index

      try {
        // Validate required fields
        if (!row.title || !row.imageUrl || !row.category) {
          results.push({
            success: false,
            rowNumber,
            error: 'Missing required fields: title, imageUrl, or category'
          })
          continue
        }

        // Prepare category
        const categorySlug = row.category.toLowerCase().trim()

        // Track new categories to create
        if (!existingCategories.has(categorySlug)) {
          newCategories.add(categorySlug)
          existingCategories.add(categorySlug)
        }

        // Parse tags
        const tagsArray = row.tags
          ? row.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
          : []

        // Generate slug
        let slug: string
        if (row.customSlug && row.customSlug.trim()) {
          slug = row.customSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
        } else {
          const baseSlug = slugService.generateSlug(row.title)
          slug = await slugService.generateUniqueSlug(baseSlug)
        }

        // Calculate default values
        const resolution = row.resolution || '1080x1920'
        const deviceType = row.deviceType || 'phone'

        // Create wallpaper document
        const wallpaperData = {
          title: row.title.toUpperCase(),
          category: categorySlug,
          slug: slug,
          slugHistory: [slug],
          customSlug: Boolean(row.customSlug && row.customSlug.trim()),
          downloads: 0,
          likes: 0,
          imageUrl: row.imageUrl,
          resolution: resolution,
          deviceType: deviceType,
          tags: tagsArray,
          description: row.description || `${row.title} wallpaper in ${categorySlug} category`,
          fileSize: '0 MB', // Will be updated when image is processed
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        // Add to Firestore
        const docRef = await addDoc(wallpapersCollection, wallpaperData)

        results.push({
          success: true,
          rowNumber,
          wallpaper: {
            id: docRef.id,
            ...wallpaperData
          }
        })

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error)
        results.push({
          success: false,
          rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
      }
    }

    // Create new categories
    const createdCategories: string[] = []
    for (const categorySlug of newCategories) {
      try {
        const categoryData = {
          slug: categorySlug,
          name: categorySlug.toUpperCase(),
          description: `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} wallpapers`,
          count: 0,
          featured: false,
          createdAt: serverTimestamp()
        }

        const categoryDocRef = doc(categoriesCollection, categorySlug)
        await setDoc(categoryDocRef, categoryData)
        createdCategories.push(categorySlug)
      } catch (error) {
        console.error(`Error creating category ${categorySlug}:`, error)
      }
    }

    // Calculate statistics
    const successfulImports = results.filter(r => r.success).length
    const failedImports = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: parsedData.length,
        successful: successfulImports,
        failed: failedImports,
        newCategoriesCreated: createdCategories.length
      },
      results: results,
      createdCategories: createdCategories
    })

  } catch (error) {
    console.error('Error in bulk import:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error during import' },
      { status: 500 }
    )
  }
}