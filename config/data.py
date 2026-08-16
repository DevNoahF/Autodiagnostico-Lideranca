"""
Configurações e dados estáticos da aplicação.
Responsabilidade: Armazenar todas as constantes, dados e configurações.
"""

PRESENTATION = [
	'Origem do instrumento:',
    'Este instrumento é o Produto Técnico-Tecnológico (PTT) associado à dissertação '
    '“Liderança e Gestão do Conhecimento em Organizações Intensivas em Conhecimento: uma Revisão Sistemática da Literatura sobre sua Intersecção”,'
    ' de Amanda Alves dos Santos Gomes Licas, apresentada ao Programa de Pós-Graduação em Administração de Organizações Inovadoras da Universidade de Marília (UNIMAR),'
    ' sob orientação da Profa. Dra. Ana Lívia Cazane.',
    'Base empirica:',
    'As cinco dimensões e os 25 itens deste instrumento derivam diretamente das cinco categorias temáticas identificadas na Revisão Sistemática da Literatura'
    ' e Análise de Conteúdo de 87 artigos publicados nas bases Scopus e Web of Science (2016-2025).',
    'Publico-alvo:',
    'Gestores, líderes de equipe e profissionais de RH / desenvolvimento organizacional em organizações intensivas em conhecimento'
    ' (universidades, centros de pesquisa, hospitais de alta complexidade, empresas de tecnologia, consultorias especializadas e organizações voltadas à inovação).',
    'Natureza do instrumento:',
    'Este instrumento tem caráter reflexivo e não prescritivo, em coerência com o posicionamento metodológico da dissertação: '
    'não pressupõe a existência de um estilo de liderança universalmente superior, mas oferece um ponto de partida estruturado,'
    ' ancorado em evidências da literatura, para o diagnóstico e o planejamento de ações de desenvolvimento de liderança voltadas à gestão do conhecimento.'
]

