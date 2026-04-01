import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TripMember } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateDailyPodcastDto } from './dto/generate-daily-podcast.dto';

type DailyPodcastRecapRecord = {
  id: string;
  tripId: string;
  dayIndex: number;
  title: string;
  recapText: string;
  transcript: string;
  audioMode: string;
  audioUrl: string | null;
  durationSeconds: number;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type TranscriptContext = {
  tripName: string;
  destination: string;
  dayIndex: number;
  itineraryTitles: string[];
  attendanceSummary: string;
  financeSummary: string;
  safetySummary: string;
  tone: string;
};

const MIN_TRANSCRIPT_WORDS = 220;
const MAX_TRANSCRIPT_WORDS = 300;
const MAX_DURATION_SECONDS = 120;

@Injectable()
export class DailyPodcastService {
  constructor(private readonly prisma: PrismaService) {}

  private async getMembershipOrFail(tripId: string, userId: string): Promise<TripMember> {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    return member;
  }

  private normalizeWords(text: string) {
    return text
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  private limitTranscript(text: string) {
    const words = this.normalizeWords(text);
    if (words.length <= MAX_TRANSCRIPT_WORDS) {
      return words.join(' ');
    }

    return words.slice(0, MAX_TRANSCRIPT_WORDS).join(' ');
  }

  private ensureTranscriptLength(text: string) {
    let words = this.normalizeWords(text);
    const fillerSentence =
      'Team minh cu giu nhip vui, check lai thong tin can thiet, roi tan huong phan con lai cua ngay theo cach nhe nhang va de nho.';

    while (words.length < MIN_TRANSCRIPT_WORDS) {
      words = words.concat(this.normalizeWords(fillerSentence));
    }

    return this.limitTranscript(words.join(' '));
  }

  private buildAttendanceSummary(
    attendanceSession:
      | ({
          submissions: Array<{ locationStatus: string }>;
        } & { title: string })
      | null,
  ) {
    if (!attendanceSession) {
      return 'Khong co buoi diem danh nao duoc ghi nhan cho ngay nay, nen ca nhom van tu do tu nhac nhau giu lich.';
    }

    const arrived = attendanceSession.submissions.filter(
      (submission) => submission.locationStatus === 'GRANTED',
    ).length;
    const pending = attendanceSession.submissions.length - arrived;

    return `Buoi diem danh "${attendanceSession.title}" ghi nhan ${arrived} ban da den dung diem hen, con ${Math.max(
      pending,
      0,
    )} ban can nhac lai hoac cap nhat vi tri.`;
  }

  private buildFinanceSummary(
    expenses: Array<{ title: string; amount: Prisma.Decimal; category: string }>,
    contributions: Array<{ declaredAmount: Prisma.Decimal; status: string }>,
  ) {
    if (!expenses.length && !contributions.length) {
      return 'Vi nhom hom nay khong co bien dong lon, vay nen khong co khoan chi nao dang lam mood ca nhom bi nang len.';
    }

    const totalSpent = expenses.reduce(
      (sum, expense) => sum.plus(expense.amount),
      new Prisma.Decimal(0),
    );
    const confirmedContributions = contributions
      .filter((contribution) => contribution.status === 'CONFIRMED')
      .reduce((sum, contribution) => sum.plus(contribution.declaredAmount), new Prisma.Decimal(0));
    const latestExpense = expenses[0];

    return `Phan quy nhom dang ghi nhan chi tieu ${totalSpent.toString()} VND, dong vao da xac nhan ${confirmedContributions.toString()} VND, va muc chi gan nhat la "${latestExpense?.title ?? 'chua co'}" o nhom ${latestExpense?.category?.toLowerCase?.() ?? 'khac'}.`;
  }

  private buildSafetySummary(alerts: Array<{ message: string; status: string; type: string }>) {
    if (!alerts.length) {
      return 'Khong co canh bao an toan moi, nen phan nhac viec toi nay chu yeu la giu pin, giu do, va ve dung gio nghi.';
    }

    const openAlerts = alerts.filter((alert) => alert.status === 'OPEN');
    const latest = alerts[0];
    if (!openAlerts.length) {
      return `Da co ${alerts.length} luu y an toan duoc xu ly, noi dung gan nhat la "${latest.message}".`;
    }

    return `Van con ${openAlerts.length} luu y an toan dang mo, noi dung moi nhat la "${latest.message}" thuoc nhom ${latest.type.toLowerCase()}.`;
  }

  private buildTranscript(context: TranscriptContext) {
    const itinerarySummary = context.itineraryTitles.length
      ? `Hom nay ngay ${context.dayIndex + 1}, team ${context.tripName} o ${context.destination} da di qua ${context.itineraryTitles.length} diem nhan nho: ${context.itineraryTitles.join(', ')}.`
      : `Hom nay ngay ${context.dayIndex + 1}, team ${context.tripName} o ${context.destination} co mot ngay nhe lich, it diem check-in nhung van du chat lieu de nhac lai.`;

    const toneLine = context.tone.toLowerCase().includes('calm')
      ? 'Ban tin nay giu nhip ke chuyen diu hon mot chut, nhu mot loi tong ket truoc khi ca nhom tat thong bao.'
      : 'Ban tin nay giu dung chat vui nhe, giong mot radio mini de ca nhom nghe xong roi cuoi mot cai la du.';

    const transcript = [
      `${itinerarySummary} ${toneLine}`,
      'Neu nhin lai tong the, nhom da co mot ngay du de nho ten tung diem den, nho vi sao minh chon no, va nho ca nhung khoanh khac nho ma luc dang di co the chua kip noi ra.',
      context.attendanceSummary,
      context.financeSummary,
      context.safetySummary,
      'Phan hay nhat cua recap toi nay la nhac nho rang hanh trinh van dang o dung nhịp: minh khong can them mot workflow media nang, chi can mot doan tom tat de ghe lai ky niem va chot nhanh nhung dieu can check lai cho ngay mai.',
      'Neu ngay mai muon bat dau gon gang hon, chi can nhin lai lich trinh, chot mot hai uu tien, va de moi nguoi tu cap nhat nhung mon do, diem hen, hay ghi chu con dang bo ngo.',
      'Con bay gio thi podcast mini xin ket thuc bang mot loi nhac rat ngan: giu pin, giu nuoc, giu tam trang vui, va de cho ngay mai co them mot doan recap dang nho hon nua.',
    ].join(' ');

    return this.ensureTranscriptLength(transcript);
  }

  private buildRecapText(itineraryTitles: string[], attendanceSummary: string) {
    const itemText = itineraryTitles.length
      ? `Hom nay team da chot ${itineraryTitles.length} diem: ${itineraryTitles.slice(0, 3).join(', ')}.`
      : 'Hom nay team giu lich nhe, khong co qua nhieu diem can nho.';

    return `${itemText} ${attendanceSummary} Audio hien dang o che do BROWSER_TTS nen van nghe duoc tren web khi can.`;
  }

  private computeDurationSeconds(transcript: string) {
    const words = this.normalizeWords(transcript).length;
    return Math.min(MAX_DURATION_SECONDS, Math.max(45, Math.ceil((words / 150) * 60)));
  }

  private mapRecap(recap: DailyPodcastRecapRecord) {
    return {
      id: recap.id,
      tripId: recap.tripId,
      dayIndex: recap.dayIndex,
      title: recap.title,
      recapText: recap.recapText,
      transcript: recap.transcript,
      audioMode: recap.audioMode,
      audioUrl: recap.audioUrl,
      durationSeconds: recap.durationSeconds,
      generatedAt: recap.generatedAt.toISOString(),
      createdAt: recap.createdAt.toISOString(),
      updatedAt: recap.updatedAt.toISOString(),
    };
  }

  private async getTripDayContext(tripId: string, dayIndex: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        itineraryItems: {
          where: { dayIndex },
          orderBy: [{ sortOrder: 'asc' }, { startMinute: 'asc' }],
        },
        attendanceSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            submissions: {
              select: {
                locationStatus: true,
              },
            },
          },
        },
        tripFund: {
          include: {
            expenses: {
              orderBy: { incurredAt: 'desc' },
              take: 3,
              select: {
                title: true,
                amount: true,
                category: true,
              },
            },
            contributions: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              select: {
                declaredAmount: true,
                status: true,
              },
            },
          },
        },
        safetyAlerts: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            message: true,
            status: true,
            type: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const tripDays =
      Math.floor((trip.endDate.getTime() - trip.startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    if (dayIndex < 0 || dayIndex >= tripDays) {
      throw new BadRequestException('Day index is outside the trip range');
    }

    return trip;
  }

  async getDailyPodcast(tripId: string, dayIndex: number, userId: string) {
    await this.getMembershipOrFail(tripId, userId);
    await this.getTripDayContext(tripId, dayIndex);

    const recap = await this.prisma.dailyPodcastRecap.findUnique({
      where: {
        tripId_dayIndex: {
          tripId,
          dayIndex,
        },
      },
    });

    return {
      recap: recap ? this.mapRecap(recap as DailyPodcastRecapRecord) : null,
    };
  }

  async generateDailyPodcast(
    tripId: string,
    dayIndex: number,
    userId: string,
    dto: GenerateDailyPodcastDto,
  ) {
    await this.getMembershipOrFail(tripId, userId);
    const trip = await this.getTripDayContext(tripId, dayIndex);

    const existing = await this.prisma.dailyPodcastRecap.findUnique({
      where: {
        tripId_dayIndex: {
          tripId,
          dayIndex,
        },
      },
    });

    if (existing && !dto.refresh) {
      return this.mapRecap(existing as DailyPodcastRecapRecord);
    }

    const itineraryTitles = trip.itineraryItems.map((item) => item.title);
    const attendanceSummary = this.buildAttendanceSummary(trip.attendanceSessions[0] ?? null);
    const financeSummary = this.buildFinanceSummary(
      trip.tripFund?.expenses ?? [],
      trip.tripFund?.contributions ?? [],
    );
    const safetySummary = this.buildSafetySummary(trip.safetyAlerts);
    const transcript = this.buildTranscript({
      tripName: trip.name,
      destination: trip.destination,
      dayIndex,
      itineraryTitles,
      attendanceSummary,
      financeSummary,
      safetySummary,
      tone: dto.tone ?? 'playful',
    });
    const durationSeconds = this.computeDurationSeconds(transcript);
    const recapText = this.buildRecapText(itineraryTitles, attendanceSummary);

    const recap = await this.prisma.dailyPodcastRecap.upsert({
      where: {
        tripId_dayIndex: {
          tripId,
          dayIndex,
        },
      },
      create: {
        tripId,
        dayIndex,
        title: `Podcast ngay ${dayIndex + 1}`,
        recapText,
        transcript,
        audioMode: 'BROWSER_TTS',
        audioUrl: null,
        durationSeconds,
      },
      update: {
        title: `Podcast ngay ${dayIndex + 1}`,
        recapText,
        transcript,
        audioMode: 'BROWSER_TTS',
        audioUrl: null,
        durationSeconds,
        generatedAt: new Date(),
      },
    });

    return this.mapRecap(recap as DailyPodcastRecapRecord);
  }
}
