const site = window.LN_SITE || {};
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

function setScrollProgress(){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? (window.scrollY / max) * 100 : 0;
  document.documentElement.style.setProperty('--scroll', value.toFixed(2));
}
window.addEventListener('scroll', setScrollProgress, { passive:true });
setScrollProgress();

const navToggle = $('#navToggle');
const navToggleMobile = $('#navToggleMobile');
function setNav(open){
  document.body.classList.toggle('nav-open', open);
  navToggle?.setAttribute('aria-expanded', String(open));
  navToggleMobile?.setAttribute('aria-expanded', String(open));
}
function toggleNav(){ setNav(!document.body.classList.contains('nav-open')); }
navToggle?.addEventListener('click', toggleNav);
navToggleMobile?.addEventListener('click', toggleNav);
$$('a[href^="#"]').forEach(link => link.addEventListener('click', () => setNav(false)));

document.addEventListener('click', e => {
  if(document.body.classList.contains('nav-open') && !e.target.closest('.rail') && !e.target.closest('.topbar__menu')) setNav(false);
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold:.12, rootMargin:'0px 0px -6% 0px' });
$$('.reveal').forEach(el => observer.observe(el));

const poster = $('#heroPoster');
if(site.hero?.poster) poster.src = site.hero.poster;
const video = $('#heroVideo');
if(video && site.hero?.video){
  video.src = site.hero.video;
  video.poster = site.hero.poster || '';
  video.addEventListener('canplay', () => {
    $('.hero__media')?.classList.add('video-ready');
    video.play().catch(() => {});
  }, { once:true });
  video.addEventListener('error', () => $('.hero__media')?.classList.remove('video-ready'));
} else {
  video?.remove();
}

function renderProjects(){
  const grid = $('#projectsGrid');
  if(!grid) return;
  grid.innerHTML = (site.projects || []).map(project => `
    <button class="project-card reveal" data-project="${project.slug}" aria-label="Otwórz realizację ${project.title}">
      <img src="${project.cover}" alt="${project.title}" loading="lazy">
      <span class="project-card__open">Otwórz galerię</span>
      <span class="project-card__content">
        <h3>${project.title}</h3>
        <p><span style="text-transform:none;">${project.area}</span> · ${project.location} · ${project.year}</p>
      </span>
    </button>
  `).join('');
  $$('.project-card').forEach(card => {
    observer.observe(card);
    card.addEventListener('click', () => openProject(card.dataset.project));
  });
}

function renderServices(){
  const wrap = $('#servicesGrid');
  if(!wrap) return;
  const previewImages = [
    'assets/NOWE ASSETY/KONSULTACJE.webp',
    'assets/NOWE ASSETY/INWENTARYZACJA k.webp',
    'assets/NOWE ASSETY/PROJEKT.webp',
    'assets/NOWE ASSETY/NADZÓR.webp',
    'assets/NOWE ASSETY/HOME STAGING.webp'
  ];
  wrap.innerHTML = (site.services || []).map((item, index) => `
    <article class="service-row reveal" tabindex="0" aria-expanded="false">
      <div class="service-row__mark"><span>Usługa</span><b>${item[0]}</b></div>
      <div>
        <h3>${item[1]}</h3>
        <p>${item[2]}</p>
      </div>
      <aside class="service-row__preview" aria-hidden="true">
        <button class="service-row__previewClose" type="button" aria-label="Zamknij podgląd usługi">×</button>
        <img src="${previewImages[index % previewImages.length]}" alt="" loading="lazy">
        <div class="service-row__previewCopy">
          <span>Usługa ${item[0]}</span>
          <strong>${item[1]}</strong>
          <p>${item[2]}</p>
        </div>
      </aside>
    </article>
  `).join('');
  const rows = $$('.service-row', wrap);
  let activePreview = null;
  let activePreviewParent = null;
  let activePreviewNextSibling = null;
  const root = document.documentElement;

  const restoreActivePreview = () => {
    if(activePreview && activePreviewParent){
      activePreviewParent.insertBefore(activePreview, activePreviewNextSibling);
      activePreview.classList.remove('is-floating');
    }
    activePreview = null;
    activePreviewParent = null;
    activePreviewNextSibling = null;
    root.style.removeProperty('--scrollbar-compensation');
  };

  const closePreviews = () => {
    rows.forEach(row => {
      row.classList.remove('is-preview-open');
      row.setAttribute('aria-expanded', 'false');
      row.querySelector('.service-row__preview')?.setAttribute('aria-hidden', 'true');
    });
    activePreview?.setAttribute('aria-hidden', 'true');
    restoreActivePreview();
    document.body.classList.remove('service-preview-open');
  };
  const openPreview = row => {
    if(!window.matchMedia('(max-width:1180px)').matches) return;
    const willOpen = !row.classList.contains('is-preview-open');
    closePreviews();
    if(!willOpen) return;
    row.classList.add('is-preview-open');
    row.setAttribute('aria-expanded', 'true');
    const preview = row.querySelector('.service-row__preview');
    preview?.setAttribute('aria-hidden', 'false');
    if(preview){
      activePreview = preview;
      activePreviewParent = preview.parentElement;
      activePreviewNextSibling = preview.nextSibling;
      preview.classList.add('is-floating');
      document.body.appendChild(preview);
      const scrollbarCompensation = Math.max(0, window.innerWidth - root.clientWidth);
      root.style.setProperty('--scrollbar-compensation', `${scrollbarCompensation}px`);
    }
    document.body.classList.add('service-preview-open');
  };
  rows.forEach(row => {
    observer.observe(row);
    row.addEventListener('click', event => {
      if(event.target.closest('.service-row__previewClose')) return;
      openPreview(row);
    });
    row.addEventListener('keydown', event => {
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        openPreview(row);
      }
    });
    row.querySelector('.service-row__previewClose')?.addEventListener('click', event => {
      event.stopPropagation();
      closePreviews();
    });
  });
  document.addEventListener('click', event => {
    if(
      document.body.classList.contains('service-preview-open') &&
      !event.target.closest('.service-row') &&
      !event.target.closest('.service-row__preview')
    ) closePreviews();
  });
}

