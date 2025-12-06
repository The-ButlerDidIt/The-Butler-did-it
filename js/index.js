// =============================================
//  Main Application
// =============================================

// Track current page for pagination
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

const TMDB = {
    /**
     * Fetch popular movies from TMDB
     * @param {number} page - Page number (default: 1)
     * @returns {Promise<Object>} - Movie results
     */
    async fetchPopularMovies(page = 1) {
        const url = `${CONFIG.TMDB_BASE_URL}/movie/popular?api_key=${CONFIG.TMDB_API_KEY}&page=${page}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json(); 
            return data;
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            throw error;
        }
    },

    /**
     * Get full image URL for a poster
     * @param {string} path - Poster path from API
     * @param {string} size - Image size (default from config)
     * @returns {string} - Full image URL
     */
    getImageUrl(path, size = CONFIG.POSTER_SIZE) {
        if (!path) return 'images/no-poster.png';
        return `${CONFIG.TMDB_IMAGE_URL}/${size}${path}`;
    },

    /**
     * Format date to readable string
     * @param {string} dateString - Date string from API
     * @returns {string} - Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }
};

// =============================================
// UI Rendering Functions
// =============================================

const UI = {
    /**
     * Create a movie card HTML element
     * @param {Object} movie - Movie data from API
     * @returns {string} - HTML string for movie card
     */
    createMovieCard(movie) { 
        const posterUrl = TMDB.getImageUrl(movie.poster_path);
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const releaseDate = TMDB.formatDate(movie.release_date);
        
        return `
            <a href="movie.html?id=${movie.id}" class="movie-card cursor-pointer">
                <div class="poster-wrapper">
                    <img 
                        src="${posterUrl}" 
                        alt="${movie.title}" 
                        class="poster-image w-full aspect-[2/3] object-cover"
                        loading="lazy"
                    >
                    <div class="card-overlay"></div>
                    <div class="absolute top-3 right-3 rating-badge flex items-center gap-1 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <svg class="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span class="text-xs font-semibold">${rating}</span>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-sm mb-1 line-clamp-1">${movie.title}</h3>
                    <p class="text-gray-500 text-xs">${releaseDate}</p>
                </div>
            </a>
        `;
    },

    /**
     * Render movies to the grid
     * @param {Array} movies - Array of movie objects
     * @param {boolean} append - Whether to append or replace
     * @param {string} containerId - ID of container element
     */
    renderMovies(movies, append = false, containerId = 'movies-grid') {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        
        const moviesHTML = movies.map(movie => UI.createMovieCard(movie)).join('');
        
        if (append) {
            container.insertAdjacentHTML('beforeend', moviesHTML);
        } else {
            container.innerHTML = moviesHTML;
        }
    },

    /**
     * Update Load More button state
     */
    updateLoadMoreButton() {
        const btn = document.getElementById('load-more-btn');
        if (!btn) return;
        
        if (currentPage >= totalPages) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Load More';
        }
    },

    /**
     * Set Load More button to loading state
     */
    setLoadMoreLoading() {
        const btn = document.getElementById('load-more-btn');
        if (!btn) return;
        
        btn.disabled = true;
        btn.textContent = 'Loading...';
    },

    /**
     * Show loading state in grid
     * @param {string} containerId - ID of container element
     */
    showLoading(containerId = 'movies-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Create 12 skeleton cards
        const skeletons = Array(12).fill(`
            <div class="movie-card animate-pulse">
                <div class="poster-wrapper">
                    <div class="w-full aspect-[2/3] bg-surface-lighter"></div>
                </div>
                <div class="p-4">
                    <div class="h-4 bg-surface-lighter rounded mb-2 w-3/4"></div>
                    <div class="h-3 bg-surface-lighter rounded w-1/2"></div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = skeletons;
    },

    /**
     * Show error message
     * @param {string} message - Error message
     * @param {string} containerId - ID of container element
     */
    showError(message, containerId = 'movies-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-400 text-lg">${message}</p>
                <button onclick="loadPopularMovies()" class="mt-4 px-6 py-2 bg-accent text-surface rounded-lg hover:bg-accent-dim transition-colors">
                    Try Again
                </button>
            </div>
        `;
    }
};

// =============================================
// Main Functions
// =============================================

/**
 * Load and display popular movies (initial load)
 */
async function loadPopularMovies() {
    UI.showLoading();
    currentPage = 1;
    
    try {
        const data = await TMDB.fetchPopularMovies(currentPage);
        totalPages = data.total_pages;
        UI.renderMovies(data.results, false);
        UI.updateLoadMoreButton();
    } catch (error) {
        UI.showError('Failed to load movies. Please try again.');
    }
}

/**
 * Load more movies (pagination)
 */
async function loadMoreMovies() {
    if (isLoading || currentPage >= totalPages) return;
    
    isLoading = true;
    UI.setLoadMoreLoading();
    
    try {
        currentPage++;
        const data = await TMDB.fetchPopularMovies(currentPage);
        UI.renderMovies(data.results, true);
        UI.updateLoadMoreButton();
    } catch (error) {
        currentPage--;
        console.error('Error loading more movies:', error);
    } finally {
        isLoading = false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPopularMovies();
});