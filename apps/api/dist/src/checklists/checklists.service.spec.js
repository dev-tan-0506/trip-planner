"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const prisma_service_1 = require("../prisma/prisma.service");
const checklist_proof_storage_service_1 = require("./checklist-proof-storage.service");
const checklists_service_1 = require("./checklists.service");
describe('ChecklistsService', () => {
    let service;
    let prisma;
    const mockPrisma = {
        tripMember: {
            findUnique: jest.fn(),
        },
        checklistGroup: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
        },
        checklistItem: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    const mockProofStorage = {
        saveProofImage: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                checklists_service_1.ChecklistsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                {
                    provide: checklist_proof_storage_service_1.ChecklistProofStorageService,
                    useValue: mockProofStorage,
                },
            ],
        }).compile();
        service = module.get(checklists_service_1.ChecklistsService);
        prisma = mockPrisma;
        jest.clearAllMocks();
    });
    it('returns groups ordered in snapshot', async () => {
        prisma.tripMember.findUnique.mockResolvedValue({
            id: 'tm-1',
            role: 'LEADER',
        });
        prisma.checklistGroup.findMany.mockResolvedValue([
            {
                id: 'group-1',
                title: 'Giấy tờ',
                kind: 'SHARED_CATEGORY',
                sortOrder: 1,
                items: [],
            },
            {
                id: 'group-2',
                title: 'Việc cá nhân',
                kind: 'PERSONAL_TASKS',
                sortOrder: 1,
                items: [],
            },
        ]);
        const snapshot = await service.getChecklistSnapshot('trip-1', 'user-1');
        expect(snapshot.sharedCategories[0]?.title).toBe('Giấy tờ');
        expect(snapshot.personalTasks[0]?.title).toBe('Việc cá nhân');
    });
    it('prevents non-leader create group', async () => {
        prisma.tripMember.findUnique.mockResolvedValue({
            id: 'tm-2',
            role: 'MEMBER',
        });
        await expect(service.createGroup('trip-1', 'user-2', {
            title: 'Y tế',
            kind: 'SHARED_CATEGORY',
        })).rejects.toThrow(common_1.ForbiddenException);
    });
    it('toggle marks item done and clears when toggled again', async () => {
        prisma.tripMember.findUnique.mockResolvedValue({
            id: 'tm-1',
            role: 'MEMBER',
        });
        prisma.checklistItem.findFirst.mockResolvedValueOnce({
            id: 'item-1',
            tripId: 'trip-1',
            assigneeTripMemberId: 'tm-1',
            status: 'TODO',
        });
        prisma.checklistItem.update.mockResolvedValue({});
        prisma.checklistGroup.findMany.mockResolvedValue([]);
        await service.toggleItem('trip-1', 'user-1', 'item-1');
        expect(prisma.checklistItem.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                status: 'DONE',
            }),
        }));
    });
});
//# sourceMappingURL=checklists.service.spec.js.map