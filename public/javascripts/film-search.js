// public/javascripts/film-search.js
(function () {
  function bindAutocomplete(opts) {
    const input = document.getElementById(opts.inputId);
    const list  = document.getElementById(opts.listId);
    const hiddenId = opts.hiddenId ? document.getElementById(opts.hiddenId) : null;
    const storeSel = opts.storeSelectId ? document.getElementById(opts.storeSelectId) : null;
    if (!input || !list) return;

    let timer, lastQ = '';

    function show(items) {
      list.innerHTML = '';
      if (!items || !items.length) { list.style.display = 'none'; return; }
      items.forEach(it => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        li.textContent = `${it.title} (#${it.film_id})`;
        if (it.available !== null && it.available !== undefined) {
          const b = document.createElement('span');
          b.className = 'badge rounded-pill ' + (Number(it.available) > 0 ? 'text-bg-success' : 'text-bg-secondary');
          b.textContent = Number(it.available) > 0 ? `${it.available} beschikbaar` : 'geen voorraad';
          li.appendChild(b);
        }
        li.addEventListener('click', (e) => {
          e.preventDefault();
          input.value = it.title;
          if (hiddenId) hiddenId.value = it.film_id;   // voor /rentals/create
          list.style.display = 'none';
          if (typeof opts.onPick === 'function') opts.onPick(it);
        });
        list.appendChild(li);
      });
      list.style.display = 'block';
    }

    async function search(q) {
      try {
        const store = storeSel ? (storeSel.value || '') : '';
        const url = '/api/films/search?q=' + encodeURIComponent(q) + (store ? '&storeId=' + encodeURIComponent(store) : '');
        const res = await fetch(url);
        const data = await res.json();
        show(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        show([]);
      }
    }

    input.addEventListener('input', function () {
      const q = this.value.trim();
      if (hiddenId) hiddenId.value = '';
      if (q.length < 2) { list.style.display = 'none'; return; }
      lastQ = q;
      clearTimeout(timer);
      timer = setTimeout(() => { if (q === lastQ) search(q); }, 200);
    });

    if (storeSel) {
      storeSel.addEventListener('change', () => {
        if (input.value.trim().length >= 2) search(input.value.trim());
      });
    }

    document.addEventListener('click', (e) => {
      if (!list.contains(e.target) && e.target !== input) list.style.display = 'none';
    });
  }

  // Expose in global scope
  window.FilmSearch = { bindAutocomplete };
})();
