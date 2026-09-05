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


# Rotas para servir a aplicação SPA
@app.get('/')
async def root():
    """Retorna a aplicação SPA."""
    return FileResponse(BASE_DIR / 'templates' / 'index.html')


@app.get('/lideranca-e-gc')
async def context_page():
    """Retorna a aplicação SPA."""
    return FileResponse(BASE_DIR / 'templates' / 'index.html')


@app.get('/inicio')
async def project_page():
    """Retorna a aplicação SPA."""
    return FileResponse(BASE_DIR / 'templates' / 'index.html')


@app.get('/equipe')
async def team_page():
    """Retorna a aplicação SPA."""
    return FileResponse(BASE_DIR / 'templates' / 'index.html')


@app.get('/instrumento-de-autodiagnostico')
async def assessment_page():
    """Retorna a aplicação SPA."""
    return FileResponse(BASE_DIR / 'templates' / 'index.html')


# Importar rotas da API
from controller.index import router

# Registrar rotas da API
app.include_router(router, tags=['api'])


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app:app', host='127.0.0.1', port=8080, reload=True)
