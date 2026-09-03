function initializeTeamPage() {
  initThemeToggle();
  initTeamCarousel();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTeamPage);
} else {
  initializeTeamPage();
}

function initTeamCarousel() {
  const carousel = document.querySelector('.team-carousel');
  const track = carousel?.querySelector('.team-grid');
  const previousButton = carousel?.querySelector('.carousel-control-prev');
  const nextButton = carousel?.querySelector('.carousel-control-next');
  if (!carousel || !track || !previousButton || !nextButton) return;

  const slides = Array.from(track.children);
  if (slides.length < 2) return;

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.setAttribute('aria-hidden', 'true');
  lastClone.setAttribute('aria-hidden', 'true');
  track.append(firstClone);
  track.prepend(lastClone);

  let currentIndex = 1;
  let autoplayId;

  function moveToSlide(index, animate = true) {
    track.style.transition = animate ? 'transform 0.55s ease' : 'none';
    track.style.transform = `translateX(-${index * 100}%)`;
    currentIndex = index;
  }

  function showNext() {
    moveToSlide(currentIndex + 1);
  }

  function showPrevious() {
    moveToSlide(currentIndex - 1);
  }

  function startAutoplay() {
    clearInterval(autoplayId);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      autoplayId = setInterval(showNext, 6000);
    }
  }

  function pauseAutoplay() {
    clearInterval(autoplayId);
  }

  track.addEventListener('transitionend', () => {
    if (currentIndex === 0) moveToSlide(slides.length, false);
    if (currentIndex === slides.length + 1) moveToSlide(1, false);
  });

  nextButton.addEventListener('click', () => {
    showNext();
    startAutoplay();
  });
  previousButton.addEventListener('click', () => {
    showPrevious();
    startAutoplay();
  });

  carousel.addEventListener('mouseenter', pauseAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', pauseAutoplay);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoplay();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAutoplay();
    else startAutoplay();
  });

  moveToSlide(currentIndex, false);
  startAutoplay();
}

function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  function updateBtnUI(theme) {
    toggleBtn.innerHTML = theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    toggleBtn.setAttribute('title', theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro');
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateBtnUI(currentTheme);

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentScrollY = window.scrollY || window.pageYOffset;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateBtnUI(nextTheme);

    window.scrollTo({ top: currentScrollY, behavior: 'instant' });
  });
}
