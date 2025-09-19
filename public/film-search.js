(function () {
  const input = document.getElementById('film_title');
  const hiddenId = document.getElementById('film_id_hidden');
  const dropdown = document.getElementById('film_results');

  if (!input || !hiddenId || !dropdown) return;

  let lastQuery = '';
  let timer;

  function debounce(fn, ms) {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  }

  function clearResults() {
    dropdown.innerHTML = '';
    dropdown.classList.remove('show');
  }

  function renderResults(items) {
    clearResults();
    if (!items.length) return;

    items.forEach(it => {
      const a = document.createElement('a');
      a.className = 'dropdown-item';
      a.href = '#';
      a.textContent = `${it.title} (#${it.film_id})`;
      a.dataset.filmId = it.film_id;
      a.dataset.filmTitle = it.title;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        input.value = a.dataset.filmTitle;
        hiddenId.value = a.dataset.filmId;
        clearResults();
      });
      dropdown.appendChild(a);
    });

    dropdown.classList.add('show');
  }

  async function search(q) {
    try {
      const res = await fetch(`/api/films/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      renderResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      clearResults();
    }
  }

  input.addEventListener('input', () => {
    const q = input.value.trim();
    hiddenId.value = ''; // reset id als de tekst verandert
    if (q.length < 2) { clearResults(); return; }

    lastQuery = q;
    debounce(() => {
      if (q === lastQuery) search(q);
    }, 200);
  });

  // Klik buiten dropdown = sluiten
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== input) clearResults();
  });
})();
