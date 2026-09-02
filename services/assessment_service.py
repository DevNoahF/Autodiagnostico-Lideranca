"""
Serviço de domínio para lógica de avaliação.
Responsabilidade: Implementar regras de negócio e cálculos da avaliação.
Princípios: Single Responsibility, Open/Closed, Dependency Inversion
"""

from typing import Dict, Any, List
from config.data import LEVELS, RECOMMENDATIONS, DIMENSIONS
from models.assessment import AssessmentResult, Level


class LevelRepository:
    """
    Repositório de níveis de maturidade.
    Responsabilidade: Gerenciar dados de níveis (fácil de estender ou alterar fonte).
    """

    def __init__(self, levels: List[Dict[str, Any]] = None):
        self.levels = levels or LEVELS

    def get_levels(self) -> List[Level]:
        """Retorna lista de níveis de maturidade."""
        return [
            Level(
                min_value=level['min'],
                max_value=level['max'],
                label=level['label']
            )
            for level in self.levels
        ]

    def find_level_by_score(self, score: float) -> str:
        """Encontra o nível correspondente ao score."""
        for level in self.get_levels():
            if level.min_value <= score <= level.max_value:
                return level.label
        return 'Inicial'


class RecommendationRepository:
    """
    Repositório de recomendações.
    Responsabilidade: Gerenciar dados de recomendações (fácil de estender ou alterar fonte).
    """

    def __init__(self, recommendations: Dict[str, str] = None):
        self.recommendations = recommendations or RECOMMENDATIONS

    def get_base_recommendation(self, dimension_name: str) -> str:
        """Obtém recomendação base para uma dimensão."""
        return self.recommendations.get(dimension_name, '')


class RecommendationStrategy:
    """
    Estratégia para gerar recomendações baseadas no score.
    Responsabilidade: Encapsular lógica de recomendação (permite diferentes estratégias).
    Princípio: Open/Closed (fácil adicionar novas estratégias sem modificar código existente).
    """

    def generate(self, base_recommendation: str, average_value: float) -> str:
        """Gera recomendação completa com prioridade baseada no score."""
        if average_value <= 2.0:
            priority = 'Prioridade: "Atenção prioritária"; "Manter e evoluir".'
        elif average_value <= 3.0:
            priority = 'Prioridade: "Atenção moderada"; "Fortalecer e evoluir".'
        elif average_value <= 4.0:
            priority = 'Prioridade: "Consolidar"; "Manter e evoluir".'
        else:
            priority = 'Prioridade: "Sustentar"; "Inovar e acompanhar".'

        return f'{base_recommendation} {priority}'


class AssessmentService:
    """
    Serviço de domínio para cálculo de avaliações.
    Responsabilidade: Orquestrar lógica de negócio de avaliação.
    Princípios: Single Responsibility, Dependency Inversion
    """

    def __init__(
        self,
        level_repository: LevelRepository = None,
        recommendation_repository: RecommendationRepository = None,
        recommendation_strategy: RecommendationStrategy = None,
    ):
        self.level_repository = level_repository or LevelRepository()
        self.recommendation_repository = recommendation_repository or RecommendationRepository()
        self.recommendation_strategy = recommendation_strategy or RecommendationStrategy()

    def calculate_dimension_score(self, dimension_name: str, form_data: Dict[str, Any]) -> float:
        """
        Calcula o score médio para uma dimensão.
        
        Args:
            dimension_name: Nome da dimensão
            form_data: Dados do instrumento com scores
            
        Returns:
            Score médio arredondado para 2 casas decimais
        """
        items = DIMENSIONS.get(dimension_name, [])
        if not items:
            return 0.0

        total = 0
        count = 0
        for item in items:
            key = f'{dimension_name}::{item["numero"]}'
            score_value = form_data.get(key)
            if score_value is not None:
                total += int(score_value)
                count += 1

        return round(total / len(items), 2) if len(items) > 0 else 0.0

    def create_assessment_result(self, dimension_name: str, average_score: float) -> AssessmentResult:
        """
        Cria resultado estruturado da avaliação.
        
        Args:
            dimension_name: Nome da dimensão
            average_score: Score médio calculado
            
        Returns:
            AssessmentResult com nível e recomendação
        """
        level = self.level_repository.find_level_by_score(average_score)
        base_recommendation = self.recommendation_repository.get_base_recommendation(dimension_name)
        recommendation = self.recommendation_strategy.generate(base_recommendation, average_score)

        return AssessmentResult(
            dimension_name=dimension_name,
            average_score=average_score,
            level=level,
            recommendation=recommendation,
        )

    def calculate_results(self, form_data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        """
        Calcula resultados completos da avaliação para todas as dimensões.
        
        Args:
            form_data: Dados do instrumento com respostas do usuário
            
        Returns:
            Dicionário com resultados por dimensão
        """
        results = {}
        
        for dimension_name in DIMENSIONS.keys():
            average_score = self.calculate_dimension_score(dimension_name, form_data)
            assessment_result = self.create_assessment_result(dimension_name, average_score)
            results[dimension_name] = assessment_result.to_dict()

        return results
