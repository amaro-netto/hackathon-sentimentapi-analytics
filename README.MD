# Projeto 1: SentimentAPI — Análise de Sentimentos de Feedbacks

![Status: Em Desenvolvimento](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge)
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring_boot-%236DB33F.svg?style=for-the-badge&logo=springboot&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-%23C71A36.svg?style=for-the-badge&logo=apachemaven&logoColor=white)
![H2 Database](https://img.shields.io/badge/H2_Database-%23003B57.svg?style=for-the-badge&logo=h2&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit_learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)
![NumPy](https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white)

---

### **Índice**
- [Projeto 1: SentimentAPI — Análise de Sentimentos de Feedbacks](#projeto-1-sentimentapi--análise-de-sentimentos-de-feedbacks)
    - [**Índice**](#índice)
    - [📝 **Descrição do Projeto**](#-descrição-do-projeto)
      - [⚙️ **Tecnologias Utilizadas**](#️-tecnologias-utilizadas)
      - [📁 **Estrutura do Projeto**](#-estrutura-do-projeto)
    - [👥 **Equipe do Projeto**](#-equipe-do-projeto)

---

### 📝 **Descrição do Projeto**
API para classificação automática de sentimentos (Positivo/Negativo/Neutro) em feedbacks de clientes, utilizando um modelo de Machine Learning integrado a um backend Java Spring Boot.

#### ⚙️ **Tecnologias Utilizadas**
Seguindo a arquitetura de microsserviços, adotaremos a seguinte stack:

**Backend:** 
* Java 17 + Spring Boot 3 - API /sentiment
* Spring Web (REST) - Endpoints
* OpenFeign - Cliente HTTP → Python
* H2 Database - Banco em memória
* Swagger/OpenAPI - Documentação

**Data Science:** 
* Python + Pandas + Scikit-learn - Treinar modelo
* Joblib - Persistir modelo
* FastAPI - Servidor leve para predição
* Streamlit (opcional) - Visualização

**Infra/Dev:**
* Git / GitHub (Monorepo)\
* Docker (futuro)

**Build/Deploy:**
* Oracle Cloud (futuro)



 




#### 📁 **Estrutura do Projeto**
* `/backend` - Código fonte da API Java
* `/data-science` - Notebooks e scripts de treinamento do modelo
* `/docs` - Documentação complementar

#### Visão Geral do Repositório
```
hackathon-sentimentapi-analytics
│
├── backend/                # Spring Boot (Java)
│   ├── src/...
│   └── pom.xml
│
├── data/                   # Python
│   ├── notebooks/          # Jupyter
│   ├── model/              # Modelo .joblib
│   ├── app.py              # FastAPI
│   └── requirements.txt
│
├── doc/                    # Documentação
└── README.md
```
---

### 👥 **Equipe do Projeto**
### **Backend Team**
[![Dev Backend](https://img.shields.io/badge/Backend_Dev-Amaro_Netto-red?style=for-the-badge&logo=openjdk&logoColor=white)](https://github.com/amaro-netto)
[![Dev Backend](https://img.shields.io/badge/Backend_Dev-Michele_Lescano-red?style=for-the-badge&logo=openjdk&logoColor=white)](https://github.com/MicheleLescano)
[![Dev Backend](https://img.shields.io/badge/Backend_Dev-Rodrigo_Franco-red?style=for-the-badge&logo=openjdk&logoColor=white)](https://github.com/Rshinna)

### **Data Team**
[![Data Scientist](https://img.shields.io/badge/Data_Scientist-Bruno_Ricardo-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://github.com/brunorm86)
[![Data Scientist](https://img.shields.io/badge/Data_Scientist-Alessandro_Apolinário-3776AB?style=for-the-badge&logo=python&logoColor=white)]()

---