DIMENSIONS = {
    '1. Liderança como Habilitadora do Compartilhamento e da Confiança': [
        {'numero': 1, 'questao': 'As lideranças criam um ambiente psicologicamente seguro, no qual os colaboradores se sentem à vontade para compartilhar ideias, dúvidas e erros.', 'referencia': 'Fullwood; Rowley (2016); Davenport; Prusak (1998)'},
        {'numero': 2, 'questao': 'Existem normas claras de colaboração e reciprocidade estimuladas pelas lideranças, e não apenas mecanismos formais de compartilhamento.', 'referencia': 'Fullwood; Rowley (2016)'},
        {'numero': 3, 'questao': 'A liderança orientada ao conhecimento favorece o comprometimento afetivo dos colaboradores com as práticas de gestão do conhecimento.', 'referencia': 'Shamim; Cang; Yu (2017)'},
        {'numero': 4, 'questao': 'A relação entre líderes e liderados é percebida como de alta qualidade, reduzindo o receio de compartilhar conhecimento especializado.', 'referencia': 'Estudos com base na teoria Leader-Member Exchange (LMX)'},
        {'numero': 5, 'questao': 'As lideranças demonstram apoio individualizado e constroem relações de confiança como parte de seu estilo de liderança.', 'referencia': 'Bass (1985)'},
    ],
    '2. Liderança Estratégica para Inovação e Sustentabilidade': [
        {'numero': 1, 'questao': 'As lideranças reconhecem explicitamente o conhecimento especializado como ativo estratégico para a inovação.', 'referencia': 'Sadeghi; Rad (2018)'},
        {'numero': 2, 'questao': 'Há incentivo ativo à atualização contínua e à troca de experiências entre profissionais especializados.', 'referencia': 'Tang (2017)'},
        {'numero': 3, 'questao': 'O compartilhamento do conhecimento é utilizado como mecanismo para impulsionar o desempenho inovador da organização.', 'referencia': 'Zheng; Wu; Xie (2017)'},
        {'numero': 4, 'questao': 'Existem mecanismos de integração do conhecimento entre diferentes níveis hierárquicos.', 'referencia': 'Zhang et al. (2023)'},
        {'numero': 5, 'questao': 'As lideranças conectam explicitamente a gestão do conhecimento a metas de sustentabilidade e vantagem competitiva de longo prazo.', 'referencia': 'Al-Faouri (2023); Juniarti et al. (2024)'},
    ],
    '3. Liderança na Gestão do Comportamento de Conhecimento (Mitigação da Ocultação)': [
        {'numero': 1, 'questao': 'A organização monitora e busca reduzir comportamentos de retenção deliberada de conhecimento (knowledge hiding).', 'referencia': 'Zahoor et al. (2024)'},
        {'numero': 2, 'questao': 'As lideranças agem de forma ética, coerente e previsível, o que fortalece a confiança organizacional.', 'referencia': 'Mohsin et al. (2021)'},
        {'numero': 3, 'questao': 'O ambiente de trabalho não estimula competição interna excessiva pela posse ou controle do conhecimento.', 'referencia': 'Zahoor et al. (2024)'},
        {'numero': 4, 'questao': 'Fatores relacionais e organizacionais são considerados ao lidar com a retenção de conhecimento.', 'referencia': 'Im; Bang (2023)'},
        {'numero': 5, 'questao': 'As lideranças constroem segurança psicológica e identificação relacional forte com suas equipes.', 'referencia': 'Li; Peng (2025)'},
    ],
    '4. Liderança Distribuída e Colaboração em Contextos Complexos': [
        {'numero': 1, 'questao': 'A responsabilidade pela liderança é compartilhada entre múltiplos atores, e não concentrada em uma única posição hierárquica.', 'referencia': 'Cannatelli et al. (2016)'},
        {'numero': 2, 'questao': 'Existem mecanismos de coordenação horizontal entre diferentes áreas, equipes ou especialistas.', 'referencia': 'Rose; Jones; Furneaux (2016)'},
        {'numero': 3, 'questao': 'Decisões complexas são construídas coletivamente, integrando múltiplas perspectivas especializadas.', 'referencia': 'Chen; Yu; Fu (2025)'},
        {'numero': 4, 'questao': 'O conhecimento circula entre fronteiras hierárquicas e funcionais, sem barreiras rígidas de acesso.', 'referencia': 'Cannatelli et al. (2016)'},
        {'numero': 5, 'questao': 'A organização utiliza conhecimento externo (parcerias, redes) de forma colaborativa para inovar.', 'referencia': 'Rose; Jones; Furneaux (2016)'},
    ],
    '5. Liderança como Promotora da Cultura de Aprendizagem Organizacional': [
        {'numero': 1, 'questao': 'A aprendizagem contínua está incorporada aos valores e às rotinas organizacionais, e não depende apenas de iniciativas pontuais.', 'referencia': 'Fashami; Babaei (2017)'},
        {'numero': 2, 'questao': 'As lideranças disponibilizam recursos e legitimam práticas voltadas à aprendizagem organizacional.', 'referencia': 'Zhang et al. (2023)'},
        {'numero': 3, 'questao': 'A cultura organizacional valoriza colaboração, confiança e experimentação.', 'referencia': 'Senge (2010)'},
        {'numero': 4, 'questao': 'A gestão do conhecimento é institucionalizada, não dependendo exclusivamente de indivíduos específicos.', 'referencia': 'Terra (2000)'},
        {'numero': 5, 'questao': 'Tecnologias digitais são usadas para apoiar - e não substituir - os processos humanos de aprendizagem e compartilhamento.', 'referencia': 'Shamim; Cang; Yu (2017)'},
    ],
}

RECOMMENDATIONS = {
    '1. Liderança como Habilitadora do Compartilhamento e da Confiança': 'Investir em práticas que ampliem a segurança psicológica e capacitar lideranças em escuta ativa e construção de confiança.',
    '2. Liderança Estratégica para Inovação e Sustentabilidade': 'Incluir explicitamente a gestão do conhecimento nas discussões estratégicas e conectar metas de inovação e sustentabilidade a indicadores de compartilhamento e aplicação de conhecimento.',
    '3. Liderança na Gestão do Comportamento de Conhecimento (Mitigação da Ocultação)': 'Revisar sistemas de avaliação e recompensa que estimulem competição interna excessiva; instituir mecanismos de reconhecimento para quem compartilha conhecimento.',
    '4. Liderança Distribuída e Colaboração em Contextos Complexos': 'Criar instâncias formais de coordenação horizontal e distribuir responsabilidades de liderança em projetos complexos.',
    '5. Liderança como Promotora da Cultura de Aprendizagem Organizacional': 'Institucionalizar rotinas de aprendizagem e usar tecnologia como apoio, não substituto, das interações humanas.',
}

LEVELS = [
    {'min': 0.0, 'max': 2.0, 'label': 'Inicial'},
    {'min': 2.1, 'max': 3.0, 'label': 'Em desenvolvimento'},
    {'min': 3.1, 'max': 4.0, 'label': 'Consolidado'},
    {'min': 4.1, 'max': 5.0, 'label': 'Avançado'},
]

APP_TITLE = 'Autodiagnóstico de Liderança em Gestão do Conhecimento'
