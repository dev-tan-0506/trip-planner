import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TripsModule } from './trips/trips.module';
import { AuthModule } from './auth/auth.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { ProposalsModule } from './proposals/proposals.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

