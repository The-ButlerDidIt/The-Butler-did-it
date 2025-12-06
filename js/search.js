// js/search.js

// Pull from your existing config.js
const API_KEY = CONFIG.TMDB_API_KEY;
const API_BASE = CONFIG.TMDB_BASE_URL;
const IMG_BASE = CONFIG.TMDB_IMAGE_URL;

// --------------------------------------------------
// BLOODHOUND SUGGESTION ENGINE
// --------------------------------------------------
const movieSearchEngine = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace("title"),
    queryTokenizer: Bloodhound.tokenizers.whitespace,

    remote: {
        url: `${API_BASE}/search/movie?api_key=${API_KEY}&include_adult=false&query=%QUERY`,
        wildcard: "%QUERY",

        rateLimitWait: 300,

        transform: (response) => {
            // TMDB returns: { results, page, total_pages, total_results }
            return response.results || [];
        }
    }
});

// --------------------------------------------------
// FORMATTING HELPERS
// --------------------------------------------------
function formatYear(dateStr) {
    if (!dateStr) return "";
    return dateStr.split("-")[0] || "";
}

function suggestionTemplate(movie) {
    const poster = movie.poster_path
        ? `${IMG_BASE}/w92${movie.poster_path}`
        : null;

    const year = formatYear(movie.release_date);

    return `
        <div class="flex items-center gap-3 px-3 py-2 hover:bg-surface-lighter/60 cursor-pointer">
            ${
                poster
                    ? `<img src="${poster}" class="w-10 h-14 rounded-md object-cover" />`
                    : `<div class="w-10 h-14 rounded-md bg-surface-light flex items-center justify-center text-xs text-gray-500">N/A</div>`
            }
            <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-100 truncate">${movie.title}</p>
                <p class="text-xs text-gray-400 truncate">${year}</p>
                ${
                    movie.vote_average
                        ? `<p class="text-xs text-accent mt-1">★ ${movie.vote_average.toFixed(1)}</p>`
                        : ""
                }
            </div>
        </div>
    `;
}

// --------------------------------------------------
// INITIALIZE TYPEAHEAD
// --------------------------------------------------
$(function () {
    const $box = $("#global-search");

    if ($box.length === 0) return;

    $box.typeahead(
        {
            hint: false,
            highlight: true,
            minLength: 2
        },
        {
            name: "movies",
            display: "title",
            source: movieSearchEngine,
            limit: 8,
            templates: {
                notFound: `
                    <div class="px-3 py-2 text-xs text-gray-500">
                        No movies found.
                    </div>
                `,
                pending: `
                    <div class="px-3 py-2 text-xs text-gray-500">
                        Searching...
                    </div>
                `,
                suggestion: suggestionTemplate
            }
        }
    );

    // When the user selects a movie from Typeahead
    $box.bind("typeahead:select", function (ev, movie) {
        if (movie && movie.id) {
            window.location.href = `movie.html?id=${movie.id}`;
        }
    });

    // pressing Enter closes menu if no selection
    $box.on("keydown", function (e) {
        if (e.key === "Enter") {
            $(this).blur();
        }
    });
});
