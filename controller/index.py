"""
Controlador (Router) para as rotas da aplicação.
Responsabilidade: Gerenciar endpoints HTTP e retornar dados JSON.
Princípio: Single Responsibility (apenas coordena requisição/resposta e retorna JSON)
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from config.data import INSTRUMENT
from services.assessment_service import AssessmentService

# Criar router
router = APIRouter()

# Instanciar serviço de avaliação
assessment_service = AssessmentService()


@router.get('/api/data')
async def get_data():
    """
    Retorna dados iniciais para renderização no frontend.
    
    Returns:
        dict com titulo, presentation, dimensions, recommendations
    """
    return JSONResponse(content=INSTRUMENT)


@router.post('/api/evaluate')
async def evaluate(request: Request):
    """
    Processa instrumento de autodiagnóstico enviado e retorna resultados da avaliação.
    
    Recebe form-data com scores das dimensões.
    Retorna resultados calculados em JSON.
    """
    form_data = await request.form()
    
    # Usar serviço para calcular resultados
    results = assessment_service.calculate_results(form_data)

    return JSONResponse(
        content={
            'success': True,
            'results': results,
        }
    )