// scripts/ui/setupTeamMemberInput.js

export function setupTeamMemberInput(socket) {
    const inputs = document.querySelectorAll('.team__member-input');

    inputs.forEach((input, index) => {
        const team = input.dataset.team;
        input.addEventListener('input', () => {
            const content = input.value;
            const teamMembers = content.split("\n");
            const event = new CustomEvent('teamMembersUpdated', {
                detail: { team, teamMembers }
            });
            document.dispatchEvent(event);

            socket.emit('team.members.update.request', {
                team,
                content,
                senderId: socket.id
            });
        });
    });
}