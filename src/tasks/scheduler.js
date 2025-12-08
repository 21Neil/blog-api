import cron from 'node-cron';
import { runR2GarbageCollection } from '../services/cleanupService.js'

export const startR2CleanCron = () => {
  cron.schedule('0 0 4 * * *', runR2GarbageCollection, {
    timezone: "Asia/Taipei"
  })

  console.log('R2 Cleanup Cron Job schedule for 4:00 AM daily (Taipei Time)')
}
