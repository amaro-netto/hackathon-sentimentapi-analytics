document.addEventListener("DOMContentLoaded", () => {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#666';

    let sentimentChartInstance = null;
    let regionChartInstance = null;
    let demographicsChartInstance = null;
    let evolutionChartInstance = null;

    updateDashboard();

    document.getElementById("btnApplyFilters").addEventListener("click", () => {
        const btn = document.getElementById("btnApplyFilters");
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
        
        setTimeout(() => {
            updateDashboard();
            btn.innerHTML = originalText;
        }, 600);
    });
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateDashboard() {
    updateKPIs();
    renderSentimentChart();
    renderRegionChart();
    renderDemographicsChart();
    renderEvolutionChart();
}

function updateKPIs() {
    document.getElementById("kpiTotal").innerText = getRandomInt(1500, 8000).toLocaleString();
    document.getElementById("kpiPositive").innerText = getRandomInt(45, 80) + "%";
    
    // Regiões do Brasil
    const regions = ["Sudeste", "Nordeste", "Sul", "Centro-Oeste", "Norte"];
    document.getElementById("kpiRegion").innerText = regions[getRandomInt(0, 4)];
    
    const trend = getRandomInt(-5, 25);
    const trendEl = document.getElementById("kpiTrend");
    trendEl.innerText = (trend > 0 ? "+" : "") + trend + "%";
    trendEl.style.color = trend >= 0 ? "#2ecc71" : "#e74c3c";
}

// 1. Sentimentos (Pizza) - Já tinha os 3, mantido.
function renderSentimentChart() {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    const pos = getRandomInt(40, 60);
    const neg = getRandomInt(10, 25);
    const neu = 100 - pos - neg;

    if(sentimentChartInstance) sentimentChartInstance.destroy();

    sentimentChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positivo', 'Negativo', 'Neutro'],
            datasets: [{
                data: [pos, neg, neu],
                backgroundColor: ['#2ecc71', '#e74c3c', '#3498db'],
                borderWidth: 0, hoverOffset: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } }
        }
    });
}

// 2. Regiões (Barras) - CORRIGIDO PARA REGIÕES DO BRASIL
function renderRegionChart() {
    const ctx = document.getElementById('regionChart').getContext('2d');
    
    // Dados simulados maiores para Sudeste/Nordeste (comum no Brasil)
    const data = [
        getRandomInt(400, 800), // Sudeste
        getRandomInt(300, 600), // Nordeste
        getRandomInt(200, 400), // Sul
        getRandomInt(100, 300), // Centro-Oeste
        getRandomInt(50, 200)   // Norte
    ];
    
    if(regionChartInstance) regionChartInstance.destroy();

    regionChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sudeste', 'Nordeste', 'Sul', 'Centro-Oeste', 'Norte'],
            datasets: [{
                label: 'Volume',
                data: data,
                backgroundColor: ['#0061ff', '#00c6ff', '#9b59b6', '#f39c12', '#2ecc71'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

// 3. Demografia (Polar) - CORRIGIDO PARA TODOS OS GÊNEROS
function renderDemographicsChart() {
    const ctx = document.getElementById('demographicsChart').getContext('2d');
    
    if(demographicsChartInstance) demographicsChartInstance.destroy();

    demographicsChartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
            // Labels iguais ao cadastro
            labels: ['Masculino', 'Feminino', 'Não-Binário', 'Outro', 'Ñ Informado'],
            datasets: [{
                label: 'Volume',
                data: [
                    getRandomInt(300, 500), // M
                    getRandomInt(300, 500), // F
                    getRandomInt(20, 80),   // NB
                    getRandomInt(10, 50),   // Outro
                    getRandomInt(30, 100)   // NI
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)', // M (Azul)
                    'rgba(255, 99, 132, 0.7)', // F (Rosa)
                    'rgba(153, 102, 255, 0.7)', // NB (Roxo)
                    'rgba(255, 206, 86, 0.7)',  // Outro (Amarelo)
                    'rgba(201, 203, 207, 0.7)'  // NI (Cinza)
                ]
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } }
        }
    });
}

// 4. Evolução (Linha) - CORRIGIDO: ADICIONADO NEUTRO
function renderEvolutionChart() {
    const ctx = document.getElementById('evolutionChart').getContext('2d');
    
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    
    if(evolutionChartInstance) evolutionChartInstance.destroy();

    evolutionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Positivo',
                    data: labels.map(() => getRandomInt(100, 300)),
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    fill: true, tension: 0.4
                },
                {
                    label: 'Negativo',
                    data: labels.map(() => getRandomInt(20, 100)),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    fill: true, tension: 0.4
                },
                {
                    label: 'Neutro', // Nova Linha
                    data: labels.map(() => getRandomInt(30, 80)),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true, tension: 0.4
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { position: 'top' } }
        }
    });
}