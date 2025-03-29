// scripts/ui/teamMemberInput.js

export function setupTeamMemberInput(socket) {
    const inputs = document.querySelectorAll('.team-member-input');

    inputs.forEach(input => {
        const team = input.dataset.team;
        input.addEventListener('input', () => {
            const content = input.value;
            socket.emit('team-members-update', { team, content });
        });
    });
}