import { PrismaService } from '../prisma/prisma.service';
import { CreateItineraryItemDto } from './dto/create-itinerary-item.dto';
import { UpdateItineraryItemDto } from './dto/update-itinerary-item.dto';
import { ReorderItineraryDto } from './dto/reorder-itinerary.dto';
export type ProgressState = 'sap toi' | 'dang di' | 'da di' | 'chua chot gio';
export interface OverlapWarning {
    itemId: string;
    conflictsWith: string;
    dayIndex: number;
    startMinute: number;
    message: string;
}
export interface MapItem {
    id: string;
    title: string;
    lat: number;
    lng: number;
    dayIndex: number;
    sortOrder: number;
}
export interface ItineraryItemWithProgress {
    id: string;
    tripId: string;
    dayIndex: number;
    sortOrder: number;
    startMinute: number | null;
    startTime: string | null;
    title: string;
    locationName: string | null;
    locationAddress: string | null;
    placeId: string | null;
    lat: number | null;
    lng: number | null;
    shortNote: string | null;
    version: number;
    progress: ProgressState;
    proposalCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface DayGroup {
    dayIndex: number;
    items: ItineraryItemWithProgress[];
}
export interface ItinerarySnapshot {
    tripId: string;
    days: DayGroup[];
    overlapWarnings: OverlapWarning[];
    mapItems: MapItem[];
    totalItems: number;
    isLeader: boolean;
    canEdit: boolean;
}
export declare class ItineraryService {
    private prisma;
    constructor(prisma: PrismaService);
    private getTripDurationDays;
    private ensureDayIndexInRange;
    private compareItemsForTimeline;
    private normalizeDaySortOrders;
    private getMemberRole;
    private requireLeader;
    private getNextSortOrder;
    private detectOverlaps;
    getTripItinerarySnapshot(tripId: string, userId: string): Promise<ItinerarySnapshot>;
    createItem(tripId: string, userId: string, dto: CreateItineraryItemDto): Promise<ItinerarySnapshot>;
    updateItem(tripId: string, userId: string, itemId: string, dto: UpdateItineraryItemDto): Promise<ItinerarySnapshot>;
    deleteItem(tripId: string, userId: string, itemId: string): Promise<ItinerarySnapshot>;
    reorderItems(tripId: string, userId: string, dto: ReorderItineraryDto): Promise<ItinerarySnapshot>;
}
