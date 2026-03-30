import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripFundDto } from './dto/create-trip-fund.dto';
import { CreateFundContributionDto } from './dto/create-fund-contribution.dto';
import { CreateFundExpenseDto } from './dto/create-fund-expense.dto';

@Injectable()
export class FundService {
  constructor(private readonly prisma: PrismaService) {}

  private async getMembershipOrFail(tripId: string, userId: string) {
    const member = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this trip');
    }

    return member;
  }

  private assertLeader(role: string) {
    if (role !== 'LEADER') {
      throw new ForbiddenException('Only leaders can perform this action');
    }
  }

  private parseMoney(value: string) {
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      throw new BadRequestException('Money values must have at most 2 decimal places');
    }

    return new Prisma.Decimal(value);
  }

  private formatMoney(value?: Prisma.Decimal | null) {
    return (value ?? new Prisma.Decimal(0)).toString();
  }

  private toJsonValue(value?: Record<string, unknown>) {
    return value as Prisma.InputJsonValue | undefined;
  }

  async getFundSnapshot(tripId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const fund = await this.prisma.tripFund.findUnique({
      where: { tripId },
      include: {
        contributions: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            confirmedBy: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        },
        expenses: {
          include: {
            createdBy: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { incurredAt: 'desc' },
        },
      },
    });

    const zero = new Prisma.Decimal(0);
    const confirmedContributions = fund?.contributions.filter(
      (item) => item.status === 'CONFIRMED',
    ) ?? [];
    const collectedAmount = confirmedContributions.reduce(
      (sum, item) => sum.plus(item.declaredAmount),
      zero,
    );
    const spentAmount = (fund?.expenses ?? []).reduce((sum, item) => sum.plus(item.amount), zero);
    const targetAmount = fund?.targetAmount ?? zero;
    const remainingAmount = Prisma.Decimal.max(targetAmount.minus(spentAmount), zero);
    const burnRatePercent = targetAmount.gt(0)
      ? spentAmount.div(targetAmount).mul(100).toDecimalPlaces(2).toString()
      : '0';

    return {
      tripId,
      hasFund: !!fund,
      isLeader: member.role === 'LEADER',
      currentTripMemberId: member.id,
      fund: fund
        ? {
            id: fund.id,
            status: fund.status,
            currency: fund.currency,
            targetAmount: this.formatMoney(targetAmount),
            collectedAmount: this.formatMoney(collectedAmount),
            spentAmount: this.formatMoney(spentAmount),
            remainingAmount: this.formatMoney(remainingAmount),
            burnRatePercent,
            momoQrPayload: fund.momoQrPayload,
            bankQrPayload: fund.bankQrPayload,
            ownerTripMemberId: fund.ownerTripMemberId,
          }
        : null,
      contributions: (fund?.contributions ?? []).map((item) => ({
        id: item.id,
        tripMemberId: item.tripMemberId,
        declaredAmount: this.formatMoney(item.declaredAmount),
        method: item.method,
        status: item.status,
        transferNote: item.transferNote,
        confirmedAt: item.confirmedAt?.toISOString() ?? null,
        createdAt: item.createdAt.toISOString(),
        member: {
          tripMemberId: item.member.id,
          userId: item.member.user.id,
          name: item.member.user.name,
          avatarUrl: item.member.user.avatarUrl,
          role: item.member.role,
        },
        confirmedBy: item.confirmedBy
          ? {
              tripMemberId: item.confirmedBy.id,
              userId: item.confirmedBy.user.id,
              name: item.confirmedBy.user.name,
            }
          : null,
      })),
      expenses: (fund?.expenses ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        amount: this.formatMoney(item.amount),
        category: item.category,
        incurredAt: item.incurredAt.toISOString(),
        linkedItineraryItemId: item.linkedItineraryItemId,
        createdBy: {
          tripMemberId: item.createdBy.id,
          userId: item.createdBy.user.id,
          name: item.createdBy.user.name,
        },
      })),
      summary: {
        targetAmount: this.formatMoney(targetAmount),
        collectedAmount: this.formatMoney(collectedAmount),
        spentAmount: this.formatMoney(spentAmount),
        remainingAmount: this.formatMoney(remainingAmount),
        burnRatePercent,
      },
      roleFlags: {
        canManageFund: member.role === 'LEADER',
        canSubmitContribution: !!fund,
        canConfirmContribution: member.role === 'LEADER' && !!fund,
        canCreateExpense: member.role === 'LEADER' && !!fund,
      },
    };
  }

  async createFund(tripId: string, userId: string, dto: CreateTripFundDto) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const existing = await this.prisma.tripFund.findUnique({ where: { tripId } });
    if (existing) {
      throw new BadRequestException('Trip fund already exists');
    }

    await this.prisma.tripFund.create({
      data: {
        tripId,
        ownerTripMemberId: member.id,
        targetAmount: this.parseMoney(dto.targetAmount),
        currency: dto.currency?.trim() || 'VND',
        momoQrPayload: this.toJsonValue(dto.momoQrPayload),
        bankQrPayload: this.toJsonValue(dto.bankQrPayload),
      },
    });

    return this.getFundSnapshot(tripId, userId);
  }

  async updateFund(tripId: string, userId: string, dto: CreateTripFundDto) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const fund = await this.prisma.tripFund.findUnique({ where: { tripId } });
    if (!fund) {
      throw new NotFoundException('Trip fund not found');
    }

    await this.prisma.tripFund.update({
      where: { id: fund.id },
      data: {
        targetAmount: this.parseMoney(dto.targetAmount),
        currency: dto.currency?.trim() || 'VND',
        momoQrPayload: this.toJsonValue(dto.momoQrPayload),
        bankQrPayload: this.toJsonValue(dto.bankQrPayload),
      },
    });

    return this.getFundSnapshot(tripId, userId);
  }

  async submitContribution(tripId: string, userId: string, dto: CreateFundContributionDto) {
    const member = await this.getMembershipOrFail(tripId, userId);
    const fund = await this.prisma.tripFund.findUnique({ where: { tripId } });

    if (!fund) {
      throw new NotFoundException('Trip fund not found');
    }

    await this.prisma.fundContribution.create({
      data: {
        tripId,
        tripFundId: fund.id,
        tripMemberId: member.id,
        declaredAmount: this.parseMoney(dto.declaredAmount),
        method: dto.method,
        transferNote: dto.transferNote?.trim() || null,
      },
    });

    return this.getFundSnapshot(tripId, userId);
  }

  async confirmContribution(tripId: string, contributionId: string, userId: string) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const contribution = await this.prisma.fundContribution.findFirst({
      where: { id: contributionId, tripId },
    });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    await this.prisma.fundContribution.update({
      where: { id: contributionId },
      data: {
        status: 'CONFIRMED',
        confirmedByMemberId: member.id,
        confirmedAt: new Date(),
      },
    });

    return this.getFundSnapshot(tripId, userId);
  }

  async createExpense(tripId: string, userId: string, dto: CreateFundExpenseDto) {
    const member = await this.getMembershipOrFail(tripId, userId);
    this.assertLeader(member.role);

    const fund = await this.prisma.tripFund.findUnique({ where: { tripId } });
    if (!fund) {
      throw new NotFoundException('Trip fund not found');
    }

    await this.prisma.fundExpense.create({
      data: {
        tripFundId: fund.id,
        tripId,
        createdByTripMemberId: member.id,
        title: dto.title,
        amount: this.parseMoney(dto.amount),
        category: dto.category,
        linkedItineraryItemId: dto.linkedItineraryItemId,
        incurredAt: new Date(dto.incurredAt),
      },
    });

    return this.getFundSnapshot(tripId, userId);
  }
}
