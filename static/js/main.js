let appData;
const HISTORY_KEY = 'autodiagnostico-lideranca-history';

document.addEventListener('DOMContentLoaded', () => {
  renderTeamMembers();
  initTabNavigation();
  initThemeToggle();
  initTeamCarousel();
  loadApplicationData();
});

/* --------------------------------------------------------------------------
   Navegação SPA por Abas Dinâmicas
   -------------------------------------------------------------------------- */
function getTabFromPath(path) {
  const cleanPath = path.toLowerCase().replace(/\/$/, '');
  if (cleanPath.includes('equipe')) return 'equipe';
  if (cleanPath.includes('instrumento')) return 'instrumento';
  return 'inicio';
}

function getPathFromTab(tabId) {
  switch (tabId) {
    case 'equipe': return '/equipe';
    case 'instrumento': return '/instrumento-de-autodiagnostico';
    case 'inicio':
    default: return '/inicio';
  }
}

function getTabTitle(tabId) {
  switch (tabId) {
    case 'equipe': return 'Equipe | Liderança e Gestão do Conhecimento';
    case 'instrumento': return (appData && appData.intro && appData.intro.titulo)
      ? appData.intro.titulo
      : 'Instrumento de Autodiagnóstico | Liderança e Gestão do Conhecimento';
    case 'inicio':
    default: return 'Inicio | Liderança e Gestão do Conhecimento';
  }
}

