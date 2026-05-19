import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { isSameIdentity } from '@shared/contracts/auth/Identity';
import { useTeamInfoStore } from '@/modules/team';
import { useAuthStore } from '@/modules/auth';

export function useMyTeamInfo() {
    const teamInfoStore = useTeamInfoStore();
    const authStore = useAuthStore();

    const { teamMembersMap } = storeToRefs(teamInfoStore);
    const { identity } = storeToRefs(authStore);

    const myTeamSlot = computed(() => {
        const myIdentity = identity.value;
        const map = teamMembersMap.value;
        if (!myIdentity) return undefined;

        for (const [teamSlot, members] of Object.entries(map)) {
            const memberList = Object.values(members);
            const found = memberList.find((m) => m.type !== 'Name' && isSameIdentity(m, myIdentity));

            if (found) {
                return Number(teamSlot);
            }
        }
        return undefined;
    });

    return {
        myTeamSlot,
    };
}
