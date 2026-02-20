const tabs = [...document.querySelectorAll('.tab-button')];
const panels = [...document.querySelectorAll('.panel')];
let publicationsData = [];
let publicationsAnimationToken = 0;

const activateSection = (targetId) => {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.target === targetId));
  panels.forEach((panel) => panel.classList.toggle('active', panel.id === targetId));
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateSection(tab.dataset.target));
});

const normalizeText = (value, fallback = '') => {
  if (value == null) {
    return fallback;
  }

  const text = String(value).trim();
  return text || fallback;
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatInfoDetail = (value) =>
  escapeHtml(normalizeText(value, 'No description yet.'))
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
    .replace(/\r?\n/g, '<br>');

const highlightJaeminKim = (authors) => {
  const safeAuthors = escapeHtml(normalizeText(authors, 'Unknown authors'));
  return safeAuthors.replace(/\bJaemin Kim\b/g, '<strong class="author-highlight">Jaemin Kim</strong>');
};

const getAuthorBadge = (firstValue) => {
  const value = typeof firstValue === 'string' ? firstValue.toLowerCase().trim() : firstValue;
  if (value === 'first') {
    return '<span class="first-author-tag">First Author</span>';
  }
  if (value === 'co') {
    return '<span class="first-author-tag">Co-First Author</span>';
  }
  return '';
};

const isFirstOrCoAuthor = (firstValue) => {
  const value = typeof firstValue === 'string' ? firstValue.toLowerCase().trim() : firstValue;
  return value === 'first' || value === 'co';
};

const isFirstAuthorOnlyEnabled = () => {
  const checkbox = document.getElementById('first-author-only-toggle');
  return checkbox?.checked === true;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const animatePublicationsIn = (container) => {
  const items = [...container.querySelectorAll('.publication-item')];
  items.forEach((item, index) => {
    item.style.animation = `publicationFadeIn 260ms ease ${index * 40}ms both`;
  });
};

const animatePublicationsOut = async (container) => {
  const items = [...container.querySelectorAll('.publication-item')];
  if (items.length === 0) {
    return;
  }

  items.forEach((item, index) => {
    item.style.animation = `publicationFadeOut 180ms ease ${index * 22}ms both`;
  });
  await wait(180 + (items.length - 1) * 22);
};

const animateContainerHeightChange = async (container, updateContent) => {
  const startHeight = container.offsetHeight;
  container.style.transition = '';
  container.style.height = `${startHeight}px`;
  container.style.overflow = 'hidden';

  updateContent();

  // Measure the natural height of the updated content.
  container.style.height = 'auto';
  const endHeight = container.offsetHeight;
  container.style.height = `${startHeight}px`;

  if (startHeight === endHeight) {
    container.style.height = '';
    container.style.overflow = '';
    return;
  }

  container.style.transition = 'height 260ms ease';
  container.getBoundingClientRect();
  container.style.height = `${endHeight}px`;
  await wait(260);
  container.style.transition = '';
  container.style.height = '';
  container.style.overflow = '';
};

const extractYearValue = (yearText) => {
  const text = normalizeText(yearText, '');
  const matches = text.match(/\d{4}/g);
  if (!matches || matches.length === 0) {
    return Number.NEGATIVE_INFINITY;
  }

  return Math.max(...matches.map((year) => Number(year)));
};

const renderInformation = (data) => {
  const container = document.getElementById('information-container');

  const groups = [
    ['Affiliations & Experience', data.affiliationsAndExperience],
    ['Education', data.education],
    ['Teaching', data.teaching],
    ['Recognition', data.awards],
  ];

  container.innerHTML = groups
    .map(([title, items]) => {
      const validItems = (items || []).filter(
        (item) =>
          normalizeText(item?.year ?? item?.period) ||
          normalizeText(item?.description ?? item?.detail) ||
          normalizeText(item?.note)
      );

      const list = validItems
        .map((item) => {
          const year = escapeHtml(normalizeText(item.year ?? item.period, 'N/A'));
          const description = formatInfoDetail(item.description ?? item.detail);
          const note = normalizeText(item.note, '');
          const noteHtml = note ? `<span class="info-note">${formatInfoDetail(note)}</span>` : '';

          return `
            <li class="info-item">
              <span class="info-year">${year}</span>
              <span class="info-detail">${description}</span>
              ${noteHtml}
            </li>
          `;
        })
        .join('');

      return `
        <section class="info-group">
          <h3>${title}</h3>
          <ul class="info-list">${list || '<li class="info-item info-item-empty">No entries yet.</li>'}</ul>
        </section>
      `;
    })
    .join('');
};

const renderPublications = (data, options = {}) => {
  const { animateIn = false } = options;
  const container = document.getElementById('publications-container');
  if (!container) {
    return;
  }

  const publications = Array.isArray(data) ? data : data?.publications;
  const validPublications = (publications || []).filter(
    (item) =>
      item?.visible === true &&
      (normalizeText(item?.year) ||
        normalizeText(item?.title) ||
        normalizeText(item?.authors) ||
        normalizeText(item?.proceedings))
  );
  const filteredPublications = isFirstAuthorOnlyEnabled()
    ? validPublications.filter((item) => isFirstOrCoAuthor(item.first))
    : validPublications;
  const sortedPublications = [...filteredPublications].sort((a, b) => {
    const yearDiff = extractYearValue(b.year) - extractYearValue(a.year);
    if (yearDiff !== 0) {
      return yearDiff;
    }

    return normalizeText(a.title).localeCompare(normalizeText(b.title));
  });

  if (sortedPublications.length === 0) {
    container.innerHTML = isFirstAuthorOnlyEnabled()
      ? '<p class="muted">No first-author or co-first-author publications yet.</p>'
      : '<p class="muted">No publications yet.</p>';
    return;
  }

  container.innerHTML = `
    <ol class="publication-list">
      ${sortedPublications
        .map((item) => {
          const year = escapeHtml(normalizeText(item.year, 'N/A'));
          const title = escapeHtml(normalizeText(item.title, 'Untitled publication'));
          const firstAuthorTag = getAuthorBadge(item.first);
          const authors = highlightJaeminKim(item.authors);
          const proceedings = escapeHtml(normalizeText(item.proceedings, 'Proceedings not provided'));

          return `
            <li class="publication-item">
              <p class="publication-year">${year}</p>
              <h3 class="publication-title">${title}${firstAuthorTag}</h3>
              <p class="publication-authors">${authors}</p>
              <p class="publication-proceedings">${proceedings}</p>
            </li>
          `;
        })
        .join('')}
    </ol>
  `;

  if (animateIn) {
    animatePublicationsIn(container);
  }
};

const loadInformation = async () => {
  const container = document.getElementById('information-container');

  try {
    const response = await fetch('./information.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load information (${response.status})`);
    }

    const data = await response.json();
    renderInformation(data);
  } catch (error) {
    container.innerHTML = `<p>Could not load information data. ${error.message}</p>`;
  }
};

const loadPublications = async () => {
  const container = document.getElementById('publications-container');
  if (!container) {
    return;
  }

  try {
    const response = await fetch('./publications.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load publications (${response.status})`);
    }

    const data = await response.json();
    publicationsData = data;
    renderPublications(publicationsData);
  } catch (error) {
    container.innerHTML = `<p>Could not load publications data. ${error.message}</p>`;
  }
};

const initPublicationsFilter = () => {
  const checkbox = document.getElementById('first-author-only-toggle');
  if (!checkbox) {
    return;
  }

  checkbox.addEventListener('change', async () => {
    const animationToken = ++publicationsAnimationToken;
    const container = document.getElementById('publications-container');
    if (!container) {
      renderPublications(publicationsData, { animateIn: true });
      return;
    }

    await animatePublicationsOut(container);
    if (animationToken !== publicationsAnimationToken) {
      return;
    }

    await animateContainerHeightChange(container, () => {
      renderPublications(publicationsData, { animateIn: true });
    });
  });
};

loadInformation();
initPublicationsFilter();
loadPublications();
