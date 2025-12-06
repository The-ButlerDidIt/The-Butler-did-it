// const id = new URLSearchParams(window.location.search).get('id'); // my code

// =============================================
// Movie Details Page
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
    const movieId = getMovieIdFromUrl(); 
    // if (!movieId) {
    //     await Prompt.error('No movie ID provided.', 'Invalid Request');
    //     window.location.href = 'index.html';
    //     return;
    // }

   const movieLoaded = await loadMovieDetails(movieId);   
   populateMovieDetails(movieLoaded);
});

/**
 * Get movie ID from URL query string
 * @returns {string|null} - Movie ID or null
 */
function getMovieIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

 
async function loadMovieDetails(movieId){
    const url = `${CONFIG.TMDB_BASE_URL}/movie/${movieId}?api_key=${CONFIG.TMDB_API_KEY}&append_to_response=credits,videos`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                await Prompt.error('Movie not found.', 'Not Found');
                window.location.href = 'index.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();  
        return result;
    } catch (error) {
        await Prompt.error('Failed to load movie details. Please try again.', 'Error');
    }
}

function populateMovieDetails(loadedMovie){ 
    document.getElementById("movieTitle").textContent = loadedMovie.title;
    document.getElementById("movieTagline").textContent = loadedMovie.tagline;
    setRating(loadedMovie.vote_average, loadedMovie.vote_count);
    addGenres(loadedMovie.genres);
    document.getElementById("movieOverview").textContent = loadedMovie.overview;

    document.getElementById("movieRelease").textContent = formatReleaseDate(loadedMovie.release_date);
    document.getElementById("movieRuntime").textContent = formatRuntime(loadedMovie.runtime);
    document.getElementById("movieBudget").textContent = formatMoney(loadedMovie.budget);
    document.getElementById("movieRevenue").textContent = formatMoney(loadedMovie.revenue);
    addCast(loadedMovie.credits.cast);
    initCastScrollButtons();
    setBackdrop(loadedMovie.backdrop_path);
    setPoster(loadedMovie.poster_path, loadedMovie.title);
    setTrailer(loadedMovie.videos?.results);
}

function formatRuntime(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
}

function addGenres(genres) {
    const container = document.getElementById("genreContainer");
    if (!container || !Array.isArray(genres)) return; 

    const fragment = document.createDocumentFragment();

    for (const genre of genres) {
        const span = document.createElement("span");
        span.className = "genre-badge px-4 py-1.5 rounded-full border border-white/10 text-sm text-gray-300 transition-colors cursor-pointer";
        span.textContent = genre.name;
        fragment.appendChild(span);
    }

    container.appendChild(fragment);
}


function formatMoney(value) {
    if (value == null || isNaN(value)) return "N/A";
    return `$${value.toLocaleString("en-US")}`;
}


function addCast(castList) {
    const container = document.getElementById("castContainer");
    if (!container || !Array.isArray(castList)) return;

    const fragment = document.createDocumentFragment();

    for (const castMember of castList) {
        const card = document.createElement("div");
        card.className = "card-hover glass rounded-xl overflow-hidden flex-shrink-0 w-36";

        // Image wrapper
        const imgWrapper = document.createElement("div");
        imgWrapper.className = "aspect-[2/3] bg-surface-lighter";

        if (castMember.profile_path) {
            const img = document.createElement("img");
            img.src = `https://image.tmdb.org/t/p/w185${castMember.profile_path}`;
            img.alt = castMember.name;
            img.className = "w-full h-full object-cover";
            img.loading = "lazy";
            imgWrapper.appendChild(img);
        }

        // Text content
        const content = document.createElement("div");
        content.className = "p-3";

        const actorName = document.createElement("p");
        actorName.className = "font-semibold text-sm truncate";
        actorName.textContent = castMember.name;

        const character = document.createElement("p");
        character.className = "text-gray-500 text-xs truncate";
        character.textContent = castMember.character || "";

        content.appendChild(actorName);
        content.appendChild(character);

        card.appendChild(imgWrapper);
        card.appendChild(content);

        fragment.appendChild(card);
    }

    container.appendChild(fragment);
}

function initCastScrollButtons() {
    const container = document.getElementById('castContainer');
    const leftBtn = document.getElementById('castScrollLeft');
    const rightBtn = document.getElementById('castScrollRight');
    
    if (!container || !leftBtn || !rightBtn) return;
    
    const scrollAmount = 300;
    
    const updateButtons = () => {
        leftBtn.disabled = container.scrollLeft <= 0;
        rightBtn.disabled = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
    };
    
    leftBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    rightBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    container.addEventListener('scroll', updateButtons);
    
    // Initial state
    updateButtons();
}

function setBackdrop(backdropPath) {
    const backdropEl = document.getElementById('backdropImage');
    if (!backdropEl || !backdropPath) return;
    
    const imageUrl = `${CONFIG.TMDB_IMAGE_URL}/${CONFIG.BACKDROP_SIZE}${backdropPath}`;
    backdropEl.style.backgroundImage = `url('${imageUrl}')`;
}

function setPoster(posterPath, title) {
    const posterEl = document.getElementById('posterImage');
    if (!posterEl || !posterPath) return;
    
    const imageUrl = `${CONFIG.TMDB_IMAGE_URL}/${CONFIG.POSTER_SIZE}${posterPath}`;
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = title;
    img.className = 'w-full h-full object-cover';
    posterEl.appendChild(img);
}

function setTrailer(videos) {
    const container = document.getElementById('trailerContainer');
    const placeholder = document.getElementById('trailerPlaceholder');
    const thumbnail = document.getElementById('trailerThumbnail');
    const noTrailerMsg = document.getElementById('noTrailerMessage');
    
    if (!container) return;
    
    // Find trailer or first YouTube video
    const trailer = videos?.find(v => v.type === 'Trailer' && v.site === 'YouTube') 
                 || videos?.find(v => v.site === 'YouTube');
    
    if (!trailer) {
        container.classList.add('hidden');
        if (noTrailerMsg) noTrailerMsg.classList.remove('hidden');
        return;
    }
    
    const videoKey = trailer.key;
    
    // Set YouTube thumbnail
    if (thumbnail) {
        thumbnail.style.backgroundImage = `url('https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg')`;
    }
    
    // Click to play
    if (placeholder) {
        placeholder.addEventListener('click', () => {
            container.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0" 
                    class="w-full h-full"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        });
    }
}

function formatReleaseDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";

        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    } catch {
        return dateString;
    }
}

function getRatingColor(score) {
    if (score >= 70) return { color: '#22c55e', name: 'green' };   // Good
    if (score >= 50) return { color: '#f59e0b', name: 'amber' };   // Mixed
    return { color: '#ef4444', name: 'red' };                       // Bad
}

function setRating(voteAverage, voteCount) {
    const ratingEl = document.getElementById('movieRating');
    const ringEl = document.getElementById('ratingRing');
    const voteCountEl = document.getElementById('movieVoteCount');
    
    const score = voteAverage ? Math.round(voteAverage * 10) : 0;
    const ratingColor = getRatingColor(score);
    
    if (ratingEl) {
        ratingEl.textContent = voteAverage ? voteAverage.toFixed(1) : 'NR';
        ratingEl.style.color = ratingColor.color;
    }
    
    if (ringEl) {
        ringEl.style.setProperty('--score', score);
        ringEl.style.setProperty('--rating-color', ratingColor.color);
    }
    
    if (voteCountEl) {
        voteCountEl.textContent = voteCount ? `${voteCount.toLocaleString()} votes` : 'No votes yet';
    }
}
