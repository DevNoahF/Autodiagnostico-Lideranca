let appData;
const HISTORY_KEY = 'autodiagnostico-lideranca-history';

document.addEventListener('DOMContentLoaded', loadApplicationData);

async function loadApplicationData() {
  try {
    initThemeToggle();
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Erro ao carregar dados');
    appData = await response.json();
    document.title = appData.intro.titulo;
    document.getElementById('pageTitle').textContent = appData.intro.titulo;
    renderIntro(); renderDimensions();
    document.getElementById('surveyForm').addEventListener('submit', showResults);
    document.getElementById('restartButton').addEventListener('click', restartAssessment);
    document.getElementById('pdfButton').addEventListener('click', exportPdf);
    document.getElementById('historyButton').addEventListener('click', toggleHistory);
    document.getElementById('clearHistoryButton').addEventListener('click', clearHistory);
    renderHistory();
  } catch (error) { console.error(error); showError('Erro ao carregar a aplicação'); }
}

function renderIntro() {
  const intro = appData.intro;
  document.getElementById('presentationSection').innerHTML = `<p>${escapeHtml(intro.origem)}</p><p>${escapeHtml(intro.baseEmpirica)}</p><p>${escapeHtml(intro.publicoAlvo)}</p><p>${escapeHtml(intro.comoUsar)}</p><div class="notice"><strong>Natureza do instrumento</strong><p>${escapeHtml(intro.naturezaDoInstrumento)}</p></div>`;
}

function renderDimensions() {
  const scale = appData.intro.escala;
  const legend = `<div class="scale-legend"><strong>Escala de resposta</strong>${scale.map(item => `<span>${item.valor} = ${escapeHtml(item.label)}</span>`).join('')}</div>`;
  const dimensions = appData.dimensions.map(dimension => `<section class="card dimension-block"><div class="dimension-header"><div><h2>${escapeHtml(cleanDimensionName(dimension.name))}</h2></div><span class="score-badge">5 afirmações</span></div>${dimension.items.map(item => `<fieldset class="question-item"><legend><strong>${item.n}.</strong> ${escapeHtml(item.statement)}</legend><div class="options">${scale.map(option => `<label><input type="radio" name="${dimension.id}-${item.n}" value="${option.valor}" required><span>${option.valor}</span><small>${escapeHtml(option.label)}</small></label>`).join('')}</div></fieldset>`).join('')}</section>`).join('');
  document.getElementById('dimensionsContainer').innerHTML = legend + dimensions;
  document.getElementById('surveyForm').addEventListener('change', updateSubmitState);
}

function updateSubmitState() {
  const answered = document.querySelectorAll('#dimensionsContainer input:checked').length;
  const totalQuestions = document.querySelectorAll('#dimensionsContainer input[type="radio"]')
    .length / appData.intro.escala.length;
  const percentage = totalQuestions ? answered / totalQuestions * 100 : 0;
  document.getElementById('submitButton').disabled = answered !== totalQuestions;
  document.getElementById('progressLabel').textContent = `${answered} de ${totalQuestions} respondidas`;
  document.getElementById('progressBar').style.width = `${percentage}%`;
}

let lastResultsData = null;

function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  function updateBtnUI(theme) {
    toggleBtn.innerHTML = theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
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

function showResults(event) {
  event.preventDefault();
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
  document.getElementById('resultsGrid').innerHTML = results.map(result => `<article class="result-item"><span class="label">${escapeHtml(cleanDimensionName(result.shortLabel))}</span><strong>${result.average.toFixed(2)}</strong><small>${escapeHtml(result.interpretation)}</small></article>`).join('');
  const suggestionsHtml = results.map(result => `<article class="suggestion"><h3>${escapeHtml(cleanDimensionName(result.shortLabel))}</h3><p>${escapeHtml(result.developmentSuggestion)}</p></article>`).join('');
  document.getElementById('recommendationsList').innerHTML = suggestionsHtml;
  document.getElementById('printReportTitle').textContent = appData.intro.titulo;
  document.getElementById('printRecommendationsList').innerHTML = suggestionsHtml;
  document.getElementById('natureNotice').textContent = appData.intro.naturezaDoInstrumento;
  document.getElementById('resultsPanel').classList.remove('hidden'); document.getElementById('recommendationsPanel').classList.remove('hidden');
  drawRadar(results, 'radarChart'); drawRadar(results, 'printRadarChart'); saveHistory(results); renderHistory(); document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });
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
  const textColor = isDark ? '#f1f5f9' : '#0b1e36';

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

function restartAssessment() { document.getElementById('surveyForm').reset(); document.getElementById('resultsPanel').classList.add('hidden'); document.getElementById('recommendationsPanel').classList.add('hidden'); updateSubmitState(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function cleanDimensionName(value) { return value.replace(/^D\d+\s*-\s*/, '').replace(/^\d+\.\s*/, ''); }
function exportPdf() { window.print(); }
function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (error) { return []; } }
function saveHistory(results) { const history = getHistory(); history.unshift({ date: new Date().toISOString(), scores: results.map(result => ({ label: cleanDimensionName(result.shortLabel), average: result.average })) }); localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20))); }
function renderHistory() { const history = getHistory(); const list = document.getElementById('historyList'); list.innerHTML = history.length ? history.map(item => `<article class="history-item"><div class="history-date">${new Date(item.date).toLocaleString('pt-BR')}</div><ul>${item.scores.map(score => `<li>${escapeHtml(score.label)}: <strong>${Number(score.average).toFixed(2)}</strong></li>`).join('')}</ul></article>`).join('') : '<p class="empty-history">Nenhum teste salvo neste navegador.</p>'; }
function toggleHistory() { const panel = document.getElementById('historyPanel'); panel.classList.toggle('hidden'); if (!panel.classList.contains('hidden')) { renderHistory(); panel.scrollIntoView({ behavior: 'smooth' }); } }
function clearHistory() { localStorage.removeItem(HISTORY_KEY); renderHistory(); }
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function showError(message) { const error = document.createElement('div'); error.className = 'error-message'; error.textContent = message; document.body.prepend(error); }
