import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
import joblib

# 1. Dataset Aumentado (incluindo variações sem acento)
data = {
    'texto': [
        "Amei o produto, maravilhoso!", "O atendimento foi excelente.",
        "Chegou no prazo, tudo ok.", "A embalagem é normal, sem luxo.",
        "O produto não funciona, horrível.", "Detestei, quero meu dinheiro.",
        "Poderia ser melhor, mas serve.", "Muito caro pelo que oferece.",
        "O produto é fantástico, superou minhas expectativas!", "Entrega muito rápida.",
        "Adorei o atendimento.", "A qualidade do material é excelente.",
        "Preço justo e ótima qualidade.", "Simplesmente perfeito.",
        "Funciona muito bem.", "A embalagem veio impecável.",
        "Melhor custo-benefício.", "O suporte resolveu meu problema.",
        "Muito bonito.", "Exatamente como na foto.",
        "Nota 10, nada a reclamar.", "Uma experiência maravilhosa.",
        
        # NEUTROS
        "Chegou, mas a caixa estava amassada.", "É um produto ok.",
        "Cumpre o que promete.", "A entrega foi no prazo.",
        "A cor é diferente, mas serve.", "Razoável.",
        "Não é ruim, mas esperava mais.", "Atendimento normal.",
        "Recebi conforme a descrição.", "Funciona, mas faz barulho.",
        "Mediano.", "Vale a pena para uso básico.",
        "Tamanho padrão.", "Demorou mas chegou.", "Quebra-galho.",

        # NEGATIVOS (Reforçados)
        "Péssimo produto.", "pessimo atendimento", # Variação sem acento
        "Horrível, não comprem.", "horrivel",
        "Dinheiro jogado fora.", "Chegou quebrado.",
        "Entrega atrasou muito.", "Qualidade baixa.",
        "Detestei.", "Veio com defeito.",
        "Muito caro.", "Não recomendo.",
        "O site travou.", "Enganação.",
        "Frágil, quebrou logo.", "Suporte ruim.",
        "Insatisfeito.", "Odiei.", "Lixo de produto.", "Nao funciona"
    ],
    'sentimento': [
        'Positivo', 'Positivo', 'Neutro', 'Neutro', 'Negativo', 'Negativo',
        'Neutro', 'Negativo', 
        "Positivo", "Positivo", "Positivo", "Positivo", "Positivo",
        "Positivo", "Positivo", "Positivo", "Positivo", "Positivo",
        "Positivo", "Positivo", "Positivo", "Positivo",
        "Neutro", "Neutro", "Neutro", "Neutro", "Neutro",
        "Neutro", "Neutro", "Neutro", "Neutro", "Neutro",
        "Neutro", "Neutro", "Neutro", "Neutro", "Neutro",
        "Negativo", "Negativo", "Negativo", "Negativo", "Negativo",
        "Negativo", "Negativo", "Negativo", "Negativo", "Negativo",
        "Negativo", "Negativo", "Negativo", "Negativo", "Negativo",
        "Negativo", "Negativo", "Negativo", "Negativo", "Negativo"
    ]
}

df = pd.DataFrame(data)

# 2. Pipeline com tratamento de acentos
# strip_accents='unicode' faz "Péssimo" virar "Pessimo" automaticamente
modelo = make_pipeline(
    TfidfVectorizer(strip_accents='unicode', lowercase=True),
    LogisticRegression(solver='lbfgs')
)

print("⏳ Treinando modelo reforçado...")
modelo.fit(df['texto'], df['sentimento'])

# 3. Salvar
joblib.dump(modelo, "project.joblib")
print("✅ Novo modelo salvo em: project.joblib")