import { ChecklistsService } from './checklists.service';
import { CreateChecklistGroupDto } from './dto/create-checklist-group.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { SubmitChecklistProofDto } from './dto/submit-checklist-proof.dto';
import { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class ChecklistsController {
    private readonly checklistsService;
    constructor(checklistsService: ChecklistsService);
    getSnapshot(tripId: string, user: JwtPayload): Promise<{
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
    createGroup(tripId: string, dto: CreateChecklistGroupDto, user: JwtPayload): Promise<{
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
    deleteGroup(tripId: string, groupId: string, user: JwtPayload): Promise<{
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
    createItem(tripId: string, dto: CreateChecklistItemDto, user: JwtPayload): Promise<{
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
    updateItem(tripId: string, itemId: string, dto: UpdateChecklistItemDto, user: JwtPayload): Promise<{
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
    deleteItem(tripId: string, itemId: string, user: JwtPayload): Promise<{
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
    toggleItem(tripId: string, itemId: string, user: JwtPayload): Promise<{
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
    submitProof(tripId: string, itemId: string, dto: SubmitChecklistProofDto, user: JwtPayload): Promise<{
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
