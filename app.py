"""
Aplicação FastAPI para Autodiagnóstico de Liderança em Gestão do Conhecimento.
Responsabilidade: Inicializar a aplicação e montar as rotas.
"""

from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from config.data import APP_TITLE
from services.assessment_service import AssessmentService

BASE_DIR = Path(__file__).resolve().parent

# Inicializar aplicação FastAPI
app = FastAPI(title=APP_TITLE)
app.mount('/static', StaticFiles(directory=str(BASE_DIR / 'static')), name='static')
app.mount('/images', StaticFiles(directory=str(BASE_DIR / 'templates' / 'images')), name='images')
templates = Jinja2Templates(directory=str(BASE_DIR / 'templates'))

# Inicializar serviço de avaliação (injeção de dependência)
assessment_service = AssessmentService()


# Rotas para servir as páginas HTML
@app.get('/')
async def root():
    """Retorna a página de apresentação do projeto."""
    return FileResponse(BASE_DIR / 'templates' / 'project.html')


@app.get('/lideranca-e-gc')
async def context_page():
    """Mantém a rota de contexto apontando para a apresentação."""
    return FileResponse(BASE_DIR / 'templates' / 'project.html')


@app.get('/inicio')
async def project_page():
    """Retorna a página de apresentação do projeto."""
    return FileResponse(BASE_DIR / 'templates' / 'project.html')


@app.get('/equipe')
async def team_page():
    """Retorna a página sobre a equipe."""
    return FileResponse(BASE_DIR / 'templates' / 'team.html')


@app.get('/formulario')
async def assessment_page():
    """Retorna a ferramenta interativa de autodiagnóstico."""
    return FileResponse(BASE_DIR / 'templates' / 'index.html')


# Importar rotas da API
from controller.index import router

# Registrar rotas da API
app.include_router(router, tags=['api'])


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='127.0.0.1', port=8000, reload=True)
