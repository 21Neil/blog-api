import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import prisma from '../utils/prisma.js';
import { deleteFileFromR2 } from './storageService.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const getExpiredOrphanedKeys = async () => {
  const cutoffTime = dayjs().subtract(2, 'd').toDate();

  const keysToDelete = await prisma.tempImage.findMany({
    where: {
      referenced: false,
      uploadAt: {
        lt: cutoffTime,
      },
    },
  });
  console.log(keysToDelete, cutoffTime);

  return keysToDelete;
};

const removeKeyRecord = async id => {
  await prisma.tempImage.delete({
    where: {
      id,
    },
  });
};

export const runR2GarbageCollection = async () => {
  console.log(
    `[R2 GC] Staring cleanup job at ${dayjs().tz('Asia/Taipei').format()}`
  );

  const orphanedImages = await getExpiredOrphanedKeys();

  if (orphanedImages.length === 0) {
    console.log(`[R2 GC] No expired orphaned keys found.`);
    return;
  }

  orphanedImages.forEach(async item => {
    try {
      await deleteFileFromR2(item.id, false);
      await removeKeyRecord(item.id);

      console.log(`[R2 GC] Success deleted and removed key: ${item.id}`);
    } catch (err) {
      if (err.statusCode === 404) {
        await removeKeyRecord(item.id);

        console.log(
          `[R2 GC] Key ${item.id} not found in R2, removing record.`
        );
      } else {
        console.error(
          `[R2 GC] Failed to delete key ${item.id}:`,
          err.massage
        );
      }
    }
  });

  console.log(`[R2 GC] Cleanup job finished.`);
};
