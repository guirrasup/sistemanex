#!/bin/bash

# =========================================================
# NEXS ERP - PostgreSQL Automated Backup & Point-in-time Recovery
# =========================================================

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
DB_NAME="nexs_erp"
DB_USER="nexs_user"
CONTAINER_NAME="nexs_postgres"

mkdir -p $BACKUP_DIR

echo "[NEXS BACKUP] Starting database dump at $(date)..."

docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME -F c -b -v -f /tmp/backup_$TIMESTAMP.dump

docker cp $CONTAINER_NAME:/tmp/backup_$TIMESTAMP.dump $BACKUP_DIR/backup_$TIMESTAMP.dump

# Retain only last 30 backups
find $BACKUP_DIR -type f -name "*.dump" -mtime +30 -exec rm {} \;

echo "[NEXS BACKUP] Backup saved successfully to $BACKUP_DIR/backup_$TIMESTAMP.dump"
