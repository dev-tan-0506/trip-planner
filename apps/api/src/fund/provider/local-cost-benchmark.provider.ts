import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type BenchmarkSeed = {
  medianAmount: string;
  highThresholdAmount: string;
  sourceLabel: string;
  confidenceLabel: 'Goi y' | 'Uoc luong' | 'Can xem lai';
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
      sourceLabel: 'Mat bang quan an pho bien Da Nang',
      confidenceLabel: 'Goi y',
      note: 'Moc nay hop de doi chieu nhanh voi bua an thong thuong trong khu vuc.',
    },
    TRANSPORT: {
      medianAmount: '120000',
      highThresholdAmount: '250000',
      sourceLabel: 'Gia di chuyen noi thanh Da Nang',
      confidenceLabel: 'Uoc luong',
      note: 'Nen doi chieu them quang duong va gio cao diem neu gia tang dot bien.',
    },
    ACCOMMODATION: {
      medianAmount: '850000',
      highThresholdAmount: '1500000',
      sourceLabel: 'Khung phong tam trung gan bien Da Nang',
      confidenceLabel: 'Uoc luong',
      note: 'Gia phong co the thay doi theo cuoi tuan va view gan bien.',
    },
    TICKETS: {
      medianAmount: '150000',
      highThresholdAmount: '320000',
      sourceLabel: 'Ve tham quan pho bien tai Da Nang',
      confidenceLabel: 'Uoc luong',
      note: 'Moc tham khao nay phu hop cho diem tham quan pho bien, khong phai ve su kien dac biet.',
    },
  },
  'da lat': {
    FOOD: {
      medianAmount: '80000',
      highThresholdAmount: '160000',
      sourceLabel: 'Mat bang quan an pho bien Da Lat',
      confidenceLabel: 'Goi y',
      note: 'Gia tham khao danh cho quan an thong thuong quanh trung tam.',
    },
    TRANSPORT: {
      medianAmount: '100000',
      highThresholdAmount: '220000',
      sourceLabel: 'Gia di chuyen noi thanh Da Lat',
      confidenceLabel: 'Uoc luong',
      note: 'Can doi chieu them do doc va khoang cach thuc te cua lo trinh.',
    },
  },
  'hoi an': {
    FOOD: {
      medianAmount: '100000',
      highThresholdAmount: '190000',
      sourceLabel: 'Mat bang quan an pho co Hoi An',
      confidenceLabel: 'Goi y',
      note: 'Nen doi chieu them vi tri trong pho co va phu thu du lich cao diem.',
    },
    TICKETS: {
      medianAmount: '120000',
      highThresholdAmount: '250000',
      sourceLabel: 'Gia ve tham quan va trai nghiem pho co',
      confidenceLabel: 'Uoc luong',
      note: 'Soat lai goi ve neu da bao gom combo hay huong dan vien.',
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
    const destinationLabel = destination.trim() || 'chua ro diem den';
    const normalizedDestination = destinationLabel.toLowerCase();
    const normalizedCategory = category.toUpperCase();
    const seed = DESTINATION_BENCHMARKS[normalizedDestination]?.[normalizedCategory];

    if (!seed || currency.toUpperCase() !== 'VND') {
      return {
        destinationLabel,
        normalizedCategory,
        medianAmount: amount.toString(),
        highThresholdAmount: amount.toString(),
        sourceLabel: 'Can doi chieu tai cho',
        confidenceLabel: 'Can xem lai',
        note: 'Chua co moc gia on dinh cho diem den hoac danh muc nay, nen xem day la canh bao mem de kiem tra lai.',
      };
    }

    return {
      destinationLabel,
      normalizedCategory,
      ...seed,
    };
  }
}
