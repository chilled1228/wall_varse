#!/usr/bin/env node

/**
 * Migration script to add slugs to existing wallpapers
 * Run with: node scripts/migrate-slugs.js
 */

const { wallpaperService } = require('../lib/wallpaper-service');

async function migrateSlugs() {
  console.log('🚀 Starting slug migration...');

  try {
    const result = await wallpaperService.addMissingSlugs();

    console.log('✅ Migration completed!');
    console.log(`📊 Updated ${result.updated} wallpapers with slugs`);

    if (result.errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (result.updated > 0) {
      console.log('\n🎉 Migration successful! Your wallpapers now have SEO-friendly slugs.');
      console.log('💡 Example URLs:');
      console.log('   /wallpaper/neon-city-glow');
      console.log('   /wallpaper/sunset-mountains');
      console.log('   /wallpaper/abstract-minimal-art');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateSlugs();