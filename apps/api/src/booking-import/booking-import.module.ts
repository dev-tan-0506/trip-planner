import { Module } from '@nestjs/common';
import { ItineraryModule } from '../itinerary/itinerary.module';
import { BookingImportController } from './booking-import.controller';
import { BookingImportService } from './booking-import.service';

@Module({
  imports: [ItineraryModule],
  controllers: [BookingImportController],
  providers: [BookingImportService],
  exports: [BookingImportService],
})
export class BookingImportModule {}
