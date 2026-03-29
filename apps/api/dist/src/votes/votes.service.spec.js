"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const votes_service_1 = require("./votes.service");
const prisma_service_1 = require("../prisma/prisma.service");
describe('VotesService', () => {
    let service;
    let prisma;
    const mockPrisma = {
        tripMember: {
            findUnique: jest.fn(),
        },
        voteSession: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
        },
        voteOption: {
            create: jest.fn(),
            update: jest.fn(),
        },
        voteBallot: {
            findMany: jest.fn(),
            upsert: jest.fn(),
        },
        voteSessionOutcome: {
            create: jest.fn(),
        },
        itineraryItem: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
        itineraryProposal: {
            create: jest.fn(),
        },
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                votes_service_1.VotesService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        service = module.get(votes_service_1.VotesService);
        prisma = mockPrisma;
    });
    describe('createSession', () => {
        it('should create a PENDING_APPROVAL session when non-leader proposes', async () => {
            prisma.tripMember.findUnique.mockResolvedValue({
                role: 'MEMBER',
            });
            prisma.voteSession.create.mockResolvedValue({
                id: 'session-1',
                status: 'PENDING_APPROVAL',
                mode: 'NEW_OPTION',
            });
            const result = await service.createSession('trip-1', 'user-2', {
                mode: 'NEW_OPTION',
                deadline: '2026-12-31T23:59:59Z',
                targetDayIndex: 0,
            });
            expect(result.status).toBe('PENDING_APPROVAL');
            expect(prisma.voteSession.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    status: 'PENDING_APPROVAL',
                }),
            }));
        });
        it('should create an OPEN session when leader creates', async () => {
            prisma.tripMember.findUnique.mockResolvedValue({
                role: 'LEADER',
            });
            prisma.voteSession.create.mockResolvedValue({
                id: 'session-2',
                status: 'OPEN',
                mode: 'NEW_OPTION',
            });
            const result = await service.createSession('trip-1', 'leader-1', {
                mode: 'NEW_OPTION',
                deadline: '2026-12-31T23:59:59Z',
                targetDayIndex: 0,
            });
            expect(result.status).toBe('OPEN');
        });
        it('should require targetDayIndex for NEW_OPTION sessions', async () => {
            prisma.tripMember.findUnique.mockResolvedValue({ role: 'LEADER' });
            await expect(service.createSession('trip-1', 'leader-1', {
                mode: 'NEW_OPTION',
                deadline: '2026-12-31T23:59:59Z',
            })).rejects.toThrow('targetDayIndex is required');
        });
        it('should require targetItemId for REPLACE_ITEM sessions', async () => {
            prisma.tripMember.findUnique.mockResolvedValue({ role: 'LEADER' });
            await expect(service.createSession('trip-1', 'leader-1', {
                mode: 'REPLACE_ITEM',
                deadline: '2026-12-31T23:59:59Z',
            })).rejects.toThrow('targetItemId is required');
        });
    });
    describe('submitBallot - latest active vote counts', () => {
        const sessionBase = {
            id: 'session-1',
            tripId: 'trip-1',
            status: 'OPEN',
            deadline: new Date(Date.now() + 3600000).toISOString(),
            options: [
                { id: 'opt-a', status: 'ACTIVE' },
                { id: 'opt-b', status: 'ACTIVE' },
            ],
        };
        it('should upsert ballot so latest active vote counts', async () => {
            prisma.tripMember.findUnique.mockResolvedValue({ role: 'MEMBER' });
            prisma.voteSession.findUnique.mockResolvedValue(sessionBase);
            prisma.voteBallot.upsert.mockResolvedValue({
                id: 'ballot-1',
                voteOptionId: 'opt-b',
                userId: 'user-1',
            });
            await service.submitBallot('session-1', 'user-1', {
                voteOptionId: 'opt-a',
            });
            const result = await service.submitBallot('session-1', 'user-1', {
                voteOptionId: 'opt-b',
            });
            expect(prisma.voteBallot.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    voteSessionId_userId: {
                        voteSessionId: 'session-1',
                        userId: 'user-1',
                    },
                },
                update: expect.objectContaining({
                    voteOptionId: 'opt-b',
                }),
            }));
        });
        it('should reject vote when voting deadline has passed', async () => {
            prisma.tripMember.findUnique.mockResolvedValue({ role: 'MEMBER' });
            prisma.voteSession.findUnique.mockResolvedValue({
                ...sessionBase,
                deadline: new Date(Date.now() - 1000).toISOString(),
                ballots: [],
            });
            prisma.voteBallot.findMany.mockResolvedValue([]);
            prisma.voteSession.update.mockResolvedValue({
                ...sessionBase,
                status: 'CLOSED',
            });
            await expect(service.submitBallot('session-1', 'user-1', {
                voteOptionId: 'opt-a',
            })).rejects.toThrow('deadline has passed');
        });
    });
    describe('createTieBreakSession', () => {
        it('should create a TIE_BREAK child session from tied parent', async () => {
            const parentSession = {
                id: 'parent-session',
                tripId: 'trip-1',
                createdById: 'leader-1',
                mode: 'NEW_OPTION',
                targetItemId: null,
                targetDayIndex: 0,
                targetInsertAfterItemId: null,
                tieBreakRound: 0,
            };
            const tiedOptions = [
                { id: 'opt-a', title: 'Option A', payload: {} },
                { id: 'opt-b', title: 'Option B', payload: {} },
            ];
            prisma.voteSession.create.mockResolvedValue({
                id: 'tiebreak-session',
                mode: 'TIE_BREAK',
                tieBreakRound: 1,
                parentSessionId: 'parent-session',
            });
            prisma.voteOption.create.mockResolvedValue({});
            const result = await service.createTieBreakSession(parentSession, tiedOptions);
            expect(prisma.voteSession.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    mode: 'TIE_BREAK',
                    tieBreakRound: 1,
                    parentSessionId: 'parent-session',
                    targetDayIndex: 0,
                    targetInsertAfterItemId: null,
                }),
            }));
            expect(prisma.voteOption.create).toHaveBeenCalledTimes(2);
        });
    });
    describe('persistOutcome - NEW_OPTION with createdItemId', () => {
        it('should persist VoteSessionOutcome with createdItemId for NEW_OPTION wins', async () => {
            const session = {
                id: 'session-1',
                tripId: 'trip-1',
                mode: 'NEW_OPTION',
                status: 'OPEN',
                targetItemId: null,
                targetDayIndex: 2,
                targetInsertAfterItemId: 'after-item',
                tieBreakRound: 0,
                deadline: new Date(Date.now() - 1000).toISOString(),
                options: [
                    { id: 'opt-a', title: 'Pho', status: 'ACTIVE', payload: { title: 'Pho', locationName: 'Pho Ha Noi' } },
                    { id: 'opt-b', title: 'Bun', status: 'ACTIVE', payload: { title: 'Bun', locationName: 'Bun Cha' } },
                ],
                ballots: [
                    { voteOptionId: 'opt-a', userId: 'u1' },
                    { voteOptionId: 'opt-a', userId: 'u2' },
                    { voteOptionId: 'opt-b', userId: 'u3' },
                ],
            };
            prisma.tripMember.findUnique.mockResolvedValue({ role: 'LEADER' });
            prisma.voteSession.findUnique.mockResolvedValue(session);
            prisma.voteOption.update.mockResolvedValue({});
            prisma.itineraryItem.findFirst.mockResolvedValue({ sortOrder: 5 });
            prisma.itineraryItem.create.mockResolvedValue({ id: 'new-item-123' });
            prisma.voteSessionOutcome.create.mockResolvedValue({});
            prisma.voteSession.update.mockResolvedValue({
                ...session,
                status: 'CLOSED',
            });
            prisma.voteBallot.findMany.mockResolvedValue(session.ballots);
            await service.closeSession('session-1', 'leader-1');
            expect(prisma.voteSessionOutcome.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    voteSessionId: 'session-1',
                    winningOptionId: 'opt-a',
                    createdItemId: 'new-item-123',
                    targetDayIndex: 2,
                    targetInsertAfterItemId: 'after-item',
                }),
            }));
        });
    });
    describe('persistOutcome - REPLACE_ITEM with replacementProposalId', () => {
        it('should create a proposal instead of overwriting and store replacementProposalId', async () => {
            const session = {
                id: 'session-2',
                tripId: 'trip-1',
                mode: 'REPLACE_ITEM',
                status: 'OPEN',
                targetItemId: 'existing-item',
                targetDayIndex: null,
                targetInsertAfterItemId: null,
                tieBreakRound: 0,
                deadline: new Date(Date.now() - 1000).toISOString(),
                options: [
                    { id: 'opt-x', title: 'Replace with X', status: 'ACTIVE', payload: { title: 'X', locationName: 'Place X' } },
                ],
                ballots: [
                    { voteOptionId: 'opt-x', userId: 'u1' },
                ],
            };
            prisma.tripMember.findUnique.mockResolvedValue({ role: 'LEADER' });
            prisma.voteSession.findUnique.mockResolvedValue(session);
            prisma.voteOption.update.mockResolvedValue({});
            prisma.itineraryProposal.create.mockResolvedValue({ id: 'proposal-xyz' });
            prisma.voteSessionOutcome.create.mockResolvedValue({});
            prisma.voteSession.update.mockResolvedValue({
                ...session,
                status: 'CLOSED',
            });
            prisma.voteBallot.findMany.mockResolvedValue(session.ballots);
            await service.closeSession('session-2', 'leader-1');
            expect(prisma.itineraryProposal.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    tripId: 'trip-1',
                    targetItemId: 'existing-item',
                    status: 'PENDING',
                }),
            }));
            expect(prisma.voteSessionOutcome.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    replacementProposalId: 'proposal-xyz',
                    targetItemId: 'existing-item',
                }),
            }));
        });
    });
    describe('LEADER_DECISION_REQUIRED after second tie', () => {
        it('should set LEADER_DECISION_REQUIRED status when tieBreakRound > 0 and tie occurs', async () => {
            const tieBreakSession = {
                id: 'tiebreak-session',
                tripId: 'trip-1',
                mode: 'TIE_BREAK',
                status: 'OPEN',
                tieBreakRound: 1,
                deadline: new Date(Date.now() - 1000).toISOString(),
                targetItemId: null,
                targetDayIndex: 0,
                targetInsertAfterItemId: null,
                options: [
                    { id: 'opt-a', status: 'ACTIVE' },
                    { id: 'opt-b', status: 'ACTIVE' },
                ],
                ballots: [
                    { voteOptionId: 'opt-a', userId: 'u1' },
                    { voteOptionId: 'opt-b', userId: 'u2' },
                ],
            };
            prisma.tripMember.findUnique.mockResolvedValue({ role: 'LEADER' });
            prisma.voteSession.findUnique
                .mockResolvedValueOnce(tieBreakSession)
                .mockResolvedValueOnce({ ...tieBreakSession, status: 'LEADER_DECISION_REQUIRED' });
            prisma.voteSession.update.mockResolvedValue({
                ...tieBreakSession,
                status: 'LEADER_DECISION_REQUIRED',
            });
            prisma.voteBallot.findMany.mockResolvedValue(tieBreakSession.ballots);
            await service.closeSession('tiebreak-session', 'leader-1');
            expect(prisma.voteSession.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'tiebreak-session' },
                data: expect.objectContaining({
                    status: 'LEADER_DECISION_REQUIRED',
                }),
            }));
        });
    });
});
//# sourceMappingURL=votes.service.spec.js.map