function switchTab(tabId, updateHistory = true) {
  const validTabs = ['inicio', 'equipe', 'instrumento'];
  const targetTab = validTabs.includes(tabId) ? tabId : 'inicio';

  // Ocultar todas as abas e exibir a selecionada
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.add('hidden');
  });

  const activeSection = document.getElementById(`tab-${targetTab}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  }

  // Atualizar indicador ativo na navegação do menu superior
  document.querySelectorAll('.page-nav a').forEach(link => {
    const linkTab = link.getAttribute('data-tab');
    if (linkTab === targetTab) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  // Atualizar o título do documento
  document.title = getTabTitle(targetTab);

  // Atualizar o histórico da URL sem recarregar a página
  if (updateHistory) {
    const targetPath = getPathFromTab(targetTab);
    if (window.location.pathname !== targetPath) {
      history.pushState({ tab: targetTab }, '', targetPath);
    }
  }

  // Ações específicas de renderização por aba
  if (targetTab === 'equipe' && typeof window.resetTeamCarousel === 'function') {
    window.resetTeamCarousel();
  }

  if (targetTab === 'instrumento' && lastResultsData) {
    drawRadar(lastResultsData, 'radarChart');
    drawRadar(lastResultsData, 'printRadarChart');
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function initTabNavigation() {
  // Listener para capturar cliques nos links da topbar e botões com data-tab
  document.addEventListener('click', (event) => {
    const targetEl = event.target.closest('[data-tab]');
    if (targetEl) {
      event.preventDefault();
      const tabId = targetEl.getAttribute('data-tab');
      switchTab(tabId, true);
    }
  });

  // Listener para navegação por histórico do navegador (Voltar / Avançar)
  window.addEventListener('popstate', (event) => {
    const tabId = (event.state && event.state.tab)
      ? event.state.tab
      : getTabFromPath(window.location.pathname);
    switchTab(tabId, false);
  });

  // Determinar aba inicial ao carregar a página com base na URL
  const initialTab = getTabFromPath(window.location.pathname);
  switchTab(initialTab, false);
}

/* --------------------------------------------------------------------------
   Carregamento de Dados da Aplicação
   -------------------------------------------------------------------------- */
async function loadApplicationData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Erro ao carregar dados');
    appData = await response.json();

    const currentTab = getTabFromPath(window.location.pathname);
    document.title = getTabTitle(currentTab);

    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) pageTitleEl.textContent = appData.intro.titulo;

    renderIntro();
    renderDimensions();

    const surveyForm = document.getElementById('surveyForm');
    if (surveyForm) surveyForm.addEventListener('submit', showResults);

    const restartBtn = document.getElementById('restartButton');
    if (restartBtn) restartBtn.addEventListener('click', restartAssessment);

    const pdfBtn = document.getElementById('pdfButton');
    if (pdfBtn) pdfBtn.addEventListener('click', exportPdf);

    const historyBtn = document.getElementById('historyButton');
    if (historyBtn) historyBtn.addEventListener('click', toggleHistory);

    const clearHistoryBtn = document.getElementById('clearHistoryButton');
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);

    renderHistory();
    autoGenerateAssessment();
  } catch (error) {
    console.error(error);
    showError('Erro ao carregar a aplicação');
  }
}

function renderIntro() {
  if (!appData || !appData.intro) return;
  const intro = appData.intro;
  const presEl = document.getElementById('presentationSection');
  if (presEl) {
    presEl.innerHTML = `<p>${escapeHtml(intro.origem)}</p><p>${escapeHtml(intro.baseEmpirica)}</p><p>${escapeHtml(intro.publicoAlvo)}</p><p>${escapeHtml(intro.comoUsar)}</p><div class="notice"><strong>Natureza do instrumento</strong><p>${escapeHtml(intro.naturezaDoInstrumento)}</p></div>`;
  }
}

function renderDimensions() {
  if (!appData || !appData.intro || !appData.dimensions) return;
  const scale = appData.intro.escala;
  const legend = `<div class="scale-legend"><strong>Escala de resposta</strong>${scale.map(item => `<span>${item.valor} = ${escapeHtml(item.label)}</span>`).join('')}</div>`;
  const dimensions = appData.dimensions.map(dimension => `<section class="card dimension-block"><div class="dimension-header"><div><h2>${escapeHtml(cleanDimensionName(dimension.name))}</h2></div><span class="score-badge">5 afirmações</span></div>${dimension.items.map(item => `<fieldset class="question-item"><legend><strong>${item.n}.</strong> ${escapeHtml(item.statement)}</legend><div class="options">${scale.map(option => `<label><input type="radio" name="${dimension.id}-${item.n}" value="${option.valor}" required><span>${option.valor}</span><small>${escapeHtml(option.label)}</small></label>`).join('')}</div></fieldset>`).join('')}</section>`).join('');
  const dimContainer = document.getElementById('dimensionsContainer');
  if (dimContainer) dimContainer.innerHTML = legend + dimensions;

  const surveyForm = document.getElementById('surveyForm');
  if (surveyForm) surveyForm.addEventListener('change', updateSubmitState);
}

function updateSubmitState() {
  const answered = document.querySelectorAll('#dimensionsContainer input:checked').length;
  const totalQuestions = document.querySelectorAll('#dimensionsContainer input[type="radio"]')
    .length / (appData?.intro?.escala?.length || 5);
  const percentage = totalQuestions ? answered / totalQuestions * 100 : 0;

  const submitBtn = document.getElementById('submitButton');
  if (submitBtn) submitBtn.disabled = answered !== totalQuestions;

  const progressLabel = document.getElementById('progressLabel');
  if (progressLabel) progressLabel.textContent = `${answered} de ${totalQuestions} respondidas`;

  const progressBar = document.getElementById('progressBar');
  if (progressBar) progressBar.style.width = `${percentage}%`;
}

function autoGenerateAssessment() {
  const parameters = new URLSearchParams(window.location.search);
  const shouldGenerate = parameters.get('demo') === '1' || parameters.get('gerar') === '1';
  if (!shouldGenerate) return;

  document.querySelectorAll('#dimensionsContainer input[type="radio"]').forEach(input => {
    if (input.value === '3') input.checked = true;
  });
  updateSubmitState();
  showResults({ preventDefault() {} });

  if (parameters.get('print') === '1' || parameters.get('pdf') === '1') {
    setTimeout(() => window.print(), 400);
  }
}

let lastResultsData = null;

/* --------------------------------------------------------------------------
   Alternância de Tema (Modo Escuro / Claro)
   -------------------------------------------------------------------------- */
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

    if (lastResultsData) {
      drawRadar(lastResultsData, 'radarChart');
      drawRadar(lastResultsData, 'printRadarChart');
    }

    window.scrollTo({ top: currentScrollY, behavior: 'instant' });
  });
}

/* --------------------------------------------------------------------------
   Dados e Renderização Dinâmica da Equipe
   -------------------------------------------------------------------------- */
const TEAM_DATA = [
  {
    name: 'Ana Livia Cazane',
    role: 'Coordenadora - Responsavel pelo Projeto',
    photo: '/images/profiles/anaPhoto.png',
    photoPos: 'center 25%',
    bio: 'Doutora em Ciência da Informação pela Universidade Estadual Paulista (UNESP), Faculdade de Filosofia e Ciências, Mestra em Engenharia da Produção pela Universidade Estadual Paulista (UNESP), Faculdade de Engenharia. Graduada em Administração de Empresas pela Universidade Estadual Paulista (UNESP), Faculdade de Ciências e Engenharia. Docente e pesquisadora na Universidade de Marília (UNIMAR) no mestrado profissional do programa de pós-graduação em administração de organizações inovadoras (PPGA).',
    social: {
      lattes: 'http://lattes.cnpq.br/7750372576439292',
      orcid: 'https://orcid.org/0000-0003-0707-2384',
      linkedin: 'https://www.linkedin.com/in/acazane/',
      scholar: 'https://scholar.google.com.br/citations?user=G4KV7sYAAAAJ&hl=pt-BR&oi=ao',
      email: 'analiviacazane@gmail.com'
    }
  },
  {
    name: 'Rafael Gutierres Castanha',
    role: 'Coordenador - Responsavel pelo Projeto',
    photo: '/images/profiles/rafaPhoto.png',
    bio: 'Especialização em formação didático-pedagógica para cursos na modalidade a distância pela Universidade Virtual do Estado de São Paulo (UNIVESP). Doutor e Mestre em Ciência da Informação pela Universidade Estadual Paulista "Júlio de Mesquita Filho" (PPGCI/UNESP). Graduação em Licenciatura em Matemática pela Universidade Estadual Paulista (UNESP/FCT). Docente permanente do programa de pós-graduação em administração de organizações inovadoras (PPGA) - Universidade de Marília (UNIMAR)',
    social: {
      lattes: 'http://lattes.cnpq.br/4834832439175113',
      orcid: 'http://orcid.org/0000-0002-3117-1780',
      scholar: 'https://scholar.google.com.br/citations?user=97vPtawAAAAJ&hl=pt-BR',
      linkedin: 'https://www.linkedin.com/in/rcastanha/',
      researchGate: 'https://www.researchgate.net/profile/Rafael-Gutierres-Castanha-2',
      email: 'r.castanha@gmail.com'
    }
  },
  {
    name: 'Amanda Alves dos Santos Gomes Licas',
    role: 'Coordenadora - Responsavel pelo Projeto',
    photo: '/images/profiles/amandaPhoto.png',
    bio: 'Bacharel em Administração pela Universidade de Marília (UNIMAR), concluída em 2020. Possui especializações em Marketing Estratégico Digital, Finanças com Ênfase em Mercado de Capitais e Docência do Ensino Superior e Metodologias Ativas, todas pela Descomplica. É Mestre em Administração de Organizações Inovadoras pelo Programa de Mestrado Profissional da Universidade de Marília (UNIMAR), onde desenvolveu a dissertação intitulada “Liderança e Gestão do Conhecimento em Organizações Intensivas em Conhecimento: uma Revisão Sistemática da Literatura sobre sua Intersecção”, sob orientação da Profa. Dra. Ana Lívia Cazane. Sua pesquisa concentra-se nos temas liderança, gestão do conhecimento, aprendizagem organizacional e organizações intensivas em conhecimento.',
    social: {
      lattes: 'http://lattes.cnpq.br/7290391207798976',
      orcid: 'https://orcid.org/0009-0006-4464-1004',
      linkedin: 'https://www.linkedin.com/in/amanda-a-gomes-4747aa196',
      email: 'santos.amanda.ss16@gmail.com'
    }
  },
  {
    name: 'Noah Franco',
    role: 'Desenvolvedor Full Stack - Desenvolvimento da plataforma',
    photo: '/images/profiles/noahPhoto.png',
    bio: 'Graduando em Ciência da computação pela Universidade de Marília (UNIMAR). Desenvolvedor responsável pela modelagem e construção de ponta a ponta da plataforma web de autodiagnóstico de liderança.',
    social: {
      linkedin: 'https://www.linkedin.com/in/noahmf/',
      github: 'https://github.com/DevNoahF',
      email: 'noahvf16@outlook.com'
    }
  }
];

function renderTeamMembers() {
  const container = document.getElementById('teamGrid');
  if (!container) return;

  container.innerHTML = TEAM_DATA.map(member => {
    const socialLinks = [];
    if (member.social.lattes) {
      socialLinks.push(`<a href="${member.social.lattes}" target="_blank" rel="noopener noreferrer" title="Currículo Lattes" aria-label="Currículo Lattes"><img src="/images/icons/lattes.png" alt="Currículo Lattes"></a>`);
    }
    if (member.social.orcid) {
      socialLinks.push(`<a href="${member.social.orcid}" target="_blank" rel="noopener noreferrer" title="ORCID" aria-label="ORCID"><img src="/images/icons/id.png" alt="ORCID"></a>`);
    }
    if (member.social.scholar) {
      socialLinks.push(`<a href="${member.social.scholar}" target="_blank" rel="noopener noreferrer" title="Google Scholar" aria-label="Google Scholar"><img src="/images/icons/escholar.png" alt="Google Scholar"></a>`);
    }
    if (member.social.linkedin) {
      socialLinks.push(`<a href="${member.social.linkedin}" target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn"><img src="/images/icons/linkedin.png" alt="LinkedIn"></a>`);
    }
    if (member.social.researchGate) {
      socialLinks.push(`<a href="${member.social.researchGate}" target="_blank" rel="noopener noreferrer" title="ResearchGate" aria-label="ResearchGate"><img src="/images/icons/researchGate.png" alt="ResearchGate"></a>`);
    }
    if (member.social.github) {
      socialLinks.push(`<a href="${member.social.github}" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub"><i class="bi bi-github"></i></a>`);
    }
    if (member.social.email) {
      socialLinks.push(`<a href="mailto:${member.social.email}" title="E-mail" aria-label="E-mail"><i class="bi bi-envelope-fill"></i></a>`);
    }

    const photoPosStyle = member.photoPos ? ` background-position: ${member.photoPos};` : '';

    return `
      <article class="team-member">
        <div class="portrait has-image" style="background-image: url('${member.photo}');${photoPosStyle}" role="img" aria-label="Foto de ${escapeHtml(member.name)}"><span>Foto</span></div>
        <div class="member-content">
          <h2>${escapeHtml(member.name)}</h2>
          <p class="member-role">${escapeHtml(member.role)}</p>
          <p class="member-bio">${escapeHtml(member.bio)}</p>
          <nav class="member-social" aria-label="Redes sociais de ${escapeHtml(member.name)}">
            ${socialLinks.join('')}
          </nav>
        </div>
      </article>
    `;
  }).join('');
}

