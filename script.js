const topbar = document.querySelector('#topbar');
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.menu-toggle');
function updateBar(){topbar.classList.toggle('scrolled', window.scrollY > 40)}
window.addEventListener('scroll', updateBar); updateBar();
toggle?.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const observer = new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
