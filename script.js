const TMDB_KEY = "662f74df1aff6513bbf41ace11011a78";
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w342';

const searchInput = document.getElementById('searchInput');
const feed = document.getElementById('feed');
const clearBtn = document.getElementById('clearBtn');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let page = 1;
let totalPages = 1;
let currentQuery = '';

// API helper function
function api(path, params = {}) {
  if (!TMDB_KEY) return Promise.reject(new Error('Missing TMDB key. Add it to script.js'));
  const url = new URL(TMDB_BASE + path);
  url.searchParams.set('api_key', TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url.toString()).then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  });
}

// Render movies list
function renderMovies(list) {
  feed.innerHTML = '';
  list.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.className = 'poster';
    img.src = m.poster_path ? IMG_BASE + m.poster_path : '';
    img.alt = m.title;
    img.onerror = () => { img.style.display = 'none'; };

    const title = document.createElement('h4');
    title.textContent = m.title;

    card.appendChild(img);
    card.appendChild(title);
    feed.appendChild(card);
  });
}

// Show error message
function showError(msg) {
  feed.innerHTML = `<div style="padding:20px; color:#a00;">${msg}</div>`;
}

// Fetch movies (search or popular)
async function fetchMovies() {
  try {
    const q = currentQuery.trim();
    const params = { page };
    let data;

    if (q) {
      data = await api('/search/movie', { ...params, query: q });
    } else {
      data = await api('/movie/popular', params);
    }

    if (!data.results || data.results.length === 0) {
      showError('No movies found!');
      return;
    }

    renderMovies(data.results);
    totalPages = data.total_pages || 1;
    pageInfo.textContent = `Page ${page}${totalPages > 1 ? ' of ' + totalPages : ''}`;
    updateButtons();
  } catch (e) {
    showError('Could not load movies! ' + e.message);
  }
}

// Update pagination button states
function updateButtons() {
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;
}

// Event listeners
searchInput.addEventListener('input', e => {
  currentQuery = e.target.value;
  page = 1;
  fetchMovies();
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  currentQuery = '';
  page = 1;
  fetchMovies();
});

prevBtn.addEventListener('click', () => {
  if (page > 1) {
    page--;
    fetchMovies();
  }
});

nextBtn.addEventListener('click', () => {
  if (page < totalPages) {
    page++;
    fetchMovies();
  }
});

// Initial load
window.onload = () => {
  fetchMovies();
};
