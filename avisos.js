// avisos.js
// Operational Alerts System with CRUD operations, Role-based Permissions, Supabase Sync, and Offline Fallback

class OperationalAlerts {
    constructor() {
        this.alerts = [];
        this.supabaseUrl = 'https://your-supabase-url';
        this.supabaseKey = 'your-supabase-key';
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        this.loadFromLocalStorage();
    }

    // Load alerts from localStorage
    loadFromLocalStorage() {
        const alerts = JSON.parse(localStorage.getItem('alerts')) || [];
        this.alerts = alerts;
    }

    // Save alerts to localStorage
    saveToLocalStorage() {
        localStorage.setItem('alerts', JSON.stringify(this.alerts));
    }

    // Create Alert
    createAlert(alert) {
        if (this.isAdmin() || this.isTechnician()) {
            this.alerts.push(alert);
            this.saveToLocalStorage();
            this.syncWithSupabase();
            this.updateUI();
        } else {
            throw new Error('Permission denied. ADMIN/TÉCNICO roles required.');
        }
    }

    // Read Alerts
    readAlerts() {
        return this.alerts;
    }

    // Update Alert
    updateAlert(index, updatedAlert) {
        if (this.isAdmin()) {
            this.alerts[index] = updatedAlert;
            this.saveToLocalStorage();
            this.syncWithSupabase();
            this.updateUI();
        } else {
            throw new Error('Permission denied. ADMIN role required.');
        }
    }

    // Delete Alert
    deleteAlert(index) {
        if (this.isAdmin()) {
            this.alerts.splice(index, 1);
            this.saveToLocalStorage();
            this.syncWithSupabase();
            this.updateUI();
        } else {
            throw new Error('Permission denied. ADMIN role required.');
        }
    }

    // Sync with Supabase
    async syncWithSupabase() {
        const { data, error } = await this.supabase.from('alerts').upsert(this.alerts);
        if (error) console.error('Error syncing with Supabase:', error);
    }

    // Check if user is ADMIN
    isAdmin() {
        // Implement your role-checking logic here
        return true;
    }

    // Check if user is TECHNICIAN
    isTechnician() {
        // Implement your role-checking logic here
        return false;
    }

    // Update UI
    updateUI() {
        this.alerts.forEach(alert => {
            const color = this.getPriorityColor(alert.priority);
            // Update your UI with the alert data and color
        });
    }

    // Get priority color
    getPriorityColor(priority) {
        switch(priority) {
            case 'normal': return 'green';
            case 'media': return 'yellow';
            case 'alta': return 'red';
            default: return 'gray';
        }
    }
}

const operationalAlerts = new OperationalAlerts();
// Add onchange listener for real-time sync
window.addEventListener('storage', (event) => {
    if (event.key === 'alerts') {
        operationalAlerts.loadFromLocalStorage();
        operationalAlerts.updateUI();
    }
});