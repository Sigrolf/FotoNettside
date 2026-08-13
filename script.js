// Dynamically load images from the images/astro and images/landscapes folders
const galleryGrid = document.getElementById('galleryGrid');

// List of images (add more as needed)
const images = [
  // Astro
  'images/astro/_00001.jpg',
  'images/astro/_00002.jpg',
  'images/astro/_00003.jpg',
  'images/astro/_00004.jpg',
  'images/astro/_00005.jpg',
  'images/astro/_00006.jpg',
  'images/astro/_00007.jpg',
  'images/astro/_00008.jpg',
  'images/astro/_00009.jpg',
  'images/astro/_00010.jpg',
  // Landscapes
  'images/landscapes/_1.jpg',
  'images/landscapes/_2.jpg',
  'images/landscapes/_3.jpg',
  'images/landscapes/_4.jpg',
  'images/landscapes/_5.jpg',
  'images/landscapes/_6.jpg',
  'images/landscapes/_7.jpg',
  'images/landscapes/_8.jpg',
  'images/landscapes/_9.jpg',
  'images/landscapes/_10.jpg',

];

if (galleryGrid) {
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Photography by Sigurd Rolfsnes';
    img.loading = 'lazy';
    img.addEventListener('click', () => openLightbox(src));
    galleryGrid.appendChild(img);
  });
}

// --- Modern Lightbox functionality ---
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <div class="lightbox-overlay" tabindex="-1"></div>
  <div class="lightbox-content" role="dialog" aria-modal="true">
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <div class="lightbox-img-container" style="display: flex; align-items: center; justify-content: center; position: relative;">
      <button class="lightbox-arrow lightbox-arrow-left" aria-label="Previous image" style="position: absolute; left: 0; top: 50%; transform: translateY(-50%);">&#8592;</button>
      <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
        <img src="" alt="Large view" class="lightbox-img" draggable="false">
      </div>
      <button class="lightbox-arrow lightbox-arrow-right" aria-label="Next image" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%);">&#8594;</button>
    </div>
    <div class="lightbox-title"></div>
    <button class="lightbox-details-btn" aria-expanded="false" title="Show image details" tabindex="0">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    </button>
    <div class="lightbox-details-panel" aria-hidden="true"></div>
  </div>
