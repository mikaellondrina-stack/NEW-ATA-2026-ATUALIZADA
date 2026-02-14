'use strict';

// Sample array of active order of services (OS)
let activeOS = [
    { id: 1, description: 'OS 1', createdAt: '2026-02-13 12:00:00' },
    { id: 2, description: 'OS 2', createdAt: '2026-02-13 14:00:00' },
];

// Sample array of resolved order of services (OS)
let resolvedOS = [];

// Function to render active OS
function renderActiveOS() {
    const activeList = activeOS.map(os => `<li>${os.description} - Created at: ${os.createdAt}</li>`).join('');
    document.getElementById('active-os-list').innerHTML = activeList;
}

// Function to render resolved OS
function renderResolvedOS() {
    const resolvedList = resolvedOS.map(os => `<li>${os.description} - Resolved at: ${os.resolvedAt}</li>`).join('');
    document.getElementById('resolved-os-list').innerHTML = resolvedList;
}

// Function to mark OS as resolved
function markOSAsResolved(id) {
    const osIndex = activeOS.findIndex(os => os.id === id);
    if (osIndex !== -1) {
        const resolvedItem = { ...activeOS[osIndex], resolvedAt: '2026-02-14 01:07:16' };
        resolvedOS.push(resolvedItem);
        activeOS.splice(osIndex, 1);
        renderActiveOS();
        renderResolvedOS();
    }
}

// Function to delete OS from history
function deleteOSFromHistory(id) {
    const index = resolvedOS.findIndex(os => os.id === id);
    if (index !== -1) {
        resolvedOS.splice(index, 1);
        renderResolvedOS();
    }
}

// Initial render
renderActiveOS();
renderResolvedOS();