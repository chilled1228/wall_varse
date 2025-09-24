# Bulk Wallpaper Import Feature

## Overview
The bulk import feature allows administrators to import multiple wallpapers at once using a CSV file. This feature automatically creates categories if they don't exist and generates SEO-friendly slugs.

## How to Use

1. **Access the Feature**
   - Go to Admin Dashboard → Wallpapers tab
   - Click the "BULK IMPORT" button

2. **CSV File Format**
   Your CSV file must have the following columns:

   **Required columns:**
   - `title` - The wallpaper title (will be converted to uppercase)
   - `imageUrl` - Direct URL to the image file
   - `category` - Category slug (will be created if doesn't exist)

   **Optional columns:**
   - `tags` - Comma-separated tags (e.g., "nature,mountain,landscape")
   - `resolution` - Image resolution (default: "1080x1920")
   - `deviceType` - Target device (default: "phone", can be "desktop", "tablet")
   - `customSlug` - Custom slug for the wallpaper (leave empty for auto-generation)
   - `description` - Wallpaper description (auto-generated if not provided)

3. **Sample CSV Format**
   ```csv
   title,imageUrl,category,tags,resolution,deviceType,customSlug,description
   SUNSET MOUNTAINS,https://example.com/image1.jpg,nature,"sunset,mountain",1080x1920,phone,sunset-mountains,"Beautiful mountain sunrise with golden light"
   GEOMETRIC PATTERN,https://example.com/image2.jpg,abstract,"geometric,modern",1080x1920,phone,,"Modern geometric shapes and patterns"
   OCEAN WAVES,https://example.com/image3.jpg,nature,"ocean,blue",2560x1440,desktop,ocean-4k,"Peaceful ocean waves at sunset"
   ```

## Features

- **Automatic Category Creation**: New categories are automatically created if they don't exist
- **Slug Generation**: SEO-friendly slugs are auto-generated from titles if not provided
- **Progress Tracking**: Real-time import progress with detailed results
- **Error Handling**: Detailed error reporting for failed imports
- **Validation**: Validates required fields and file format

## Import Results

After import, you'll see:
- **Summary Statistics**: Total rows, successful imports, failures, new categories created
- **Success Rate**: Percentage of successful imports
- **New Categories**: List of newly created categories
- **Detailed Results**: Row-by-row success/failure status with error messages

## Error Handling

Common errors and solutions:
- **Missing required fields**: Ensure title, imageUrl, and category are provided
- **Invalid image URLs**: Verify all image URLs are accessible
- **CSV format issues**: Use proper CSV formatting with headers

## Tips for Best Results

1. **Test with small batches** first (5-10 wallpapers)
2. **Use valid image URLs** that are publicly accessible
3. **Keep category names simple** (lowercase, no special characters)
4. **Provide meaningful tags** for better searchability
5. **Use consistent resolution formats** (e.g., "1080x1920", "2560x1440")

## Supported Image Sources

- Direct image URLs (HTTPS recommended)
- CDN links
- Public cloud storage URLs
- Any publicly accessible image URL

## Download Sample CSV

A sample CSV file is available in the bulk import dialog - click "DOWNLOAD SAMPLE CSV" to get a template with examples.