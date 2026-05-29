-- Cosmetic: rename the leftover sequence MatchTacticalUsage_id_seq → MatchLineupSlot_id_seq.
-- The previous rename migration handled table/indexes/FKs; Postgres's ALTER TABLE RENAME
-- does not auto-rename the sequence the id column depends on.

ALTER SEQUENCE "public"."MatchTacticalUsage_id_seq" RENAME TO "MatchLineupSlot_id_seq";
