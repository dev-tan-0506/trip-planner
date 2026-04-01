-- CreateEnum
CREATE TYPE "TripRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ItineraryProposalType" AS ENUM ('ADD_ITEM', 'UPDATE_TIME', 'UPDATE_LOCATION', 'UPDATE_NOTE');

-- CreateEnum
CREATE TYPE "ItineraryProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'OUTDATED');

-- CreateEnum
CREATE TYPE "VoteSessionMode" AS ENUM ('NEW_OPTION', 'REPLACE_ITEM', 'TIE_BREAK');

-- CreateEnum
CREATE TYPE "VoteSessionStatus" AS ENUM ('PENDING_APPROVAL', 'OPEN', 'CLOSED', 'LEADER_DECISION_REQUIRED');

-- CreateEnum
CREATE TYPE "VoteOptionStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'WINNER', 'RUNNER_UP');

-- CreateEnum
CREATE TYPE "LogisticsUnitType" AS ENUM ('ROOM', 'RIDE');

-- CreateEnum
CREATE TYPE "LogisticsRideKind" AS ENUM ('MOTORBIKE', 'CAR', 'BUS');

-- CreateEnum
CREATE TYPE "LogisticsAssignmentSource" AS ENUM ('LEADER', 'SELF_JOIN', 'AUTO_FILL');

-- CreateEnum
CREATE TYPE "ChecklistGroupKind" AS ENUM ('SHARED_CATEGORY', 'PERSONAL_TASKS', 'DOCUMENTS');

-- CreateEnum
CREATE TYPE "ChecklistItemStatus" AS ENUM ('TODO', 'DONE');

