import { Module } from '@nestjs/common'
import { BackupService } from './backup.service'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
	imports: [ScheduleModule.forRoot()],
	providers: [BackupService],
	exports: [BackupService],
})
export class BackupModule {}
