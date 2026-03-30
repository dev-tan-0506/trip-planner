import { Module } from '@nestjs/common';
import { SafetyController } from './safety.controller';
import { SafetyService } from './safety.service';
import { WeatherProvider } from './provider/weather.provider';
import { CrowdProvider } from './provider/crowd.provider';
import { DirectoryProvider } from './provider/directory.provider';
import { SafetyGateway } from './safety.gateway';

@Module({
  controllers: [SafetyController],
  providers: [
    SafetyService,
    WeatherProvider,
    CrowdProvider,
    DirectoryProvider,
    SafetyGateway,
  ],
  exports: [SafetyService],
})
export class SafetyModule {}