/* --------------------------------------------------------------------------
   Carrossel da Equipe
   -------------------------------------------------------------------------- */
function initTeamCarousel() {
  const carousel = document.querySelector('.team-carousel');
  const track = carousel?.querySelector('.team-grid');
  const previousButton = carousel?.querySelector('.carousel-control-prev');
  const nextButton = carousel?.querySelector('.carousel-control-next');
  if (!carousel || !track || !previousButton || !nextButton) return;

  const slides = Array.from(track.children);
  if (slides.length < 2) return;

  if (!track.dataset.cloned) {
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');
    track.append(firstClone);
    track.prepend(lastClone);
    track.dataset.cloned = 'true';
  }

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

  window.resetTeamCarousel = () => {
    moveToSlide(1, false);
    startAutoplay();
  };

  moveToSlide(currentIndex, false);
  startAutoplay();
}

/* --------------------------------------------------------------------------
   Exibição e Cálculo dos Resultados do Autodiagnóstico
   -------------------------------------------------------------------------- */
function showResults(event) {
  if (event && event.preventDefault) event.preventDefault();
  const totalQuestions = document.querySelectorAll('#dimensionsContainer input[type="radio"]')
    .length / appData.intro.escala.length;
  if (document.querySelectorAll('#dimensionsContainer input:checked').length !== totalQuestions) return;

  const results = appData.dimensions.map(dimension => {
    const scores = dimension.items.map(item => Number(document.querySelector(`input[name="${dimension.id}-${item.n}"]:checked`).value));
    const average = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100;
    const band = appData.interpretationBands.find(item => average >= item.min && average <= item.max);
    return { ...dimension, average, interpretation: band.label };
  });

  lastResultsData = results;

  const resultsGrid = document.getElementById('resultsGrid');
  if (resultsGrid) {
    resultsGrid.innerHTML = results.map(result => `<article class="result-item"><span class="label">${escapeHtml(cleanDimensionName(result.shortLabel))}</span><strong>${result.average.toFixed(2)}</strong><small>${escapeHtml(result.interpretation)}</small></article>`).join('');
  }

  const suggestionsHtml = results.map(result => `<article class="suggestion"><h3>${escapeHtml(cleanDimensionName(result.shortLabel))}</h3><p>${escapeHtml(result.developmentSuggestion)}</p></article>`).join('');

  const recList = document.getElementById('recommendationsList');
  if (recList) recList.innerHTML = suggestionsHtml;

  const printTitle = document.getElementById('printReportTitle');
  if (printTitle) printTitle.textContent = appData.intro.titulo;

  const printRecList = document.getElementById('printRecommendationsList');
  if (printRecList) printRecList.innerHTML = suggestionsHtml;

  const notice = document.getElementById('natureNotice');
  if (notice) notice.textContent = appData.intro.naturezaDoInstrumento;

  const resultsPanel = document.getElementById('resultsPanel');
  if (resultsPanel) resultsPanel.classList.remove('hidden');

  const recPanel = document.getElementById('recommendationsPanel');
  if (recPanel) recPanel.classList.remove('hidden');

  drawRadar(results, 'radarChart');
  drawRadar(results, 'printRadarChart');
  saveHistory(results);
  renderHistory();

  if (resultsPanel) resultsPanel.scrollIntoView({ behavior: 'smooth' });
}

