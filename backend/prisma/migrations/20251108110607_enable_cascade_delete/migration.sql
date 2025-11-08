-- DropForeignKey
ALTER TABLE "public"."MatchMove" DROP CONSTRAINT "MatchMove_matchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MatchMove" DROP CONSTRAINT "MatchMove_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MatchTacticalUsage" DROP CONSTRAINT "MatchTacticalUsage_teamMemberId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MatchTeam" DROP CONSTRAINT "MatchTeam_matchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MatchTeamMember" DROP CONSTRAINT "MatchTeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RandomMoveContext" DROP CONSTRAINT "RandomMoveContext_matchMoveId_fkey";

-- AddForeignKey
ALTER TABLE "public"."MatchTeam" ADD CONSTRAINT "MatchTeam_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchTeamMember" ADD CONSTRAINT "MatchTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."MatchTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchTacticalUsage" ADD CONSTRAINT "MatchTacticalUsage_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "public"."MatchTeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchMove" ADD CONSTRAINT "MatchMove_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchMove" ADD CONSTRAINT "MatchMove_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."MatchTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RandomMoveContext" ADD CONSTRAINT "RandomMoveContext_matchMoveId_fkey" FOREIGN KEY ("matchMoveId") REFERENCES "public"."MatchMove"("id") ON DELETE CASCADE ON UPDATE CASCADE;
