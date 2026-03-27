import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTripDto, leaderUserId: string) {
    const joinCode = nanoid(8); // Short, shareable code

    const trip = await this.prisma.trip.create({
      data: {
        name: dto.name,
        destination: dto.destination,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        joinCode,
        members: {
          create: {
            userId: leaderUserId,
            role: 'LEADER',
          },
        },
      },
      include: { members: true },
    });

    return trip;
  }

  async findByJoinCode(joinCode: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { joinCode },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async joinTrip(joinCode: string, userId: string) {
    const trip = await this.findByJoinCode(joinCode);

    const existingMember = await this.prisma.tripMember.findUnique({
      where: { userId_tripId: { userId, tripId: trip.id } },
    });

    if (existingMember) {
      return existingMember;
    }

    return this.prisma.tripMember.create({
      data: {
        userId,
        tripId: trip.id,
        role: 'MEMBER',
      },
    });
  }
}