function renderAbout(){
  const about = $('#aboutBody');
  if(!about) return;
  about.innerHTML = (site.about || []).map(p => `<p>${p}</p>`).join('');
}

let currentProject = null;
let currentIndex = 0;
function openProject(slug){
  const project = (site.projects || []).find(p => p.slug === slug);
  if(!project) return;
  currentProject = project;
  currentIndex = 0;
  $('#modalTitle').textContent = project.title;
  $('#modalMeta').innerHTML = `<span style="text-transform:none;">${project.area}</span> · ${project.location} · ${project.year}`;
  $('#modalDesc').textContent = project.description || '';
  const thumbs = $('#galleryThumbs');
  thumbs.innerHTML = project.images.map((src, i) => `
    <button type="button" data-index="${i}" aria-label="Pokaż zdjęcie ${i + 1}"><img src="${src}" alt="Miniatura ${i + 1}"></button>
  `).join('');
  $$('#galleryThumbs button').forEach(btn => btn.addEventListener('click', () => showImage(Number(btn.dataset.index))));
  $('#projectModal').classList.add('is-open');
  $('#projectModal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  showImage(0);
}
function showImage(index){
  if(!currentProject) return;
  const images = currentProject.images || [];
  if(!images.length) return;
  const nextIndex = (index + images.length) % images.length;
  const direction = nextIndex >= currentIndex ? 'next' : 'prev';
  const img = $('#galleryImage');
  if(!img.src || img.src.endsWith('/')){
    currentIndex = nextIndex;
    img.src = images[currentIndex];
  } else {
    img.classList.remove('is-animating-next','is-animating-prev');
    void img.offsetWidth;
    img.classList.add(direction === 'next' ? 'is-animating-next' : 'is-animating-prev');
    setTimeout(() => {
      currentIndex = nextIndex;
      img.src = images[currentIndex];
    }, 110);
    setTimeout(() => {
      img.classList.remove('is-animating-next','is-animating-prev');
    }, 420);
  }
  $$('#galleryThumbs button').forEach((btn, i) => btn.classList.toggle('is-active', i === nextIndex));
}
function closeProject(){
  $('#projectModal').classList.remove('is-open');
  $('#projectModal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
$('#galleryPrev')?.addEventListener('click', () => showImage(currentIndex - 1));
$('#galleryNext')?.addEventListener('click', () => showImage(currentIndex + 1));
$$('[data-close]').forEach(el => el.addEventListener('click', closeProject));
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeProject();
  if($('#projectModal')?.classList.contains('is-open') && e.key === 'ArrowRight') showImage(currentIndex + 1);
  if($('#projectModal')?.classList.contains('is-open') && e.key === 'ArrowLeft') showImage(currentIndex - 1);
});

$('#contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  const body = Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n');
  const mail = site.contactEmail || 'kontakt@lnwnetrza.pl';
  const subject = encodeURIComponent('Zapytanie o projekt wnętrza');
  window.location.href = `mailto:${mail}?subject=${subject}&body=${encodeURIComponent(body)}`;
  $('#formNote').textContent = 'Otwieram wiadomość e-mail. Formularz statyczny można później podłączyć do hostingu lub CRM.';
});

renderProjects();
renderServices();
renderAbout();

// Karuzela realizacji na stronie głównej. Galeria po kliknięciu pozostaje bez zmian.
const projectsGrid = document.querySelector('#projectsGrid');
const projectsNext = document.querySelector('#projectsNext');
const projectsPrev = document.querySelector('#projectsPrev');
function projectStep(){
  const card = projectsGrid?.querySelector('.project-card');
  return card ? card.getBoundingClientRect().width + 1 : (projectsGrid?.clientWidth || 0) * .9;
}
function updateProjectArrows(){
  if(!projectsGrid || !projectsPrev || !projectsNext) return;
  const atStart = projectsGrid.scrollLeft <= 12;
  const atEnd = projectsGrid.scrollLeft + projectsGrid.clientWidth >= projectsGrid.scrollWidth - 12;
  projectsPrev.classList.toggle('is-visible', !atStart);
  projectsNext.style.opacity = atEnd ? '.42' : '1';
}
projectsNext?.addEventListener('click', () => {
  if(!projectsGrid) return;
  const nearEnd = projectsGrid.scrollLeft + projectsGrid.clientWidth >= projectsGrid.scrollWidth - 12;
  projectsGrid.scrollTo({ left: nearEnd ? projectsGrid.scrollWidth : projectsGrid.scrollLeft + projectStep(), behavior: 'smooth' });
});
projectsPrev?.addEventListener('click', () => {
  if(!projectsGrid) return;
  projectsGrid.scrollTo({ left: Math.max(0, projectsGrid.scrollLeft - projectStep()), behavior: 'smooth' });
});
projectsGrid?.addEventListener('scroll', updateProjectArrows, { passive:true });
window.addEventListener('resize', updateProjectArrows);
setTimeout(updateProjectArrows, 120);
