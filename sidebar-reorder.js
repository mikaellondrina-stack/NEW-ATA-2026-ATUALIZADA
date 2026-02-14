function reorderSidebar(data) {
    // Separate unread notifications from the rest
    const unreadNotifications = data.filter(item => item.unread);
    const readNotifications = data.filter(item => !item.unread);

    // Sort unread notifications (presuming they maintain their order or have specific identifiers)
    const sortedUnread = unreadNotifications.sort((a, b) => a.name.localeCompare(b.name));
    // Sort read notifications alphabetically
    const sortedRead = readNotifications.sort((a, b) => a.name.localeCompare(b.name));

    // Combine unread notifications with sorted read notifications
    return [...sortedUnread, ...sortedRead];
}

function updateNotificationBadges(data) {
    // Logic to update badges based on data received
    const unreadCount = data.filter(item => item.unread).length;
    document.getElementById('notification-badge').textContent = unreadCount;
}

// Example usage
const sidebarData = [
    { name: 'Condo A', unread: true },
    { name: 'Condo B', unread: false },
    { name: 'Condo C', unread: true },
    { name: 'Condo D', unread: false }
];

const reorderedData = reorderSidebar(sidebarData);
updateNotificationBadges(sidebarData); // This would be based on the initial data source where it contains unread status
