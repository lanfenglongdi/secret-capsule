#!/bin/bash
# Secret Capsule - Check Backup Status Script

echo "========================================"
echo "Secret Capsule Backup Status"
echo "========================================"
echo ""

# Check PostgreSQL service
echo "1. PostgreSQL Service:"
if systemctl is-active postgresql > /dev/null 2>&1; then
  echo "   ✅ PostgreSQL is running"
else
  echo "   ❌ PostgreSQL is not running"
fi
echo ""

# Check backup database
echo "2. Backup Database:"
RECORD_COUNT=$(PGPASSWORD="SecretCapsule2026Backup" psql -h localhost -U postgres -d secret_capsule_backup -t -c "SELECT COUNT(*) FROM secrets;" 2>/dev/null | tr -d ' ')
if [ -n "$RECORD_COUNT" ]; then
  echo "   Total records in backup: $RECORD_COUNT"
else
  echo "   ⚠️  Cannot connect to backup database"
fi
echo ""

# Check latest backup log
echo "3. Latest Backup:"
LATEST_LOG=$(ls -t /opt/secret-capsule/logs/backup_*.log 2>/dev/null | head -1)
if [ -n "$LATEST_LOG" ]; then
  echo "   Log file: $LATEST_LOG"
  echo ""
  echo "   Last 10 lines:"
  tail -10 "$LATEST_LOG" | sed 's/^/   /'
else
  echo "   No backup logs found"
fi
echo ""

# Check cron job
echo "4. Scheduled Backup (Cron):"
crontab -l 2>/dev/null | grep backup-supabase-to-local.sh | sed 's/^/   /'
echo ""

# Check backup files
echo "5. Recent Backup Files:"
ls -lh /opt/secret-capsule/backups/*.json 2>/dev/null | tail -5 | sed 's/^/   /'
if [ $? -ne 0 ]; then
  echo "   No backup files found"
fi
echo ""

echo "========================================"
echo "Backup Configuration:"
echo "  - Frequency: Daily at 2:00 AM"
echo "  - Retention: 7 days for backup files, 30 days for logs"
echo "  - Source: Supabase (Primary)"
echo "  - Destination: Local PostgreSQL (Backup)"
echo "========================================"
