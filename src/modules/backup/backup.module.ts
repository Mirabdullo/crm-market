import { Module } from '@nestjs/common'
import { BackupService } from './backup.service'
import { ScheduleModule } from '@nestjs/schedule'
import { TelegramModule } from '../telegram'

@Module({
	imports: [ScheduleModule.forRoot(), TelegramModule],
	providers: [BackupService],
	exports: [BackupService],
})
export class BackupModule {}
