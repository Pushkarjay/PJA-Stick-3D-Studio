#!/bin/bash
# Firestore Export Script
# Exports Firestore database to Cloud Storage for backup

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
BACKUP_BUCKET="gs://${PROJECT_ID}-backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH="${BACKUP_BUCKET}/firestore-${DATE}"

echo "================================"
echo "Firestore Backup Script"
echo "================================"
echo "Project: $PROJECT_ID"
echo "Backup location: $BACKUP_PATH"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "Error: Not authenticated with gcloud"
    echo "Run: gcloud auth login"
    exit 1
fi

# Set project
gcloud config set project "$PROJECT_ID"

# Check if backup bucket exists
if ! gsutil ls "$BACKUP_BUCKET" &> /dev/null; then
    echo "Creating backup bucket..."
    gsutil mb -p "$PROJECT_ID" -c STANDARD -l us-central1 "$BACKUP_BUCKET"
    echo "✓ Backup bucket created"
fi

# Export Firestore
echo "Starting Firestore export..."
gcloud firestore export "$BACKUP_PATH" \
    --project="$PROJECT_ID" \
    --async

echo "✓ Export initiated"
echo ""
echo "Export started in background. Check status with:"
echo "gcloud firestore operations list --project=$PROJECT_ID"
echo ""
echo "When complete, backup will be at:"
echo "$BACKUP_PATH"
echo ""

# List recent backups
echo "Recent backups:"
gsutil ls "$BACKUP_BUCKET" | tail -5

# Cleanup old backups (keep last 30 days)
echo ""
echo "Cleaning up old backups (>30 days)..."
THIRTY_DAYS_AGO=$(date -d "30 days ago" +%Y%m%d 2>/dev/null || date -v-30d +%Y%m%d)

gsutil ls "$BACKUP_BUCKET" | while read -r backup; do
    BACKUP_DATE=$(echo "$backup" | grep -oP 'firestore-\K\d{8}' || echo "")
    if [ -n "$BACKUP_DATE" ] && [ "$BACKUP_DATE" -lt "$THIRTY_DAYS_AGO" ]; then
        echo "Deleting old backup: $backup"
        gsutil -m rm -r "$backup"
    fi
done

echo "✓ Cleanup complete"
echo ""
echo "================================"
echo "Backup Process Complete"
echo "================================"

# To restore from backup:
echo "To restore from this backup, run:"
echo "gcloud firestore import $BACKUP_PATH --project=$PROJECT_ID"
