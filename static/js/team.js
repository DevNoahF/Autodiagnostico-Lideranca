document.addEventListener('DOMContentLoaded', initThemeToggle);

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
