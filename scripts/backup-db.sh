#!/bin/bash
# Database backup script for electronics-component-finder
# This script creates a backup of the SQLite database and maintains a rolling set of backups

# Exit on error
set -e

# Configuration
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR=~/backups
DB_PATH=${DB_PATH:-~/app/data/component_finder.sqlite}
MAX_BACKUPS=${MAX_BACKUPS:-10}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database file not found at $DB_PATH"
  exit 1
fi

echo "Creating backup of $DB_PATH..."

# Create backup using SQLite's backup command
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/component_finder_$TIMESTAMP.sqlite'"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/component_finder_$TIMESTAMP.sqlite"

# Keep only the most recent backups
echo "Cleaning up old backups..."
ls -t $BACKUP_DIR/component_finder_*.sqlite.gz | tail -n +$((MAX_BACKUPS+1)) | xargs -r rm

echo "Backup completed: $BACKUP_DIR/component_finder_$TIMESTAMP.sqlite.gz"

# List current backups
echo "Current backups:"
ls -lh $BACKUP_DIR/component_finder_*.sqlite.gz | sort -r

# Optional: Add code here to copy backups to an offsite location
# Example using rclone (uncomment and configure as needed):
# rclone copy $BACKUP_DIR/component_finder_$TIMESTAMP.sqlite.gz remote:backups/
