import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TripsModule } from './trips/trips.module';
import { AuthModule } from './auth/auth.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { ProposalsModule } from './proposals/proposals.module';
import { VotesModule } from './votes/votes.module';
import { TemplatesModule } from './templates/templates.module';
import { LogisticsModule } from './logistics/logistics.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { AttendanceModule } from './attendance/attendance.module';
import { FundModule } from './fund/fund.module';
import { SafetyModule } from './safety/safety.module';
import { BookingImportModule } from './booking-import/booking-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    AuthModule,
    TripsModule,
    ItineraryModule,
    ProposalsModule,
    VotesModule,
    TemplatesModule,
    LogisticsModule,
    ChecklistsModule,
    AttendanceModule,
    FundModule,
    SafetyModule,
    BookingImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
