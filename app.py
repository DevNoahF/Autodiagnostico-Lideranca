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
templates = Jinja2Templates(directory=str(BASE_DIR / 'templates'))

# Inicializar serviço de avaliação (injeção de dependência)
assessment_service = AssessmentService()


# Rota para servir HTML (SPA - Single Page Application)
@app.get('/')
async def root():
    """Retorna arquivo HTML principal."""
    return FileResponse(BASE_DIR / 'templates' / 'index.html')


# Importar rotas da API
from controller.index import router

# Registrar rotas da API
app.include_router(router, tags=['api'])


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='127.0.0.1', port=8000, reload=True)