function drawRadar(results, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) * 0.65;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = '600 12px "Plus Jakarta Sans", "Inter", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0';
  const textColor = canvasId === 'printRadarChart' ? '#000000' : (isDark ? '#f1f5f9' : '#0b1e36');

  for (let ring = 1; ring <= 5; ring += 1) {
    drawPolygon(context, results.length, centerX, centerY, (radius * ring) / 5, false, null, gridColor);
  }

  results.forEach((result, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / results.length;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(x, y);
    context.strokeStyle = gridColor;
    context.lineWidth = 1.2;
    context.stroke();

    const labelRadius = radius + 26;
    const labelX = centerX + Math.cos(angle) * labelRadius;
    const labelY = centerY + Math.sin(angle) * labelRadius;
    context.fillStyle = textColor;
    context.fillText(cleanDimensionName(result.shortLabel), labelX, labelY);
  });

  drawPolygon(
    context,
    results.length,
    centerX,
    centerY,
    radius,
    true,
    results.map(result => result.average / 5),
    gridColor,
    isDark
  );
}

function drawPolygon(context, count, centerX, centerY, radius, fill, values, gridColor, isDark) {
  context.beginPath();
  const points = [];
  for (let index = 0; index < count; index += 1) {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const value = values ? values[index] : 1;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    points.push({ x, y });
    index ? context.lineTo(x, y) : context.moveTo(x, y);
  }
  context.closePath();

  if (fill) {
    const strokeColor = isDark ? '#3b82f6' : '#1d4ed8';
    const fillColor = isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(29, 78, 216, 0.18)';
    const dotColor = isDark ? '#60a5fa' : '#2563eb';
    const dotBorder = isDark ? '#ffffff' : '#0b1e36';

    context.strokeStyle = strokeColor;
    context.lineWidth = 2.5;
    context.stroke();
    context.fillStyle = fillColor;
    context.fill();

    points.forEach(point => {
      context.beginPath();
      context.arc(point.x, point.y, 4.5, 0, 2 * Math.PI);
      context.fillStyle = dotColor;
      context.fill();
      context.strokeStyle = dotBorder;
      context.lineWidth = 1.5;
      context.stroke();
    });
  } else {
    context.strokeStyle = gridColor || '#e2e8f0';
    context.lineWidth = 1.2;
    context.stroke();
  }
}

