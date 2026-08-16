/**
 * Autodiagnóstico de Liderança - Frontend
 * Responsabilidade: Gerenciar interface, requisições e renderização
 */

// ============================================================================
// CONSTANTES E VARIÁVEIS GLOBAIS
// ============================================================================

const STORAGE_KEY = 'autodiagnostico_history_v1';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

let appData = {
  titulo: '',
  presentation: [],
  dimensions: {},
  recommendations: {}
};

let currentResults = null;

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadApplicationData();
  setupEventListeners();
});

// ============================================================================
// CARREGAR DADOS DA API
// ============================================================================

async function loadApplicationData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Erro ao carregar dados');

    appData = await response.json();
    
    // Renderizar elementos
    document.getElementById('pageTitle').textContent = appData.titulo;
    renderPresentation();
    renderDimensions();
    renderEmptyHistory();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showError('Erro ao carregar a aplicação');
  }
}

// ============================================================================
// RENDERIZAR APRESENTAÇÃO
// ============================================================================

function renderPresentation() {
  const section = document.getElementById('presentationSection');
  if (!section || !appData.presentation.length) return;

  section.innerHTML = appData.presentation
    .map(item => `<p>${escapeHtml(item)}</p>`)
    .join('');
}

// ============================================================================
// RENDERIZAR DIMENSÕES E QUESTÕES
// ============================================================================

function renderDimensions() {
  const container = document.getElementById('dimensionsContainer');
  if (!container || !Object.keys(appData.dimensions).length) return;

  const scaleLegend = `
    <div class="scale-legend">
      <strong>Escala:</strong>
      <span>1 = Discordo totalmente</span>
      <span>2 = Discordo</span>
      <span>3 = Neutro</span>
      <span>4 = Concordo</span>
      <span>5 = Concordo totalmente</span>
    </div>
  `;

  container.innerHTML = scaleLegend + Object.entries(appData.dimensions)
    .map(([dimensionName, items]) => `
      <section class="card dimension-block">
        <div class="dimension-header">
          <h2>${escapeHtml(dimensionName)}</h2>
        </div>

        ${items.map(item => `
          <div class="question-item">
            <div class="question-text">
              <strong>${item.numero}.</strong>
              <span>${escapeHtml(item.questao)}</span>
            </div>

            <div class="options">
              ${[1, 2, 3, 4, 5].map(score => `
                <label>
                  <input
                    type="radio"
                    name="${escapeHtml(dimensionName)}::${item.numero}"
                    value="${score}"
                    required
                  />
                  <span>${score}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </section>
    `)
    .join('');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Envio do formulário
  const form = document.getElementById('surveyForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Botões de histórico
  const historyBtn = document.getElementById('historyBtn');
  const historyBtnEmpty = document.getElementById('historyBtnEmpty');
  if (historyBtn) historyBtn.addEventListener('click', toggleHistory);
  if (historyBtnEmpty) historyBtnEmpty.addEventListener('click', toggleHistory);

  // Limpar histórico
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) clearBtn.addEventListener('click', confirmAndClearHistory);
}

// ============================================================================
// PROCESSAR ENVIO DO FORMULÁRIO
// ============================================================================

async function handleFormSubmit(event) {
  event.preventDefault();

  try {
    // Coletar dados do formulário
    const formData = new FormData(document.getElementById('surveyForm'));

    // Enviar para API
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Erro ao processar avaliação');

    const data = await response.json();

    if (data.success) {
      currentResults = data.results;
      
      // Salvar no histórico
      saveCurrentResults();
      
      // Renderizar resultados
      showResults(currentResults);
      
      // Rolar até resultados
      scrollToResults();
    }
  } catch (error) {
    console.error('Erro ao processar formulário:', error);
    showError('Erro ao processar a avaliação');
  }
}

// ============================================================================
// RENDERIZAR RESULTADOS
// ============================================================================

function showResults(results) {
  // Mostrar painel de resultados
  const resultsPanel = document.getElementById('resultsPanel');
  const recommendationsPanel = document.getElementById('recommendationsPanel');
  
  if (resultsPanel) resultsPanel.classList.remove('hidden');
  if (recommendationsPanel) recommendationsPanel.classList.remove('hidden');

  // Renderizar grid de resultados
  const resultsGrid = document.getElementById('resultsGrid');
  if (resultsGrid) {
    resultsGrid.innerHTML = Object.entries(results)
      .map(([dimensionName, item]) => `
        <div class="result-item">
          <span class="label">${escapeHtml(dimensionName)}</span>
          <strong>${item.media}</strong>
          <small>${escapeHtml(item.nivel)}</small>
        </div>
      `)
      .join('');
  }

  // Renderizar recomendações
  const recommendationsList = document.getElementById('recommendationsList');
  if (recommendationsList) {
    recommendationsList.innerHTML = Object.entries(results)
      .map(([dimensionName, item]) => `
        <li>
          <strong>${escapeHtml(dimensionName)}:</strong>
          ${escapeHtml(item.recomendacao)}
        </li>
      `)
      .join('');
  }
}

// ============================================================================
// HISTÓRICO
// ============================================================================

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const now = Date.now();
    return parsed.filter(item => now - item.savedAt <= SEVEN_DAYS_MS);
  } catch (error) {
    console.error('Erro ao ler histórico:', error);
    return [];
  }
}

function saveCurrentResults() {
  if (!currentResults || Object.keys(currentResults).length === 0) {
    return;
  }

  const history = getHistory();
  const snapshot = {
    savedAt: Date.now(),
    results: currentResults,
    label: new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  history.push(snapshot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20)));

  // Atualizar histórico vazio
  renderEmptyHistory();
}

function renderEmptyHistory() {
  const history = getHistory();
  const container = document.getElementById('historyListEmpty');
  
  if (!container) return;

  if (!history.length) {
    container.innerHTML = '<p class="empty-history">Nenhum resultado salvo nos últimos 7 dias.</p>';
    return;
  }

  renderHistoryItems(container, history);
}

function renderHistoryList() {
  const history = getHistory();
  const container = document.getElementById('historyList');
  
  if (!container) return;

  if (!history.length) {
    container.innerHTML = '<p class="empty-history">Nenhum resultado salvo nos últimos 7 dias.</p>';
    return;
  }

  renderHistoryItems(container, history);
}

function renderHistoryItems(container, history) {
  container.innerHTML = history
    .slice()
    .reverse()
    .map(item => {
      const values = Object.entries(item.results)
        .map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${value.media} (${escapeHtml(value.nivel)})</li>`)
        .join('');
      
      return `
        <div class="history-item">
          <div class="history-date">${escapeHtml(item.label)}</div>
          <ul>${values}</ul>
        </div>
      `;
    })
    .join('');
}

function toggleHistory() {
  const panel = document.getElementById('historyPanel');
  if (!panel) return;
  
  panel.classList.toggle('hidden');
  renderHistoryList();
}

function confirmAndClearHistory() {
  if (confirm('Tem certeza que deseja limpar o histórico? Esta ação não pode ser desfeita.')) {
    localStorage.removeItem(STORAGE_KEY);
    renderHistoryList();
    renderEmptyHistory();
  }
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError(message) {
  // Criar elemento de erro temporário
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);

  // Remover após 5 segundos
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function scrollToResults() {
  const resultsPanel = document.getElementById('resultsPanel');
  if (resultsPanel) {
    resultsPanel.scrollIntoView({ behavior: 'smooth' });
  }
}
