import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestHiddenSpotsDto } from './dto/request-hidden-spots.dto';
import { RequestOutfitPlanDto } from './dto/request-outfit-plan.dto';
import { TranslateMenuDto } from './dto/translate-menu.dto';

export type LocalExpertConfidenceLabel = 'Goi y' | 'Uoc luong' | 'Can xem lai';

export interface MenuTranslationCard {
  originalText: string;
  translatedText: string;
  cautionNote: string;
  confidenceLabel: LocalExpertConfidenceLabel;
  nextAction: string;
}

export interface HiddenSpotCard {
  title: string;
  areaLabel: string;
  whyItFits: string;
  confidenceLabel: LocalExpertConfidenceLabel;
  nextAction: string;
}

export interface OutfitPlanCard {
  title: string;
  colorDirection: string;
  packingNotes: string;
  confidenceLabel: LocalExpertConfidenceLabel;
  nextAction: string;
}

function normalizeVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

@Injectable()
export class LocalExpertService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureMembership(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    return member;
  }

  private buildDishTranslation(source: string) {
    const normalized = normalizeVietnamese(source);
    if (normalized.includes('bun cha ca')) {
      return {
        translatedText: 'Cha ca noodle soup',
        cautionNote: 'Nuoc dung co the nau tu ca va xuong, hoi lai neu ban nhay vi voi hai san.',
        confidenceLabel: 'Goi y' as const,
      };
    }

    if (normalized.includes('goi') || normalized.includes('nom')) {
      return {
        translatedText: 'Mixed herb salad',
        cautionNote: 'Mon goi hay dung nuoc mam, lac hoac topping theo mua nen nen hoi them thanh phan.',
        confidenceLabel: 'Uoc luong' as const,
      };
    }

    if (normalized.includes('muc') || normalized.includes('tom') || normalized.includes('hai san')) {
      return {
        translatedText: 'Seafood dish',
        cautionNote: 'Ten mon goi y co hai san nhung cach che bien khong ro, Can xem lai voi quan.',
        confidenceLabel: 'Can xem lai' as const,
      };
    }

    return {
      translatedText: 'Local house specialty',
      cautionNote: 'Ten mon chua du ro thanh phan, Can xem lai cach che bien va topping.',
      confidenceLabel: 'Can xem lai' as const,
    };
  }

  private splitMenuLines(menuText: string) {
    return menuText
      .split(/\r?\n|,|;/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  async translateMenu(tripId: string, userId: string, dto: TranslateMenuDto) {
    await this.ensureMembership(tripId, userId);

    const localeHint = dto.localeHint?.trim() || 'vi';
    const cards = this.splitMenuLines(dto.menuText).map<MenuTranslationCard>((line) => {
      const translation = this.buildDishTranslation(line);
      return {
        originalText: line,
        translatedText:
          localeHint === 'en' ? translation.translatedText : `${translation.translatedText} (${localeHint})`,
        cautionNote: translation.cautionNote,
        confidenceLabel: translation.confidenceLabel,
        nextAction: 'Hoi quan ve thanh phan de chot mon an phu hop.',
      };
    });

    return {
      localeHint,
      confidenceLabel: cards.some((card) => card.confidenceLabel === 'Can xem lai')
        ? 'Can xem lai'
        : cards.some((card) => card.confidenceLabel === 'Uoc luong')
          ? 'Uoc luong'
          : 'Goi y',
      cards,
    };
  }

  async requestHiddenSpots(tripId: string, userId: string, dto: RequestHiddenSpotsDto) {
    await this.ensureMembership(tripId, userId);

    const areaLabel = dto.areaLabel.trim();
    const vibe = dto.vibe?.trim() || 'de di bo';
    const budgetHint = dto.budgetHint?.trim() || 'vua tui';
    const vibeKey = normalizeVietnamese(vibe);
    const budgetKey = normalizeVietnamese(budgetHint);

    const cards: HiddenSpotCard[] = [
      {
        title: `Ngo nho gan ${areaLabel}`,
        areaLabel,
        whyItFits: `Hop voi khong khi ${vibe} va de tranh diem dong, chi can ghe ngan roi quay lai lich trinh chinh.`,
        confidenceLabel: 'Goi y',
        nextAction: 'Mo map va doi chieu duong di bo truoc khi re vao hem.',
      },
      {
        title: `Quan nha dan khu ${areaLabel}`,
        areaLabel,
        whyItFits: `De tim mon dia phuong gia ${budgetHint}, phu hop cho luc can mot diem dung chan nhanh.`,
        confidenceLabel: budgetKey.includes('re') ? 'Goi y' : 'Uoc luong',
        nextAction: 'Hoi gia va gio dong cua ngay hom nay truoc khi ghe.',
      },
      {
        title: `Goc ngam pho ${areaLabel}`,
        areaLabel,
        whyItFits: vibeKey.includes('yen')
          ? 'Goc nay hop de ngoi cham, chup nhanh vai tam anh va nghi ngan truoc chang tiep theo.'
          : 'Goc nay hop de ghe nhanh, xem nhịp sống dia phuong ma khong can doi lich trinh qua lau.',
        confidenceLabel: vibeKey.includes('bi an') ? 'Can xem lai' : 'Uoc luong',
        nextAction: 'Xem dong nguoi thuc te roi quyet dinh ghe hay bo qua.',
      },
    ];

    return {
      areaLabel,
      vibe,
      budgetHint,
      cards: cards.slice(0, 3),
    };
  }

  async requestOutfitPlan(tripId: string, userId: string, dto: RequestOutfitPlanDto) {
    await this.ensureMembership(tripId, userId);

    const weatherLabel = dto.weatherLabel?.trim() || 'troi am';
    const aestheticHint = dto.aestheticHint?.trim() || 'de chup anh';
    const activities = dto.activityLabels?.length ? dto.activityLabels.join(', ') : 'di bo nhe';
    const weatherKey = normalizeVietnamese(weatherLabel);
    const aestheticKey = normalizeVietnamese(aestheticHint);

    const cards: OutfitPlanCard[] = [
      {
        title: 'Set 1: Mac de di va de len hinh',
        colorDirection: aestheticKey.includes('toi gian') ? 'be, trang, xanh reu' : 'kem, xanh bien, nau cat',
        packingNotes: weatherKey.includes('mua')
          ? `Khoac mong chong mua nhe, giay de kho va tui mini cho ${activities}.`
          : `Ao thoang, chat lieu mem va giay di bo de theo lich ${activities}.`,
        confidenceLabel: 'Goi y',
        nextAction: 'Lay set nay lam option mac chinh cho buoi dau.',
      },
      {
        title: 'Set 2: Du phong khi doi canh nhanh',
        colorDirection: weatherKey.includes('nang') ? 'trang ngà, xanh la nhat, denim sang' : 'xam khoi, xanh navy, nau dam',
        packingNotes: weatherKey.includes('mua')
          ? 'Them ao khoac sieu gon va mot khan nhe de doi gio.'
          : 'Mang theo lop khoac mong de vao quan cafe may lanh.',
        confidenceLabel: 'Uoc luong',
        nextAction: 'Gap gon san trong vali de doi nhanh truoc bua toi.',
      },
      {
        title: 'Set 3: Phuong an an toan de khoi lo lech mood',
        colorDirection: aestheticKey.includes('noi bat') ? 'do gach, den, kem' : 'xanh xam, be dam, trang sua',
        packingNotes: `Neu ${weatherLabel} thay doi hoac lich ${activities} keo dai, uu tien set nay vi de phoi lai phu kien.`,
        confidenceLabel: weatherKey.includes('mua') || aestheticKey.includes('noi bat') ? 'Can xem lai' : 'Uoc luong',
        nextAction: 'Thu nhanh voi giay va tui dang mang de tranh lech tong mau.',
      },
    ];

    return {
      dayIndex: dto.dayIndex,
      weatherLabel,
      aestheticHint,
      activityLabels: dto.activityLabels ?? [],
      cards: cards.slice(0, 3),
    };
  }
}