function restartAssessment() {
  const surveyForm = document.getElementById('surveyForm');
  if (surveyForm) surveyForm.reset();

  const resultsPanel = document.getElementById('resultsPanel');
  if (resultsPanel) resultsPanel.classList.add('hidden');

  const recPanel = document.getElementById('recommendationsPanel');
  if (recPanel) recPanel.classList.add('hidden');

  updateSubmitState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cleanDimensionName(value) {
  return value.replace(/^D\d+\s*-\s*/, '').replace(/^\d+\.\s*/, '');
}

function exportPdf() {
  window.print();
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function saveHistory(results) {
  const history = getHistory();
  history.unshift({
    date: new Date().toISOString(),
    scores: results.map(result => ({ label: cleanDimensionName(result.shortLabel), average: result.average }))
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

function renderHistory() {
  const history = getHistory();
  const list = document.getElementById('historyList');
  if (list) {
    list.innerHTML = history.length
      ? history.map(item => `<article class="history-item"><div class="history-date">${new Date(item.date).toLocaleString('pt-BR')}</div><ul>${item.scores.map(score => `<li>${escapeHtml(score.label)}: <strong>${Number(score.average).toFixed(2)}</strong></li>`).join('')}</ul></article>`).join('')
      : '<p class="empty-history">Nenhum teste salvo neste navegador.</p>';
  }
}

function toggleHistory() {
  const panel = document.getElementById('historyPanel');
  if (panel) {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      renderHistory();
      panel.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function showError(message) {
  const error = document.createElement('div');
  error.className = 'error-message';
  error.textContent = message;
  document.body.prepend(error);
}
