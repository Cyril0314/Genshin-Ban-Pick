-- Rename table MatchTacticalUsage → MatchLineupSlot, plus its indexes and FK constraints.
-- Pure rename: no column changes, no data movement.

ALTER TABLE "public"."MatchTacticalUsage" RENAME TO "MatchLineupSlot";

ALTER INDEX "public"."MatchTacticalUsage_pkey" RENAME TO "MatchLineupSlot_pkey";
ALTER INDEX "public"."MatchTacticalUsage_teamMemberId_setupNumber_idx" RENAME TO "MatchLineupSlot_teamMemberId_setupNumber_idx";
ALTER INDEX "public"."MatchTacticalUsage_setupNumber_idx" RENAME TO "MatchLineupSlot_setupNumber_idx";

ALTER TABLE "public"."MatchLineupSlot" RENAME CONSTRAINT "MatchTacticalUsage_teamMemberId_fkey" TO "MatchLineupSlot_teamMemberId_fkey";
ALTER TABLE "public"."MatchLineupSlot" RENAME CONSTRAINT "MatchTacticalUsage_characterKey_fkey" TO "MatchLineupSlot_characterKey_fkey";
