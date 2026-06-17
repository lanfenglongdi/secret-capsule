#!/bin/bash
# Secret Capsule - Supabase to Local PostgreSQL Backup Script
# This script syncs data from Supabase (primary) to local PostgreSQL (backup)

set -e

# Configuration
SUPABASE_URL="https://fgushinpapaczugfztfg.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndXNoaW5wYXBhY3p1Z2Z6dGZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTMxOTYzOSwiZXhwIjoyMDk2ODk1NjM5fQ.U1YBb_tpTqB2Z1iw5gVZA5HGBoeZCkvfAho_l3GC4AI"

LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5432"
LOCAL_DB_NAME="secret_capsule_backup"
LOCAL_DB_USER="postgres"
LOCAL_DB_PASSWORD="SecretCapsule2026Backup"

BACKUP_DIR="/opt/secret-capsule/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/opt/secret-capsule/logs/backup_${TIMESTAMP}.log"

# Create directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

echo "========================================" | tee "$LOG_FILE"
echo "Secret Capsule Backup Script" | tee -a "$LOG_FILE"
echo "Started at: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Step 1: Export data from Supabase
echo "" | tee -a "$LOG_FILE"
echo "[1/4] Exporting data from Supabase..." | tee -a "$LOG_FILE"

EXPORT_FILE="$BACKUP_DIR/supabase_export_${TIMESTAMP}.json"

curl -s "${SUPABASE_URL}/rest/v1/secrets?select=*" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -o "$EXPORT_FILE"

if [ ! -s "$EXPORT_FILE" ]; then
  echo "ERROR: Failed to export data from Supabase" | tee -a "$LOG_FILE"
  exit 1
fi

RECORD_COUNT=$(jq 'length' "$EXPORT_FILE")
echo "Exported ${RECORD_COUNT} records from Supabase" | tee -a "$LOG_FILE"

# Step 2: Clear backup database
echo "" | tee -a "$LOG_FILE"
echo "[2/4] Clearing backup database..." | tee -a "$LOG_FILE"

PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -c "TRUNCATE TABLE secrets;" >> "$LOG_FILE" 2>&1

echo "Backup database cleared" | tee -a "$LOG_FILE"

# Step 3: Import data to local PostgreSQL
echo "" | tee -a "$LOG_FILE"
echo "[3/4] Importing data to local PostgreSQL..." | tee -a "$LOG_FILE"

# Convert JSON to SQL INSERT statements
python3 << PYTHON_SCRIPT >> "$LOG_FILE" 2>&1
import json
import sys

with open("$EXPORT_FILE", "r") as f:
    records = json.load(f)

print(f"Processing {len(records)} records...")

insert_count = 0
for record in records:
    # Escape single quotes
    id_val = record.get('id', '').replace("'", "''")
    cipher_val = record.get('cipher', '').replace("'", "''")
    salt_val = record.get('salt', '').replace("'", "''")
    iv_val = record.get('iv', '').replace("'", "''")
    captcha_token = record.get('captcha_token', '') or 'NULL'
    if captcha_token != 'NULL':
        captcha_token = "'" + captcha_token.replace("'", "''") + "'"
    
    created_at = record.get('created_at', '').replace("'", "''")
    retention_period = record.get('retention_period', '1month').replace("'", "''")
    expires_at = record.get('expires_at', '') or 'NULL'
    if expires_at != 'NULL':
        expires_at = "'" + expires_at.replace("'", "''") + "'"
    created_by = record.get('created_by', '') or 'NULL'
    if created_by != 'NULL':
        created_by = "'" + created_by.replace("'", "''") + "'"
    
    print(f"""INSERT INTO secrets (id, cipher, salt, iv, captcha_token, created_at, retention_period, expires_at, created_by)
VALUES ('{id_val}', '{cipher_val}', '{salt_val}', '{iv_val}', {captcha_token}, '{created_at}', '{retention_period}', {expires_at}, {created_by})
ON CONFLICT (id) DO NOTHING;""")
    insert_count += 1

print(f"Generated {insert_count} INSERT statements")
PYTHON_SCRIPT

# Execute the generated SQL
python3 << PYTHON_SCRIPT | PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" >> "$LOG_FILE" 2>&1
import json

with open("$EXPORT_FILE", "r") as f:
    records = json.load(f)

for record in records:
    id_val = record.get('id', '').replace("'", "''")
    cipher_val = record.get('cipher', '').replace("'", "''")
    salt_val = record.get('salt', '').replace("'", "''")
    iv_val = record.get('iv', '').replace("'", "''")
    captcha_token = record.get('captcha_token', '') or 'NULL'
    if captcha_token != 'NULL':
        captcha_token = "'" + captcha_token.replace("'", "''") + "'"
    
    created_at = record.get('created_at', '').replace("'", "''")
    retention_period = record.get('retention_period', '1month').replace("'", "''")
    expires_at = record.get('expires_at', '') or 'NULL'
    if expires_at != 'NULL':
        expires_at = "'" + expires_at.replace("'", "''") + "'"
    created_by = record.get('created_by', '') or 'NULL'
    if created_by != 'NULL':
        created_by = "'" + created_by.replace("'", "''") + "'"
    
    print(f"""INSERT INTO secrets (id, cipher, salt, iv, captcha_token, created_at, retention_period, expires_at, created_by)
VALUES ('{id_val}', '{cipher_val}', '{salt_val}', '{iv_val}', {captcha_token}, '{created_at}', '{retention_period}', {expires_at}, {created_by})
ON CONFLICT (id) DO NOTHING;""")
PYTHON_SCRIPT

echo "Data imported successfully" | tee -a "$LOG_FILE"

# Step 4: Verify backup
echo "" | tee -a "$LOG_FILE"
echo "[4/4] Verifying backup..." | tee -a "$LOG_FILE"

BACKUP_COUNT=$(PGPASSWORD="$LOCAL_DB_PASSWORD" psql -h "$LOCAL_DB_HOST" -p "$LOCAL_DB_PORT" -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -t -c "SELECT COUNT(*) FROM secrets;" | tr -d ' ')

echo "Backup contains ${BACKUP_COUNT} records" | tee -a "$LOG_FILE"

if [ "$BACKUP_COUNT" -eq "$RECORD_COUNT" ]; then
  echo "✅ Backup verification PASSED" | tee -a "$LOG_FILE"
else
  echo "⚠️  WARNING: Record count mismatch (Supabase: ${RECORD_COUNT}, Backup: ${BACKUP_COUNT})" | tee -a "$LOG_FILE"
fi

# Cleanup old backups (keep last 7 days)
echo "" | tee -a "$LOG_FILE"
echo "Cleaning up old backups..." | tee -a "$LOG_FILE"
find "$BACKUP_DIR" -name "*.json" -mtime +7 -delete 2>/dev/null || true
find "/opt/secret-capsule/logs" -name "backup_*.log" -mtime +30 -delete 2>/dev/null || true

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Backup completed successfully!" | tee -a "$LOG_FILE"
echo "Finished at: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
