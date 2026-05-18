import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useTeamInfoStore } from '@/modules/team';
import { useAuthStore } from '@/modules/auth';

export function useMyTeamInfo() {
    const teamInfoStore = useTeamInfoStore();
    const authStore = useAuthStore();

    const { teamMembersMap } = storeToRefs(teamInfoStore);
    const { identityKey } = storeToRefs(authStore);

    const myTeamSlot = computed(() => {
        const myIdentityKey = identityKey.value;
        const map = teamMembersMap.value;
        if (!myIdentityKey) return undefined;

        for (const [teamSlot, members] of Object.entries(map)) {
            const memberList = Object.values(members);
            const found = memberList.find((m) => m.type === 'Online' && m.user.identityKey === myIdentityKey);
            
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
