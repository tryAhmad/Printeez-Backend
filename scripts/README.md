# Database Migration Scripts

This folder contains database migration and utility scripts for the Printeez backend.

## Available Scripts

### Generate Slugs for Products

Automatically generates SEO-friendly URL slugs for all products that don't have them.

**Usage:**

```bash
npm run generate-slugs
```

**What it does:**

- Finds all products without slugs
- Generates slugs from product names (e.g., "Urban Street Vibes" → "urban-street-vibes")
- Handles duplicate slugs by adding number suffixes
- Shows progress and results

**Example Output:**

```
Found 10 products without slugs
✅ Updated: "Urban Street Vibes" -> urban-street-vibes
✅ Updated: "Typography Cool" -> typography-cool
⚠️  Duplicate slug found. Using: urban-tee-2 for "Urban Tee"

=== Migration Complete ===
✅ Successfully updated: 10 products
❌ Skipped: 0 products
```

## Before Running Scripts

Make sure you have:

1. Set up your `.env` file with `MONGODB_URI`
2. MongoDB is running (if local)
3. Backed up your database (for production)

## Notes

- These scripts can be run multiple times safely
- Existing slugs won't be overwritten
- Always test on development database first
