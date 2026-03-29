import { PrismaService } from '../prisma/prisma.service';
import { CreateChecklistGroupDto } from './dto/create-checklist-group.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { SubmitChecklistProofDto } from './dto/submit-checklist-proof.dto';
import { ChecklistProofStorageService } from './checklist-proof-storage.service';
export declare class ChecklistsService {
    private prisma;
    private checklistProofStorageService;
    constructor(prisma: PrismaService, checklistProofStorageService: ChecklistProofStorageService);
    private getMembershipOrFail;
    private assertLeader;
    getChecklistSnapshot(tripId: string, userId: string): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        sharedCategories: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        personalTasks: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        documentGroups: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        myItems: {
            itemId: string;
            groupId: string;
            groupTitle: string;
            title: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.ChecklistItemStatus;
            sortOrder: number;
        }[];
        totalItems: number;
        completedItems: number;
    }>;
    private mapGroup;
    createGroup(tripId: string, userId: string, dto: CreateChecklistGroupDto): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        sharedCategories: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        personalTasks: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        documentGroups: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        myItems: {
            itemId: string;
            groupId: string;
            groupTitle: string;
            title: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.ChecklistItemStatus;
            sortOrder: number;
        }[];
        totalItems: number;
        completedItems: number;
    }>;
    deleteGroup(tripId: string, userId: string, groupId: string): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        sharedCategories: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        personalTasks: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        documentGroups: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        myItems: {
            itemId: string;
            groupId: string;
            groupTitle: string;
            title: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.ChecklistItemStatus;
            sortOrder: number;
        }[];
        totalItems: number;
        completedItems: number;
    }>;
    createItem(tripId: string, userId: string, dto: CreateChecklistItemDto): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        sharedCategories: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        personalTasks: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        documentGroups: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        myItems: {
            itemId: string;
            groupId: string;
            groupTitle: string;
            title: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.ChecklistItemStatus;
            sortOrder: number;
        }[];
        totalItems: number;
        completedItems: number;
    }>;
    updateItem(tripId: string, userId: string, itemId: string, dto: UpdateChecklistItemDto): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        sharedCategories: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        personalTasks: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        documentGroups: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        myItems: {
            itemId: string;
            groupId: string;
            groupTitle: string;
            title: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.ChecklistItemStatus;
            sortOrder: number;
        }[];
        totalItems: number;
        completedItems: number;
    }>;
    deleteItem(tripId: string, userId: string, itemId: string): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        sharedCategories: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        personalTasks: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        documentGroups: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        myItems: {
            itemId: string;
            groupId: string;
            groupTitle: string;
            title: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.ChecklistItemStatus;
            sortOrder: number;
        }[];
        totalItems: number;
        completedItems: number;
    }>;
    toggleItem(tripId: string, userId: string, itemId: string): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        sharedCategories: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        personalTasks: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        documentGroups: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        myItems: {
            itemId: string;
            groupId: string;
            groupTitle: string;
            title: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.ChecklistItemStatus;
            sortOrder: number;
        }[];
        totalItems: number;
        completedItems: number;
    }>;
    submitProof(tripId: string, userId: string, itemId: string, dto: SubmitChecklistProofDto): Promise<{
        tripId: string;
        isLeader: boolean;
        currentTripMemberId: string;
        sharedCategories: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        personalTasks: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        documentGroups: {
            id: string;
            title: string;
            kind: string;
            sortOrder: number;
            itemCount: number;
            completedCount: number;
            items: {
                id: string;
                title: string;
                notes: string | null;
                proofUrl: string | null;
                proofSubmittedAt: string | null;
                status: string;
                sortOrder: number;
                canToggleSelf: boolean;
                assignee: {
                    tripMemberId: string;
                    userId: string;
                    name: string | null;
                    avatarUrl: string | null;
                } | null;
                completedAt: string | null;
            }[];
        }[];
        myItems: {
            itemId: string;
            groupId: string;
            groupTitle: string;
            title: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.ChecklistItemStatus;
            sortOrder: number;
        }[];
        totalItems: number;
        completedItems: number;
    }>;
}
