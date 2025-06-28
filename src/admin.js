// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.adminPassword = 'Theo12345?';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-btn');
        const refreshBtn = document.getElementById('refresh-btn');

        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        logoutBtn?.addEventListener('click', () => this.logout());
        refreshBtn?.addEventListener('click', () => this.loadRequests());
    }

    checkAuthStatus() {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
        if (isAuthenticated === 'true') {
            this.showDashboard();
        } else {
            this.showLoginScreen();
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        if (password === this.adminPassword) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            this.showDashboard();
            errorDiv.classList.add('hidden');
        } else {
            errorDiv.classList.remove('hidden');
            document.getElementById('password').value = '';
        }
    }

    logout() {
        sessionStorage.removeItem('adminAuthenticated');
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        this.loadRequests();
    }

    loadRequests() {
        const requests = this.getRequests();
        const totalCount = document.getElementById('total-count');
        const noRequestsDiv = document.getElementById('no-requests');
        const requestsContainer = document.getElementById('requests-container');

        totalCount.textContent = requests.length;

        if (requests.length === 0) {
            noRequestsDiv.classList.remove('hidden');
            requestsContainer.innerHTML = '';
        } else {
            noRequestsDiv.classList.add('hidden');
            this.renderRequests(requests);
        }
    }

    renderRequests(requests) {
        const container = document.getElementById('requests-container');
        
        container.innerHTML = requests.map(request => `
            <div class="request-card" data-id="${request.id}">
                <div class="request-header">
                    <div class="request-info">
                        <h3>${this.escapeHtml(request.songTitle)}</h3>
                        <p><strong>Artist:</strong> ${this.escapeHtml(request.songArtist)}</p>
                        <p><strong>Requested by:</strong> ${this.escapeHtml(request.fullName)}</p>
                        <div class="request-meta">
                            <p>Submitted: ${this.formatDate(request.timestamp)}</p>
                        </div>
                    </div>
                    <button class="complete-btn" onclick="adminDashboard.completeRequest(${request.id})">
                        ✓ Complete
                    </button>
                </div>
            </div>
        `).join('');
    }

    completeRequest(id) {
        if (confirm('Mark this request as completed? This will remove it from the list.')) {
            let requests = this.getRequests();
            requests = requests.filter(request => request.id !== id);
            localStorage.setItem('songRequests', JSON.stringify(requests));
            this.loadRequests();
            
            // Show success feedback
            this.showNotification('Request completed successfully!', 'success');
        }
    }

    getRequests() {
        const stored = localStorage.getItem('songRequests');
        return stored ? JSON.parse(stored) : [];
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : '#6366F1'};
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
        `;
        
        notification.querySelector('button').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize admin dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});
