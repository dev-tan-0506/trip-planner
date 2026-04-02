import { Module } from '@nestjs/common';
import { FundController } from './fund.controller';
import { FundService } from './fund.service';
import { LocalCostBenchmarkProvider } from './provider/local-cost-benchmark.provider';

@Module({
  controllers: [FundController],
  providers: [FundService, LocalCostBenchmarkProvider],
  exports: [FundService],
})
export class FundModule {}
