#!/bin/bash

NOTIFYUSER="pcon"
MAINDIR="/home/pcon/"
BACKUPDIR="/mnt/backup"

su $NOTIFYUSER alt-notify-send backup "Waiting for things to settle" 0
sleep 5

su $NOTIFYUSER alt-notify-send backup "Starting backup" 0
echo "$(date) - Mounting /dev/backup to $BACKUPDIR" > /tmp/backup.log
mount /dev/backup $BACKUPDIR >> /tmp/backup.log 2>&1
echo "$(date) - Staring rsync of $MAINDIR to $BACKUPDIR" >> /tmp/backup.log
rsync -arvuz --inplace --delete $MAINDIR $BACKUPDIR >> /tmp/backup.log 2>&1
echo "$(date) - Mounting /dev/backup to $BACKUPDIR" >> /tmp/backup.log
umount $BACKUPDIR >> /tmp/backup.log 2>&1
su $NOTIFYUSER alt-notify-send backup "Backup completed" 0
