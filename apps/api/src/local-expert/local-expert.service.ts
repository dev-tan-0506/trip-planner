import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestHiddenSpotsDto } from './dto/request-hidden-spots.dto';
import { RequestOutfitPlanDto } from './dto/request-outfit-plan.dto';
import { TranslateMenuDto } from './dto/translate-menu.dto';

export type LocalExpertConfidenceLabel = 'Gợi ý' | 'Ước lượng' | 'Cần xem lại';

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
        cautionNote: 'Nước dùng có thể nấu từ cá và xương, hỏi lại nếu bạn nhạy vị với hải sản.',
        confidenceLabel: 'Gợi ý' as const,
      };
    }

    if (normalized.includes('goi') || normalized.includes('nom')) {
      return {
        translatedText: 'Mixed herb salad',
        cautionNote: 'Món gỏi hay dùng nước mắm, lạc hoặc topping theo mùa nên cần hỏi thêm thành phần.',
        confidenceLabel: 'Ước lượng' as const,
      };
    }

    if (normalized.includes('muc') || normalized.includes('tom') || normalized.includes('hai san')) {
      return {
        translatedText: 'Seafood dish',
        cautionNote: 'Tên món gợi ý có hải sản nhưng cách chế biến không rõ, cần xem lại với quán.',
        confidenceLabel: 'Cần xem lại' as const,
      };
    }

    return {
      translatedText: 'Local house specialty',
      cautionNote: 'Tên món chưa đủ rõ thành phần, cần xem lại cách chế biến và topping.',
      confidenceLabel: 'Cần xem lại' as const,
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
        nextAction: 'Hỏi quán về thành phần để chốt món ăn phù hợp.',
      };
    });

    return {
      localeHint,
      confidenceLabel: cards.some((card) => card.confidenceLabel === 'Cần xem lại')
        ? 'Cần xem lại'
        : cards.some((card) => card.confidenceLabel === 'Ước lượng')
          ? 'Ước lượng'
          : 'Gợi ý',
      cards,
    };
  }

  async requestHiddenSpots(tripId: string, userId: string, dto: RequestHiddenSpotsDto) {
    await this.ensureMembership(tripId, userId);

    const areaLabel = dto.areaLabel.trim();
    const vibe = dto.vibe?.trim() || 'dễ đi bộ';
    const budgetHint = dto.budgetHint?.trim() || 'vừa túi';
    const vibeKey = normalizeVietnamese(vibe);
    const budgetKey = normalizeVietnamese(budgetHint);

    const cards: HiddenSpotCard[] = [
      {
        title: `Ngõ nhỏ gần ${areaLabel}`,
        areaLabel,
        whyItFits: `Hợp với không khí ${vibe} và dễ tránh điểm đông, chỉ cần ghé ngắn rồi quay lại lịch trình chính.`,
        confidenceLabel: 'Gợi ý',
        nextAction: 'Mở map và đối chiếu đường đi bộ trước khi rẽ vào hẻm.',
      },
      {
        title: `Quán nhà dân khu ${areaLabel}`,
        areaLabel,
        whyItFits: `Dễ tìm món địa phương giá ${budgetHint}, phù hợp cho lúc cần một điểm dừng chân nhanh.`,
        confidenceLabel: budgetKey.includes('re') ? 'Gợi ý' : 'Ước lượng',
        nextAction: 'Hỏi giá và giờ đóng cửa ngày hôm nay trước khi ghé.',
      },
      {
        title: `Góc ngắm phố ${areaLabel}`,
        areaLabel,
        whyItFits: vibeKey.includes('yen')
          ? 'Góc này hợp để ngồi chậm, chụp nhanh vài tấm ảnh và nghỉ ngắn trước chặng tiếp theo.'
          : 'Góc này hợp để ghé nhanh, xem nhịp sống địa phương mà không cần đổi lịch trình quá lâu.',
        confidenceLabel: vibeKey.includes('bi an') ? 'Cần xem lại' : 'Ước lượng',
        nextAction: 'Xem đông người thực tế rồi quyết định ghé hay bỏ qua.',
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

    const weatherLabel = dto.weatherLabel?.trim() || 'trời âm';
    const aestheticHint = dto.aestheticHint?.trim() || 'dễ chụp ảnh';
    const activities = dto.activityLabels?.length ? dto.activityLabels.join(', ') : 'đi bộ nhẹ';
    const weatherKey = normalizeVietnamese(weatherLabel);
    const aestheticKey = normalizeVietnamese(aestheticHint);

    const cards: OutfitPlanCard[] = [
      {
        title: 'Set 1: Mặc dễ đi và dễ lên hình',
        colorDirection: aestheticKey.includes('toi gian') ? 'be, trắng, xanh rêu' : 'kem, xanh biển, nâu cát',
        packingNotes: weatherKey.includes('mua')
          ? `Khoác mỏng chống mưa nhẹ, giày dễ khô và túi mini cho ${activities}.`
          : `Áo thoáng, chất liệu mềm và giày đi bộ để theo lịch ${activities}.`,
        confidenceLabel: 'Gợi ý',
        nextAction: 'Lấy set này làm option mặc chính cho buổi đầu.',
      },
      {
        title: 'Set 2: Dự phòng khi đổi cảnh nhanh',
        colorDirection: weatherKey.includes('nang') ? 'trắng ngà, xanh lá nhạt, denim sáng' : 'xám khói, xanh navy, nâu đậm',
        packingNotes: weatherKey.includes('mua')
          ? 'Thêm áo khoác siêu gọn và một khăn nhẹ để đổi gió.'
          : 'Mang theo lớp khoác mỏng để vào quán cafe máy lạnh.',
        confidenceLabel: 'Ước lượng',
        nextAction: 'Gấp gọn sẵn trong vali để đổi nhanh trước bữa tối.',
      },
      {
        title: 'Set 3: Phương án an toàn để khỏi lo lệch mood',
        colorDirection: aestheticKey.includes('noi bat') ? 'đỏ gạch, đen, kem' : 'xanh xám, be đậm, trắng sữa',
        packingNotes: `Nếu ${weatherLabel} thay đổi hoặc lịch ${activities} kéo dài, ưu tiên set này vì dễ phối lại phụ kiện.`,
        confidenceLabel: weatherKey.includes('mua') || aestheticKey.includes('noi bat') ? 'Cần xem lại' : 'Ước lượng',
        nextAction: 'Thử nhanh với giày và túi đang mang để tránh lệch tông màu.',
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
