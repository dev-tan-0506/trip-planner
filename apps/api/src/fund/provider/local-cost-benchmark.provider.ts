import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type BenchmarkSeed = {
  medianAmount: string;
  highThresholdAmount: string;
  sourceLabel: string;
  confidenceLabel: 'Gợi ý' | 'Ước lượng' | 'Cần xem lại';
  note: string;
};

export type CostBenchmarkResult = BenchmarkSeed & {
  destinationLabel: string;
  normalizedCategory: string;
};

const DESTINATION_BENCHMARKS: Record<string, Partial<Record<string, BenchmarkSeed>>> = {
  'da nang': {
    FOOD: {
      medianAmount: '90000',
      highThresholdAmount: '180000',
      sourceLabel: 'Mặt bằng quán ăn phổ biến Đà Nẵng',
      confidenceLabel: 'Gợi ý',
      note: 'Mốc này hợp để đối chiếu nhanh với bữa ăn thông thường trong khu vực.',
    },
    TRANSPORT: {
      medianAmount: '120000',
      highThresholdAmount: '250000',
      sourceLabel: 'Giá di chuyển nội thành Đà Nẵng',
      confidenceLabel: 'Ước lượng',
      note: 'Nên đối chiếu thêm quãng đường và giờ cao điểm nếu giá tăng đột biến.',
    },
    ACCOMMODATION: {
      medianAmount: '850000',
      highThresholdAmount: '1500000',
      sourceLabel: 'Khung phòng tầm trung gần biển Đà Nẵng',
      confidenceLabel: 'Ước lượng',
      note: 'Giá phòng có thể thay đổi theo cuối tuần và view gần biển.',
    },
    TICKETS: {
      medianAmount: '150000',
      highThresholdAmount: '320000',
      sourceLabel: 'Vé tham quan phổ biến tại Đà Nẵng',
      confidenceLabel: 'Ước lượng',
      note: 'Mốc tham khảo này phù hợp cho điểm tham quan phổ biến, không phải vé sự kiện đặc biệt.',
    },
  },
  'da lat': {
    FOOD: {
      medianAmount: '80000',
      highThresholdAmount: '160000',
      sourceLabel: 'Mặt bằng quán ăn phổ biến Đà Lạt',
      confidenceLabel: 'Gợi ý',
      note: 'Giá tham khảo dành cho quán ăn thông thường quanh trung tâm.',
    },
    TRANSPORT: {
      medianAmount: '100000',
      highThresholdAmount: '220000',
      sourceLabel: 'Giá di chuyển nội thành Đà Lạt',
      confidenceLabel: 'Ước lượng',
      note: 'Cần đối chiếu thêm độ dốc và khoảng cách thực tế của lộ trình.',
    },
  },
  'hoi an': {
    FOOD: {
      medianAmount: '100000',
      highThresholdAmount: '190000',
      sourceLabel: 'Mặt bằng quán ăn phố cổ Hội An',
      confidenceLabel: 'Gợi ý',
      note: 'Nên đối chiếu thêm vị trí trong phố cổ và phụ thu du lịch cao điểm.',
    },
    TICKETS: {
      medianAmount: '120000',
      highThresholdAmount: '250000',
      sourceLabel: 'Giá vé tham quan và trải nghiệm phố cổ',
      confidenceLabel: 'Ước lượng',
      note: 'Soát lại gói vé nếu đã bao gồm combo hay hướng dẫn viên.',
    },
  },
};

@Injectable()
export class LocalCostBenchmarkProvider {
  getBenchmarkForExpense(
    destination: string,
    category: string,
    amount: Prisma.Decimal,
    currency: string,
  ): CostBenchmarkResult {
    const destinationLabel = destination.trim() || 'chưa rõ điểm đến';
    const normalizedDestination = destinationLabel.toLowerCase();
    const normalizedCategory = category.toUpperCase();
    const seed = DESTINATION_BENCHMARKS[normalizedDestination]?.[normalizedCategory];

    if (!seed || currency.toUpperCase() !== 'VND') {
      return {
        destinationLabel,
        normalizedCategory,
        medianAmount: amount.toString(),
        highThresholdAmount: amount.toString(),
        sourceLabel: 'Cần đối chiếu tại chỗ',
        confidenceLabel: 'Cần xem lại',
        note: 'Chưa có mốc giá ổn định cho điểm đến hoặc danh mục này, nên xem đây là cảnh báo mềm để kiểm tra lại.',
      };
    }

    return {
      destinationLabel,
      normalizedCategory,
      ...seed,
    };
  }
}