-- CreateEnum
CREATE TYPE "AttendanceSessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "AttendanceLocationStatus" AS ENUM ('GRANTED', 'DENIED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "FundContributionMethod" AS ENUM ('MOMO', 'BANK_TRANSFER', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "FundContributionStatus" AS ENUM ('PLEDGED', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FundExpenseCategory" AS ENUM ('FOOD', 'TRANSPORT', 'ACCOMMODATION', 'TICKETS', 'EMERGENCY', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "healthProfile" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "joinCode" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "role" "TripRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryItem" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "startMinute" INTEGER,
    "title" TEXT NOT NULL,
    "locationName" TEXT,
    "locationAddress" TEXT,
    "placeId" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "shortNote" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryProposal" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "proposerId" TEXT NOT NULL,
    "targetItemId" TEXT,
    "type" "ItineraryProposalType" NOT NULL,
    "payload" JSONB NOT NULL,
    "baseVersion" INTEGER,
    "status" "ItineraryProposalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteSession" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "targetItemId" TEXT,
    "targetDayIndex" INTEGER,
    "targetInsertAfterItemId" TEXT,
    "mode" "VoteSessionMode" NOT NULL,
    "status" "VoteSessionStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "deadline" TIMESTAMP(3) NOT NULL,
    "parentSessionId" TEXT,
    "approvedById" TEXT,
    "tieBreakRound" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoteSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteOption" (
    "id" TEXT NOT NULL,
    "voteSessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "VoteOptionStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoteOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteBallot" (
    "id" TEXT NOT NULL,
    "voteSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoteBallot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteSessionOutcome" (
    "id" TEXT NOT NULL,
    "voteSessionId" TEXT NOT NULL,
    "winningOptionId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "targetItemId" TEXT,
    "targetDayIndex" INTEGER,
    "targetInsertAfterItemId" TEXT,
    "createdItemId" TEXT,
    "replacementProposalId" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoteSessionOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityTemplate" (
    "id" TEXT NOT NULL,
    "sourceTripId" TEXT NOT NULL,
    "publishedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destinationLabel" TEXT NOT NULL,
    "summary" TEXT,
    "coverNote" TEXT,
    "daysCount" INTEGER NOT NULL,
    "cloneCount" INTEGER NOT NULL DEFAULT 0,
    "sanitizedSnapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticsUnit" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "type" "LogisticsUnitType" NOT NULL,
    "label" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "rideKind" "LogisticsRideKind",
    "plateNumber" TEXT,
    "seatLabels" TEXT[],
    "sortOrder" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogisticsUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllocationAssignment" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "tripMemberId" TEXT NOT NULL,
    "seatLabel" TEXT,
    "createdByTripMemberId" TEXT,
    "source" "LogisticsAssignmentSource" NOT NULL DEFAULT 'LEADER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllocationAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistGroup" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "ChecklistGroupKind" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "proofUrl" TEXT,
    "proofSubmittedAt" TIMESTAMP(3),
    "assigneeTripMemberId" TEXT,
    "status" "ChecklistItemStatus" NOT NULL DEFAULT 'TODO',
    "sortOrder" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "createdByTripMemberId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meetingLabel" TEXT NOT NULL,
    "meetingAddress" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceSessionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSubmission" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "tripMemberId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "accuracyMeters" DOUBLE PRECISION,
    "locationStatus" "AttendanceLocationStatus" NOT NULL DEFAULT 'UNAVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripFund" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "ownerTripMemberId" TEXT NOT NULL,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "momoQrPayload" JSONB,
    "bankQrPayload" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundContribution" (
    "id" TEXT NOT NULL,
    "tripFundId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "tripMemberId" TEXT NOT NULL,
    "declaredAmount" DECIMAL(12,2) NOT NULL,
    "method" "FundContributionMethod" NOT NULL,
    "status" "FundContributionStatus" NOT NULL DEFAULT 'PLEDGED',
    "transferNote" TEXT,
    "confirmedByMemberId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundExpense" (
    "id" TEXT NOT NULL,
    "tripFundId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "createdByTripMemberId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" "FundExpenseCategory" NOT NULL,
    "linkedItineraryItemId" TEXT,
    "incurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyDirectoryEntry" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "source" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyDirectoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyAlert" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "message" TEXT NOT NULL,
    "createdByTripMemberId" TEXT,
    "linkedItineraryItemId" TEXT,
    "acknowledgedByTripMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_joinCode_key" ON "Trip"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "TripMember_userId_tripId_key" ON "TripMember"("userId", "tripId");

-- CreateIndex
CREATE INDEX "ItineraryItem_tripId_dayIndex_idx" ON "ItineraryItem"("tripId", "dayIndex");

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryItem_tripId_dayIndex_sortOrder_key" ON "ItineraryItem"("tripId", "dayIndex", "sortOrder");

-- CreateIndex
CREATE INDEX "ItineraryProposal_tripId_status_idx" ON "ItineraryProposal"("tripId", "status");

-- CreateIndex
CREATE INDEX "ItineraryProposal_targetItemId_idx" ON "ItineraryProposal"("targetItemId");

-- CreateIndex
CREATE INDEX "VoteSession_tripId_status_idx" ON "VoteSession"("tripId", "status");

-- CreateIndex
CREATE INDEX "VoteOption_voteSessionId_idx" ON "VoteOption"("voteSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "VoteBallot_voteSessionId_userId_key" ON "VoteBallot"("voteSessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "VoteSessionOutcome_voteSessionId_key" ON "VoteSessionOutcome"("voteSessionId");

-- CreateIndex
CREATE INDEX "LogisticsUnit_tripId_type_idx" ON "LogisticsUnit"("tripId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "LogisticsUnit_tripId_type_sortOrder_key" ON "LogisticsUnit"("tripId", "type", "sortOrder");

-- CreateIndex
CREATE INDEX "AllocationAssignment_tripId_idx" ON "AllocationAssignment"("tripId");

-- CreateIndex
CREATE INDEX "AllocationAssignment_tripMemberId_idx" ON "AllocationAssignment"("tripMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "AllocationAssignment_unitId_tripMemberId_key" ON "AllocationAssignment"("unitId", "tripMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistGroup_tripId_kind_sortOrder_key" ON "ChecklistGroup"("tripId", "kind", "sortOrder");

-- CreateIndex
CREATE INDEX "ChecklistItem_tripId_status_idx" ON "ChecklistItem"("tripId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_groupId_sortOrder_key" ON "ChecklistItem"("groupId", "sortOrder");

-- CreateIndex
CREATE INDEX "AttendanceSession_tripId_status_idx" ON "AttendanceSession"("tripId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceSubmission_sessionId_tripMemberId_key" ON "AttendanceSubmission"("sessionId", "tripMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "TripFund_tripId_key" ON "TripFund"("tripId");

-- CreateIndex
CREATE INDEX "FundContribution_tripFundId_status_idx" ON "FundContribution"("tripFundId", "status");

-- CreateIndex
CREATE INDEX "FundContribution_tripId_tripMemberId_idx" ON "FundContribution"("tripId", "tripMemberId");

-- CreateIndex
CREATE INDEX "FundExpense_tripFundId_incurredAt_idx" ON "FundExpense"("tripFundId", "incurredAt");

-- CreateIndex
CREATE INDEX "FundExpense_tripId_category_idx" ON "FundExpense"("tripId", "category");

-- CreateIndex
CREATE INDEX "SafetyDirectoryEntry_tripId_kind_idx" ON "SafetyDirectoryEntry"("tripId", "kind");

-- CreateIndex
CREATE INDEX "SafetyAlert_tripId_status_idx" ON "SafetyAlert"("tripId", "status");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripMember" ADD CONSTRAINT "TripMember_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryItem" ADD CONSTRAINT "ItineraryItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryProposal" ADD CONSTRAINT "ItineraryProposal_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryProposal" ADD CONSTRAINT "ItineraryProposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryProposal" ADD CONSTRAINT "ItineraryProposal_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryProposal" ADD CONSTRAINT "ItineraryProposal_targetItemId_fkey" FOREIGN KEY ("targetItemId") REFERENCES "ItineraryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSession" ADD CONSTRAINT "VoteSession_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSession" ADD CONSTRAINT "VoteSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSession" ADD CONSTRAINT "VoteSession_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSession" ADD CONSTRAINT "VoteSession_targetItemId_fkey" FOREIGN KEY ("targetItemId") REFERENCES "ItineraryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSession" ADD CONSTRAINT "VoteSession_parentSessionId_fkey" FOREIGN KEY ("parentSessionId") REFERENCES "VoteSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteOption" ADD CONSTRAINT "VoteOption_voteSessionId_fkey" FOREIGN KEY ("voteSessionId") REFERENCES "VoteSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteBallot" ADD CONSTRAINT "VoteBallot_voteSessionId_fkey" FOREIGN KEY ("voteSessionId") REFERENCES "VoteSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteBallot" ADD CONSTRAINT "VoteBallot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteBallot" ADD CONSTRAINT "VoteBallot_voteOptionId_fkey" FOREIGN KEY ("voteOptionId") REFERENCES "VoteOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSessionOutcome" ADD CONSTRAINT "VoteSessionOutcome_voteSessionId_fkey" FOREIGN KEY ("voteSessionId") REFERENCES "VoteSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSessionOutcome" ADD CONSTRAINT "VoteSessionOutcome_winningOptionId_fkey" FOREIGN KEY ("winningOptionId") REFERENCES "VoteOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSessionOutcome" ADD CONSTRAINT "VoteSessionOutcome_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSessionOutcome" ADD CONSTRAINT "VoteSessionOutcome_targetItemId_fkey" FOREIGN KEY ("targetItemId") REFERENCES "ItineraryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSessionOutcome" ADD CONSTRAINT "VoteSessionOutcome_createdItemId_fkey" FOREIGN KEY ("createdItemId") REFERENCES "ItineraryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSessionOutcome" ADD CONSTRAINT "VoteSessionOutcome_replacementProposalId_fkey" FOREIGN KEY ("replacementProposalId") REFERENCES "ItineraryProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityTemplate" ADD CONSTRAINT "CommunityTemplate_sourceTripId_fkey" FOREIGN KEY ("sourceTripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityTemplate" ADD CONSTRAINT "CommunityTemplate_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsUnit" ADD CONSTRAINT "LogisticsUnit_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationAssignment" ADD CONSTRAINT "AllocationAssignment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationAssignment" ADD CONSTRAINT "AllocationAssignment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "LogisticsUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationAssignment" ADD CONSTRAINT "AllocationAssignment_tripMemberId_fkey" FOREIGN KEY ("tripMemberId") REFERENCES "TripMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationAssignment" ADD CONSTRAINT "AllocationAssignment_createdByTripMemberId_fkey" FOREIGN KEY ("createdByTripMemberId") REFERENCES "TripMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistGroup" ADD CONSTRAINT "ChecklistGroup_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ChecklistGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_assigneeTripMemberId_fkey" FOREIGN KEY ("assigneeTripMemberId") REFERENCES "TripMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_createdByTripMemberId_fkey" FOREIGN KEY ("createdByTripMemberId") REFERENCES "TripMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSubmission" ADD CONSTRAINT "AttendanceSubmission_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSubmission" ADD CONSTRAINT "AttendanceSubmission_tripMemberId_fkey" FOREIGN KEY ("tripMemberId") REFERENCES "TripMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripFund" ADD CONSTRAINT "TripFund_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripFund" ADD CONSTRAINT "TripFund_ownerTripMemberId_fkey" FOREIGN KEY ("ownerTripMemberId") REFERENCES "TripMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundContribution" ADD CONSTRAINT "FundContribution_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundContribution" ADD CONSTRAINT "FundContribution_tripFundId_fkey" FOREIGN KEY ("tripFundId") REFERENCES "TripFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundContribution" ADD CONSTRAINT "FundContribution_tripMemberId_fkey" FOREIGN KEY ("tripMemberId") REFERENCES "TripMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundContribution" ADD CONSTRAINT "FundContribution_confirmedByMemberId_fkey" FOREIGN KEY ("confirmedByMemberId") REFERENCES "TripMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundExpense" ADD CONSTRAINT "FundExpense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundExpense" ADD CONSTRAINT "FundExpense_tripFundId_fkey" FOREIGN KEY ("tripFundId") REFERENCES "TripFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundExpense" ADD CONSTRAINT "FundExpense_createdByTripMemberId_fkey" FOREIGN KEY ("createdByTripMemberId") REFERENCES "TripMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyDirectoryEntry" ADD CONSTRAINT "SafetyDirectoryEntry_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAlert" ADD CONSTRAINT "SafetyAlert_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAlert" ADD CONSTRAINT "SafetyAlert_createdByTripMemberId_fkey" FOREIGN KEY ("createdByTripMemberId") REFERENCES "TripMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAlert" ADD CONSTRAINT "SafetyAlert_acknowledgedByTripMemberId_fkey" FOREIGN KEY ("acknowledgedByTripMemberId") REFERENCES "TripMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
