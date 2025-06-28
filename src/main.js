// Song Request App - Main JavaScript with MongoDB integration
class SongRequestApp {
    constructor() {
        this.API_BASE = window.location.origin;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('song-request-form');
        const songTitleInput = document.getElementById('songTitle');
        const songArtistInput = document.getElementById('songArtist');
        const closeModalBtn = document.getElementById('close-modal');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time album cover search
        let searchTimeout;
        const searchAlbumCover = () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const title = songTitleInput.value.trim();
                const artist = songArtistInput.value.trim();
                if (title && artist) {
                    this.searchAlbumCover(title, artist);
                } else {
                    this.showDefaultCover();
                }
            }, 500);
        };

        songTitleInput.addEventListener('input', searchAlbumCover);
        songArtistInput.addEventListener('input', searchAlbumCover);

        closeModalBtn.addEventListener('click', () => this.closeModal());
    }

    async searchAlbumCover(title, artist) {
        try {
            // Using iTunes API as it's free and doesn't require authentication
            const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + title)}&entity=song&limit=1`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const albumCover = result.artworkUrl100.replace('100x100', '400x400'); // Get higher resolution
                this.showAlbumCover(albumCover, title, artist);
            } else {
                this.showDefaultCover();
            }
        } catch (error) {
            console.error('Error fetching album cover:', error);
            this.showDefaultCover();
        }
    }

    showAlbumCover(imageUrl, title, artist) {
        const defaultCover = document.getElementById('default-cover');
        const albumCover = document.getElementById('album-cover');
        const songInfo = document.getElementById('song-info');
        const displaySong = document.getElementById('display-song');
        const displayArtist = document.getElementById('display-artist');

        defaultCover.style.display = 'none';
        albumCover.src = imageUrl;
        albumCover.style.display = 'block';
        
        displaySong.textContent = title;
        displayArtist.textContent = artist;
        songInfo.style.display = 'block';
    }

    showDefaultCover() {
        const defaultCover = document.getElementById('default-cover');
        const albumCover = document.getElementById('album-cover');
        const songInfo = document.getElementById('song-info');

        defaultCover.style.display = 'flex';
        albumCover.style.display = 'none';
        songInfo.style.display = 'none';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoader.classList.remove('hidden');
        submitBtn.disabled = true;

        const formData = new FormData(e.target);
        const requestData = {
            fullName: formData.get('fullName'),
            songTitle: formData.get('songTitle'),
            songArtist: formData.get('songArtist')
        };

        try {
            const response = await fetch(`${this.API_BASE}/api/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            
            if (result.success) {
                // Reset form
                e.target.reset();
                this.showDefaultCover();
                
                // Show success modal
                this.showSuccessModal();
            } else {
                throw new Error(result.error || 'Failed to submit request');
            }
            
        } catch (error) {
            console.error('Error submitting request:', error);
            this.showNotification('Error submitting request. Please try again.', 'error');
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('success-modal');
        modal.classList.add('hidden');
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
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#6366F1'};
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SongRequestApp();
});
