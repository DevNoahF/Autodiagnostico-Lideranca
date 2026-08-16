"""
Modelos de domínio para a aplicação de autodiagnóstico.
Responsabilidade: Representar entidades e estruturas de dados do domínio.
"""

from dataclasses import dataclass
from typing import List, Dict, Any


@dataclass
class Level:
    """Representa um nível de maturidade na avaliação."""
    min_value: float
    max_value: float
    label: str


@dataclass
class AssessmentResult:
    """Resultado da avaliação de uma dimensão."""
    dimension_name: str
    average_score: float
    level: str
    recommendation: str

    def to_dict(self) -> Dict[str, Any]:
        """Converte resultado para dicionário."""
        return {
            'media': self.average_score,
            'nivel': self.level,
            'recomendacao': self.recommendation,
        }


@dataclass
class AssessmentResponse:
    """Resposta completa de uma avaliação."""
    results: Dict[str, Dict[str, Any]]

    def to_dict(self) -> Dict[str, Any]:
        """Converte resposta para dicionário."""
        return self.results