`;
document.body.appendChild(lightbox);
const overlay = lightbox.querySelector('.lightbox-overlay');
const content = lightbox.querySelector('.lightbox-content');
const imgEl = lightbox.querySelector('.lightbox-img');
const imgContainer = lightbox.querySelector('.lightbox-img-container');
const titleEl = lightbox.querySelector('.lightbox-title');
const closeBtn = lightbox.querySelector('.lightbox-close');
const detailsBtn = lightbox.querySelector('.lightbox-details-btn');
const detailsPanel = lightbox.querySelector('.lightbox-details-panel');
const arrowLeft = lightbox.querySelector('.lightbox-arrow-left');
const arrowRight = lightbox.querySelector('.lightbox-arrow-right');

content.setAttribute('tabindex', '-1');


// --- Lightbox arrow/details fade logic ---
const arrowButtons = [arrowLeft, arrowRight];
const detailsBtnFade = detailsBtn;
let fadeTimeout = null;
let detailsPanelOpen = false;

function showControls() {
  arrowButtons.forEach(btn => {
    btn.style.opacity = '0.85';
    btn.style.pointerEvents = 'auto';
    btn.style.transition = 'opacity 0.4s cubic-bezier(.77,0,.18,1)';
  });
  if (!detailsPanelOpen) {
    detailsBtnFade.classList.remove('fade');
  }
  if (fadeTimeout) clearTimeout(fadeTimeout);
  if (!detailsPanelOpen) {
    fadeTimeout = setTimeout(hideControls, 900);
  }
}

function hideControls() {
  arrowButtons.forEach(btn => {
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
  });
  if (!detailsPanelOpen) {
    detailsBtnFade.classList.add('fade');
  }
}

function setupControlsFade() {
  // Show controls on mousemove in lightbox
  lightbox.addEventListener('mousemove', () => {
    if (!lightbox.classList.contains('active')) return;
    showControls();
  });
  // Show controls on focus (keyboard nav)
  [...arrowButtons, detailsBtnFade].forEach(btn => {
    btn.addEventListener('focus', showControls);
  });
  // Hide controls when lightbox closes
  lightbox.addEventListener('transitionend', () => {
    if (!lightbox.classList.contains('active')) hideControls();
  });
}

setupControlsFade();

// Show controls when lightbox opens
const origOpenLightbox = openLightbox;
openLightbox = function(...args) {
  origOpenLightbox.apply(this, args);
  detailsPanelOpen = false;
  detailsBtn.classList.remove('active');
  showControls();
};

let currentIndex = 0;
let currentImages = images;
let currentImageData = {};

function resetDetailsPanelState() {
  detailsBtn.setAttribute('aria-expanded', 'false');
  detailsPanel.setAttribute('aria-hidden', 'true');
  detailsPanel.classList.remove('open');
  detailsBtn.classList.remove('active');
  detailsBtn.classList.remove('fade');
  if (imgContainer) imgContainer.classList.remove('details-open');
  detailsPanelOpen = false;
}

// Example image metadata (expand as needed)
const imageMeta = {
  'images/astro/_00001.jpg': { title: 'Andromeda Galaxy', description: 'Deep-sky view of the M31 Andromeda galaxy', date: '2024-07-01', camera: 'Fujifilm XT-30', settings: 'f/2.8, 20s, ISO 3200' },
  'images/astro/_00002.jpg': { title: 'Star Trails', description: 'Long exposure star trails.', date: '2024-06-15', camera: 'Fujifilm XT-30', settings: 'f/4, 300s, ISO 800' },
  'images/landscapes/_1.jpg': { title: 'Sunrise Valley', description: 'Golden hour in the valley.', date: '2024-05-10', camera: 'Fujifilm XT-30', settings: 'f/11, 1/60s, ISO 100' },
  // ...add more as needed
};

function getImageMeta(src) {
  return imageMeta[src] || { title: 'Untitled', description: 'No description.', date: '', camera: 'Fujifilm XT-30', settings: '' };
}

function getLightboxMeta(src) {
  if (portfolioMetaLookup.has(src)) {
    const portfolioMeta = getPortfolioImageMeta(src);
    return {
      title: portfolioMeta.title,
      description: portfolioMeta.description,
      date: '',
      camera: portfolioMeta.camera || 'Cloudinary',
      settings: ''
    };
  }

  return getImageMeta(src);
}

function openLightbox(src, imgs = images) {
  currentImages = imgs;
  currentIndex = imgs.indexOf(src);
  if (currentIndex === -1) currentIndex = 0;
  resetDetailsPanelState();
  showLightboxImage(currentIndex);
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  content.focus();
  document.body.style.overflow = 'hidden';
}

function showLightboxImage(idx) {
  const src = currentImages[idx];
  const meta = getLightboxMeta(src);
  imgEl.src = src;
  imgEl.alt = meta.title || 'Large view';
  titleEl.textContent = meta.title;
  currentImageData = meta;
  // Responsive, animated details panel markup
  detailsPanel.innerHTML = `
    <div class="lightbox-details-panel-row"><strong>Description:</strong> <span>${currentImageData.description || 'N/A'}</span></div>
  `;
  resetDetailsPanelState();
}

function closeLightbox() {
  resetDetailsPanelState();
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  imgEl.src = '';
  document.body.style.overflow = '';
}

function closeDetailsPanel() {
  if (imgContainer) imgContainer.classList.remove('details-open');
  detailsPanel.classList.remove('open');
  detailsBtn.classList.remove('active');
  detailsBtn.setAttribute('aria-expanded', 'false');
  detailsPanel.setAttribute('aria-hidden', 'true');
  detailsPanelOpen = false;
  showControls();
}

function openDetailsPanel() {
  if (imgContainer) imgContainer.classList.add('details-open');
  detailsPanel.classList.add('open');
  detailsBtn.classList.add('active');
  detailsBtn.setAttribute('aria-expanded', 'true');
  detailsPanel.setAttribute('aria-hidden', 'false');
  detailsPanelOpen = true;
  detailsBtn.classList.remove('fade');
}

function isLightboxInteractiveTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest('.lightbox-img-container')
    || target.closest('.lightbox-arrow')
    || target.closest('.lightbox-details-btn')
    || target.closest('.lightbox-details-panel')
    || target.closest('.lightbox-close')
  );
}

function isMobileLightboxViewport() {
  return window.matchMedia('(max-width: 900px)').matches;
}

closeBtn.addEventListener('click', closeLightbox);
overlay.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});


// Keyboard navigation and accessibility
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    showPrevImage();
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    showNextImage();
  }
});

// --- Swipe gesture support for Lightbox on mobile ---
let touchStartX = null;
let touchStartY = null;
let touchEndX = null;
let touchEndY = null;
let touchMoved = false;
const SWIPE_THRESHOLD = 42; // px
const SWIPE_CLOSE_THRESHOLD = 86; // px
const TAP_THRESHOLD = 10; // px

function handleTouchStart(e) {
  if (!lightbox.classList.contains('active')) return;
  if (e.touches.length !== 1) return;
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchEndX = touchStartX;
  touchEndY = touchStartY;
  touchMoved = false;
}

function handleTouchMove(e) {
  if (!lightbox.classList.contains('active')) return;
  if (e.touches.length !== 1) return;
  const touch = e.touches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
  if (touchStartX !== null && touchStartY !== null) {
    const movedX = Math.abs(touchEndX - touchStartX);
    const movedY = Math.abs(touchEndY - touchStartY);
    if (movedX > TAP_THRESHOLD || movedY > TAP_THRESHOLD) {
      touchMoved = true;
    }
  }
}

function handleTouchEnd(e) {
  if (!lightbox.classList.contains('active')) return;
  if (touchStartX === null || touchEndX === null) return;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const tapLike = !touchMoved || (absDx <= TAP_THRESHOLD && absDy <= TAP_THRESHOLD);
  const mostlyHorizontalSwipe = absDx > SWIPE_THRESHOLD && absDx > absDy * 1.15;
  const swipeDownToClose = dy > SWIPE_CLOSE_THRESHOLD && absDy > absDx * 1.2;

  if (mostlyHorizontalSwipe) {
    if (dx < 0) {
      showNextImage();
    } else {
      showPrevImage();
    }
    showControls();
  } else if (swipeDownToClose && isMobileLightboxViewport()) {
    closeLightbox();
  } else if (tapLike && isMobileLightboxViewport()) {
    const target = e.target;
    if (!isLightboxInteractiveTarget(target)) {
      closeLightbox();
    }
  }

  touchStartX = null;
  touchEndX = null;
  touchStartY = null;
  touchEndY = null;
  touchMoved = false;
}

lightbox.addEventListener('touchstart', handleTouchStart, { passive: true });
lightbox.addEventListener('touchmove', handleTouchMove, { passive: true });
lightbox.addEventListener('touchend', handleTouchEnd, { passive: true });

arrowLeft.addEventListener('click', showPrevImage);
arrowRight.addEventListener('click', showNextImage);

function showPrevImage() {
  if (currentIndex > 0) {
    currentIndex--;
    showLightboxImage(currentIndex);
  } else {
    currentIndex = currentImages.length - 1;
    showLightboxImage(currentIndex);
  }
}
function showNextImage() {
  if (currentIndex < currentImages.length - 1) {
    currentIndex++;
    showLightboxImage(currentIndex);
  } else {
    currentIndex = 0;
    showLightboxImage(currentIndex);
  }
}

// Details panel toggle
detailsBtn.addEventListener('click', () => {
  const expanded = detailsBtn.getAttribute('aria-expanded') === 'true';
  if (!expanded) {
    openDetailsPanel();
  } else {
    closeDetailsPanel();
  }
});

detailsPanel.addEventListener('click', () => {
  if (detailsPanelOpen && isMobileLightboxViewport()) {
    closeDetailsPanel();
  }
});

// Trap focus inside lightbox for accessibility
lightbox.addEventListener('keydown', function(e) {
  if (!lightbox.classList.contains('active')) return;
  const focusable = lightbox.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
});

// --- Patch gallery image click handlers to pass correct image list ---
if (galleryGrid) {
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Photography by Sigurd Rolfsnes';
    img.loading = 'lazy';
    img.addEventListener('click', () => openLightbox(src, images));
    galleryGrid.appendChild(img);
  });
}

// Patch portfolio category switching to pass correct image list
function renderPortfolio(category) {
  if (!portfolioGallery) return;
  portfolioGallery.innerHTML = '';
  const imgs = portfolioImages[category];
  imgs.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Photography by Sigurd Rolfsnes';
    img.loading = 'lazy';
    img.classList.add('portfolio-img');
    img.style.setProperty('--i', i+1);
    img.addEventListener('click', () => openLightbox(src, imgs)); // <-- Pass correct array here
    portfolioGallery.appendChild(img);
  });
}

// Patch enableGalleryLightbox to pass correct image list
function enableGalleryLightbox(selector, imgs = images) {
  const gallery = document.querySelector(selector);
  if (!gallery) return;
  const imgEls = Array.from(gallery.querySelectorAll('img'));
  imgEls.forEach((img, i) => {
    img.addEventListener('click', () => openLightbox(img.src, imgEls.map(im => im.src)));
  });
}
window.addEventListener('DOMContentLoaded', () => {
  enableGalleryLightbox('.gallery-grid', images);
  enableGalleryLightbox('.showcase-grid');
  enableGalleryLightbox('.blog-list');
});

// Smooth scroll for nav links
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// --- Portfolio Category Filtering ---
const portfolioGallery = document.getElementById('portfolioGallery');
const categoryBtns = document.querySelectorAll('.category-btn');
let portfolioItems = [];
let portfolioMetaLookup = new Map();

function parseImagesYaml(yamlText) {
  const entries = [];
  const lines = yamlText.split(/\r?\n/);
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (/^-\s+/.test(trimmed)) {
      if (current) entries.push(current);
      current = {};
      const rest = trimmed.replace(/^-\s+/, '');
      if (rest.includes(':')) {
        const [key, ...valueParts] = rest.split(':');
        const value = valueParts.join(':').trim();
        if (key === 'url' && value === '>-') {
          const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
          current.url = nextLine;
          i++;
        } else {
          current[key.trim()] = value;
        }
      }
      continue;
    }

    if (!current) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    if (key === 'url' && value === '>-') {
      const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
      current.url = nextLine;
      i++;
    } else if (value === '' || value === '""' || value === "''") {
      current[key] = '';
    } else {
      current[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }

  if (current) entries.push(current);
  return entries;
}

function normalizeCategory(category) {
  return category === 'landscape' ? 'landscapes' : category;
}

function getPortfolioItems(category) {
  const normalizedCategory = normalizeCategory(category);
  return portfolioItems
    .map((item, index) => ({ ...item, __order: index }))
    .filter(item => item.category === normalizedCategory)
    .sort((a, b) => {
      const aStars = Number(a.stars) || 1;
      const bStars = Number(b.stars) || 1;
      if (bStars !== aStars) return bStars - aStars;
      return a.__order - b.__order;
    });
}

function buildPortfolioMetaLookup(items) {
  const lookup = new Map();
  items.forEach(item => {
    if (item.url) lookup.set(item.url, item);
  });
  return lookup;
}

function getPortfolioImageMeta(src) {
  const meta = portfolioMetaLookup.get(src);
  if (meta) {
    return {
      title: meta.title || meta.public_id || 'Untitled',
      description: meta.caption || '',
      filename: meta.public_id || src,
      camera: 'Cloudinary'
    };
  }

  return {
    title: src.split('/').pop().replace(/\.[^.]+$/, ''),
    description: '',
    filename: src,
    camera: 'Cloudinary'
  };
}

function renderPortfolio(category) {
  if (!portfolioGallery) return;

  portfolioGallery.innerHTML = '';
  const normalizedCategory = normalizeCategory(category);
  const isAstroCategory = normalizedCategory === 'astro';
  const items = getPortfolioItems(category);

  if (!items.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'portfolio-empty-state';
    emptyState.textContent = 'No images available for this category yet.';
    portfolioGallery.appendChild(emptyState);
    return;
  }

  items.forEach((item, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'portfolio-img-wrapper';
    if (isAstroCategory) {
      wrapper.classList.add('portfolio-img-wrapper-astro');
    }

    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.title || 'Photography by Sigurd Rolfsnes';
    img.loading = 'lazy';
    img.classList.add('portfolio-img');
    img.style.setProperty('--i', index + 1);
    img.addEventListener('click', () => openLightbox(item.url, items.map(entry => entry.url)));

    const title = document.createElement('div');
    title.className = 'portfolio-img-title';
    title.textContent = item.title || item.public_id || 'Untitled';

    wrapper.appendChild(img);
    wrapper.appendChild(title);
    portfolioGallery.appendChild(wrapper);
  });

  window.renderPortfolio = renderPortfolio;
}

function loadPortfolioData() {
  fetch(new URL('images.yml', window.location.href))
    .then(response => {
      if (!response.ok) throw new Error('Unable to load portfolio data');
      return response.text();
    })
    .then(yamlText => {
      const parsedItems = parseImagesYaml(yamlText).filter(item => item.url);
      portfolioItems = parsedItems;
      portfolioMetaLookup = buildPortfolioMetaLookup(parsedItems);
      if (portfolioGallery && categoryBtns.length) {
        renderPortfolio('astro');
        categoryBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPortfolio(btn.dataset.category);
          });
        });
      }
    })
    .catch(err => {
      console.error(err);
      if (portfolioGallery) {
        portfolioGallery.innerHTML = '<div class="portfolio-empty-state">Unable to load portfolio images.</div>';
      }
    });
}

if (portfolioGallery && categoryBtns.length) {
  loadPortfolioData();
}

// --- Lightbox for all galleries ---
function enableGalleryLightbox(selector) {
  const gallery = document.querySelector(selector);
  if (!gallery) return;
  gallery.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src));
  });
}
window.addEventListener('DOMContentLoaded', () => {
  enableGalleryLightbox('.gallery-grid');
  enableGalleryLightbox('.showcase-grid');
  enableGalleryLightbox('.blog-list');
});

// --- Animate fade-in for images and cards ---
function animateFadeIn(selector) {
  const items = document.querySelectorAll(selector);
  items.forEach((el, i) => {
    el.style.setProperty('--i', i+1);
  });
}
window.addEventListener('DOMContentLoaded', () => {
  animateFadeIn('.gallery-grid img');
  animateFadeIn('.showcase-item');
  animateFadeIn('.blog-preview');
});


// --- Hamburger menu logic for mobile ---
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking outside (for better UX)
    document.addEventListener('click', function(e) {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && e.target !== hamburger && !hamburger.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }
});



// Portfolio image titles stored in script

// Portfolio image metadata dictionary
const portfolioImageMeta = {
  'images/astro/_00001.jpg': { title: 'Andromeda galaxy', description: 'Deep-sky view of the M31 Andromeda galaxy.', camera: 'Fujifilm XT-30' },
  'images/astro/_00002.jpg': { title: 'Star Trails', description: 'Long exposure star trails.', camera: 'Fujifilm XT-30' },
  'images/astro/_00003.jpg': { title: 'Aurora Night', description: 'Northern lights over the fjord.', camera: 'Fujifilm XT-30' },
  'images/astro/_00004.jpg': { title: 'Comet Over Lake', description: 'Comet NEOWISE above a tranquil lake.', camera: 'Fujifilm XT-30' },
  'images/astro/_00005.jpg': { title: 'Galactic Core', description: 'The core of the Milky Way in summer.', camera: 'Fujifilm XT-30' },
  'images/astro/_00006.jpg': { title: 'Desert Stars', description: 'Starry night in the desert.', camera: 'Fujifilm XT-30' },
  'images/astro/_00007.jpg': { title: 'Moonrise', description: 'Full moon rising over the mountains.', camera: 'Fujifilm XT-30' },
  'images/astro/_00008.jpg': { title: 'Nebula Glow', description: 'Emission nebula glowing in red.', camera: 'Fujifilm XT-30' },
  'images/astro/_00009.jpg': { title: 'Starlit Peaks', description: 'Mountain peaks under a starry sky.', camera: 'Fujifilm XT-30' },
  'images/astro/_00010.jpg': { title: 'Night Horizon', description: 'Stars meeting the horizon at dusk.', camera: 'Fujifilm XT-30' },
  // Landscapes auto-generated below
};

// Auto-generate landscape metadata
for (let i = 1; i <= 100; i++) {
  const filename = `images/landscapes/_${i}.jpg`;
  portfolioImageMeta[filename] = {
    title: `Landscape ${i}`,
    description: `Landscape photo number ${i}.`,
    filename: filename,
    camera: 'Fujifilm XT-30'
  };
}
// Auto-generate wildlife metadata
for (let i = 1; i <= 22; i++) {
  const filename = `images/wildlife/_${i}.jpg`;
  portfolioImageMeta[filename] = {
    title: `Wildlife ${i}`,
    description: `Wildlife photo number ${i}.`,
    filename: filename,
    camera: 'Fujifilm XT-30'
  };
}

function getPortfolioImgMeta(src) {
  // src may be absolute, so match on the end
  for (const key in portfolioImageMeta) {
    if (src.endsWith(key)) return portfolioImageMeta[key];
  }
  // Fallback: prettify filename
  let fileName = src.split('/').pop().replace(/\.[^.]+$/, '');
  let title = fileName.replace(/^_+/, '').replace(/_/g, ' ');
  return { title: title.replace(/\b\w/g, c => c.toUpperCase()), description: '', filename: src, camera: 'Fujifilm XT-30' };
}

// Enhance portfolio images: wrap in .portfolio-img-wrapper and use title from script
function enhancePortfolioImages() {
  const gallery = document.getElementById('portfolioGallery');
  if (!gallery) return;
  Array.from(gallery.querySelectorAll('img')).forEach(img => {
    // Skip if already wrapped
    if (img.parentElement && img.parentElement.classList.contains('portfolio-img-wrapper')) return;
    // Get metadata from script
    const meta = getPortfolioImgMeta(img.src || img.getAttribute('src'));
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'portfolio-img-wrapper';
    img.classList.add('portfolio-img');
    // Insert
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
  });
}

// Enhance after rendering portfolio
if (portfolioGallery && categoryBtns.length) {
  // Render and enhance images, then set up click handlers for lightbox
  function renderAndEnhance(category) {
    renderPortfolio(category);
    setTimeout(() => {
      enhancePortfolioImages();
      // Set up correct click handlers for lightbox
      Array.from(portfolioGallery.querySelectorAll('img')).forEach(img => {
        img.onclick = () => {
          const imgs = Array.from(portfolioGallery.querySelectorAll('img')).map(im => im.src);
          openLightbox(img.src, imgs);
        };
      });
    }, 0);
  }
  // Ensure correct handlers on first load
  window.addEventListener('DOMContentLoaded', () => {
    renderAndEnhance('astro');
    // Set active class on default category button
    categoryBtns.forEach(b => b.classList.remove('active'));
    const defaultBtn = Array.from(categoryBtns).find(btn => btn.dataset.category === 'astro');
    if (defaultBtn) defaultBtn.classList.add('active');
    // Set up category switching
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAndEnhance(btn.dataset.category);
      });
    });
  });
}
