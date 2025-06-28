// Song Request App - Main JavaScript
class SongRequestApp {
    constructor() {
        this.API_KEY = '2d1e0b1e6e9d8c4f7a3b5c8d9e2f1a4b'; // Last.fm API key (you'll need to register)
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadExistingData();
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
            id: Date.now(),
            fullName: formData.get('fullName'),
            songTitle: formData.get('songTitle'),
            songArtist: formData.get('songArtist'),
            timestamp: new Date().toISOString(),
            completed: false
        };

        try {
            // Save to localStorage (in a real app, this would be sent to a server)
            this.saveRequest(requestData);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Reset form
            e.target.reset();
            this.showDefaultCover();
            
            // Show success modal
            this.showSuccessModal();
            
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Error submitting request. Please try again.');
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    saveRequest(requestData) {
        const requests = this.getRequests();
        requests.push(requestData);
        localStorage.setItem('songRequests', JSON.stringify(requests));
    }

    getRequests() {
        const stored = localStorage.getItem('songRequests');
        return stored ? JSON.parse(stored) : [];
    }

    loadExistingData() {
        // This method can be extended to show recent requests or other data
        console.log('App initialized with', this.getRequests().length, 'existing requests');
    }

    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('success-modal');
        modal.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SongRequestApp();
});
