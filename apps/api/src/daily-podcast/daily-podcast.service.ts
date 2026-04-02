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
      return 'Không có buổi điểm danh nào được ghi nhận cho ngày này, nên cả nhóm vẫn tự do tự nhắc nhau giữ lịch.';
    }

    const arrived = attendanceSession.submissions.filter(
      (submission) => submission.locationStatus === 'GRANTED',
    ).length;
    const pending = attendanceSession.submissions.length - arrived;

      return `Buổi điểm danh "${attendanceSession.title}" ghi nhận ${arrived} bạn đã đến đúng điểm hẹn, còn ${Math.max(
      pending,
      0,
    )} bạn cần nhắc lại hoặc cập nhật vị trí.`;
  }

  private buildFinanceSummary(
    expenses: Array<{ title: string; amount: Prisma.Decimal; category: string }>,
    contributions: Array<{ declaredAmount: Prisma.Decimal; status: string }>,
  ) {
    if (!expenses.length && !contributions.length) {
      return 'Vì nhóm hôm nay không có biến động lớn, vậy nên không có khoản chi nào đang làm mood cả nhóm bị nặng lên.';
    }

    const totalSpent = expenses.reduce(
      (sum, expense) => sum.plus(expense.amount),
      new Prisma.Decimal(0),
    );
    const confirmedContributions = contributions
      .filter((contribution) => contribution.status === 'CONFIRMED')
      .reduce((sum, contribution) => sum.plus(contribution.declaredAmount), new Prisma.Decimal(0));
    const latestExpense = expenses[0];

    return `Phần quỹ nhóm đang ghi nhận chi tiêu ${totalSpent.toString()} VND, đóng vào đã xác nhận ${confirmedContributions.toString()} VND, và mức chi gần nhất là "${latestExpense?.title ?? 'chưa có'}" ở nhóm ${latestExpense?.category?.toLowerCase?.() ?? 'khác'}.`;
  }

  private buildSafetySummary(alerts: Array<{ message: string; status: string; type: string }>) {
    if (!alerts.length) {
      return 'Không có cảnh báo an toàn mới, nên phần nhắc việc tối nay chủ yếu là giữ pin, giữ đồ và về đúng giờ nghỉ.';
    }

    const openAlerts = alerts.filter((alert) => alert.status === 'OPEN');
    const latest = alerts[0];
    if (!openAlerts.length) {
      return `Đã có ${alerts.length} lưu ý an toàn được xử lý, nội dung gần nhất là "${latest.message}".`;
    }

    return `Vẫn còn ${openAlerts.length} lưu ý an toàn đang mở, nội dung mới nhất là "${latest.message}" thuộc nhóm ${latest.type.toLowerCase()}.`;
  }

  private buildTranscript(context: TranscriptContext) {
    const itinerarySummary = context.itineraryTitles.length
          ? `Hôm nay ngày ${context.dayIndex + 1}, team ${context.tripName} ở ${context.destination} đã đi qua ${context.itineraryTitles.length} điểm nhấn nhớ: ${context.itineraryTitles.join(', ')}.`
          : `Hôm nay ngày ${context.dayIndex + 1}, team ${context.tripName} ở ${context.destination} có một ngày nhẹ lịch, ít điểm check-in nhưng vẫn đủ chất liệu để nhắc lại.`;

    const toneLine = context.tone.toLowerCase().includes('calm')
      ? 'Bản tin này giữ nhịp kể chuyện dịu hơn một chút, như một lời tổng kết trước khi cả nhóm tắt thông báo.'
      : 'Bản tin này giữ đúng chất vui nhẹ, giống một radio mini để cả nhóm nghe xong rồi cười một cái là đủ.';

    const transcript = [
      `${itinerarySummary} ${toneLine}`,
      'Nếu nhìn lại tổng thể, nhóm đã có một ngày đủ để nhớ tên từng điểm đến, nhớ vì sao mình chọn nó, và nhớ cả những khoảnh khắc nhỏ mà lúc đang đi có thể chưa kịp nói ra.',
      context.attendanceSummary,
      context.financeSummary,
      context.safetySummary,
      'Phần hay nhất của recap tối nay là nhắc nhớ rằng hành trình vẫn đang ở đúng nhịp: mình không cần thêm một workflow media nặng, chỉ cần một đoạn tóm tắt để ghé lại kỷ niệm và chốt nhanh những điều cần check lại cho ngày mai.',
      'Nếu ngày mai muốn bắt đầu gọn gàng hơn, chỉ cần nhìn lại lịch trình, chốt một hai ưu tiên, và để mọi người tự cập nhật những món đồ, điểm hẹn hay ghi chú còn đang bỏ ngỏ.',
      'Còn bây giờ thì podcast mini xin kết thúc bằng một lời nhắc rất ngắn: giữ pin, giữ nước, giữ tâm trạng vui, và để cho ngày mai có thêm một đoạn recap đáng nhớ hơn nữa.',
    ].join(' ');

    return this.ensureTranscriptLength(transcript);
  }

  private buildRecapText(itineraryTitles: string[], attendanceSummary: string) {
    const itemText = itineraryTitles.length
      ? `Hôm nay team đã chốt ${itineraryTitles.length} điểm: ${itineraryTitles.slice(0, 3).join(', ')}.`
      : 'Hôm nay team giữ lịch nhẹ, không có quá nhiều điểm cần nhớ.';

    return `${itemText} ${attendanceSummary} Audio hiện đang ở chế độ BROWSER_TTS nên vẫn nghe được trên web khi cần.`;
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
        title: `Podcast ngày ${dayIndex + 1}`,
        recapText,
        transcript,
        audioMode: 'BROWSER_TTS',
        audioUrl: null,
        durationSeconds,
      },
      update: {
        title: `Podcast ngày ${dayIndex + 1}`,
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
