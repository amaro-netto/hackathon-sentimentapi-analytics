const API_URL = "${window.location.protocol}//${window.location.hostname}:8080";

document.addEventListener("DOMContentLoaded", () => {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#666';

    checkAuthAndLoadDashboard();

    document.getElementById("btnApplyFilters").addEventListener("click", () => {
        loadDashboardData();
    });
});

function checkAuthAndLoadDashboard() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../../index.html";
        return;
    }
    loadDashboardData();
}

async function loadDashboardData() {
    const btn = document.getElementById("btnApplyFilters");
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';
    btn.disabled = true;

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Falha ao buscar dados");

        const data = await response.json();
        const filteredData = applyFilters(data);
        
        updateKPIs(filteredData);
        renderCharts(filteredData);

    } catch (error) {
        console.error("Erro Dashboard:", error);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function applyFilters(data) {
    // 1. Pegar valores dos inputs
    const dateStartVal = document.getElementById("dateStart").value;
    const dateEndVal = document.getElementById("dateEnd").value;
    const region = document.getElementById("filterRegion").value;
    const gender = document.getElementById("filterGender").value; 
    const sentimentFilter = document.getElementById("filterSentiment").value;

    return data.filter(item => {
        // Normalização dos dados (suporta DTO novo e antigo)
        const sent = item.previsao || item.sentiment || "";
        const dateRaw = item.dataAnalise || item.createdAt || item.data_hora;
        const user = item.usuario || item.user || {}; 
        const uf = user.estado_uf || user.estado || "N/A";
        const gen = user.genero || user.gender || "N/A";

        // --- FILTRO DE DATA (RANGE) ---
        if (dateRaw) {
            const itemDate = new Date(dateRaw);
            itemDate.setHours(0,0,0,0);

            if (dateStartVal) {
                const startDate = new Date(dateStartVal);
                startDate.setHours(0,0,0,0); 
                if (itemDate < startDate) return false;
            }
            if (dateEndVal) {
                const endDate = new Date(dateEndVal);
                endDate.setHours(23,59,59,999);
                if (itemDate > endDate) return false;
            }
        }

        // --- FILTRO DE REGIÃO ---
        if (region !== "ALL" && !isRegionMatch(uf, region)) return false;

        // --- FILTRO DE GÊNERO ---
        if (gender !== "ALL") {
            if (gen.toLowerCase() !== gender.toLowerCase()) return false;
        }

        // --- FILTRO DE SENTIMENTO ---
        const s = sent.toLowerCase();
        if (sentimentFilter === "POS" && !s.includes("positiv")) return false;
        if (sentimentFilter === "NEG" && !s.includes("negativ")) return false;
        if (sentimentFilter === "NEU" && !s.includes("neutr")) return false;

        return true;
    });
}

function isRegionMatch(uf, regionFilter) {
    const regions = {
        "SE": ["SP", "RJ", "MG", "ES"],
        "S":  ["RS", "SC", "PR"],
        "NE": ["BA", "PE", "CE", "MA", "PB", "RN", "AL", "PI", "SE"],
        "CO": ["DF", "GO", "MT", "MS"],
        "N":  ["AM", "PA", "AC", "RO", "RR", "AP", "TO"]
    };
    return regions[regionFilter] ? regions[regionFilter].includes(uf) : false;
}

// ======================================================
// 1. UPDATE KPIs (AGORA COM CÁLCULO REAL DE CRESCIMENTO)
// ======================================================
function updateKPIs(data) {
    // Total Geral
    document.getElementById("kpiTotal").innerText = data.length.toLocaleString();
    
    // Positividade
    const positives = data.filter(d => (d.previsao||d.sentiment||"").toLowerCase().includes("positiv")).length;
    const percent = data.length > 0 ? ((positives / data.length) * 100).toFixed(1) : 0;
    document.getElementById("kpiPositive").innerText = percent + "%";

    // Região Destaque
    const counts = {};
    data.forEach(d => {
        const u = d.usuario || d.user || {};
        const uf = u.estado_uf || u.estado || "N/A";
        counts[uf] = (counts[uf] || 0) + 1;
    });
    
    // Pega a maior ou mostra traço
    const topRegion = Object.keys(counts).length > 0 
        ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) 
        : "--";
    document.getElementById("kpiRegion").innerText = topRegion;

    // --- CÁLCULO DE CRESCIMENTO (MÊS ATUAL vs ANTERIOR) ---
    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();

    let countThisMonth = 0;
    let countLastMonth = 0;

    data.forEach(d => {
        const raw = d.createdAt || d.dataAnalise || d.data_hora;
        if (!raw) return;
        const date = new Date(raw);

        // Mês Atual
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            countThisMonth++;
        }

        // Mês Passado (Trata virada de ano)
        const isLastMonth = (currentMonth === 0) 
            ? (date.getMonth() === 11 && date.getFullYear() === currentYear - 1)
            : (date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear);
            
        if (isLastMonth) countLastMonth++;
    });

    let growth = 0;
    if (countLastMonth > 0) {
        growth = ((countThisMonth - countLastMonth) / countLastMonth) * 100;
    } else if (countThisMonth > 0) {
        growth = 100; // Se antes era 0 e agora tem, cresceu 100%
    }

    const elTrend = document.getElementById("kpiTrend");
    const val = growth.toFixed(0);

    if (growth > 0) {
        elTrend.innerHTML = `<i class="fas fa-arrow-up"></i> +${val}%`;
        elTrend.style.color = "#2ecc71";
    } else if (growth < 0) {
        elTrend.innerHTML = `<i class="fas fa-arrow-down"></i> ${val}%`;
        elTrend.style.color = "#e74c3c";
    } else {
        elTrend.innerHTML = `<i class="fas fa-minus"></i> 0%`;
        elTrend.style.color = "#f39c12";
    }
}

// --- CONFIGURAÇÃO DOS GRÁFICOS ---
let charts = {};

function destroyChart(id) {
    if (charts[id]) charts[id].destroy();
}

function renderCharts(data) {
    renderSentimentChart(data);
    renderRegionChart(data);
    renderDemographicsChart(data);
    renderEvolutionChart(data);
    renderStackedStateChart(data);
}

// 1. Pizza
function renderSentimentChart(data) {
    destroyChart('sentimentChart');
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    let pos = 0, neg = 0, neu = 0;
    data.forEach(d => {
        const s = (d.previsao || d.sentiment || "").toLowerCase();
        if(s.includes("positiv")) pos++;
        else if(s.includes("negativ")) neg++;
        else neu++;
    });

    charts['sentimentChart'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positivo', 'Negativo', 'Neutro'],
            datasets: [{
                data: [pos, neg, neu],
                backgroundColor: ['#2ecc71', '#e74c3c', '#3498db']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 2. Barras (Contagem Simples por UF)
function renderRegionChart(data) {
    destroyChart('regionChart');
    const ctx = document.getElementById('regionChart').getContext('2d');
    const counts = {};
    data.forEach(d => {
        const u = d.usuario || d.user || {};
        const uf = u.estado_uf || u.estado || "N/I";
        counts[uf] = (counts[uf] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 5);
    
    charts['regionChart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(x => x[0]),
            datasets: [{
                label: 'Total Avaliações',
                data: sorted.map(x => x[1]),
                backgroundColor: '#0061ff',
                borderRadius: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 3. Demográfico
function renderDemographicsChart(data) {
    destroyChart('demographicsChart');
    const ctx = document.getElementById('demographicsChart').getContext('2d');
    const counts = {};
    data.forEach(d => {
        const u = d.usuario || d.user || {};
        const g = u.genero || u.gender || "Outro";
        counts[g] = (counts[g] || 0) + 1;
    });

    charts['demographicsChart'] = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#36a2eb', '#ff6384', '#cc65fe']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ======================================================
// 4. EVOLUÇÃO (AGORA COM LINHA NEUTRA)
// ======================================================
function renderEvolutionChart(data) {
    destroyChart('evolutionChart');
    const ctx = document.getElementById('evolutionChart').getContext('2d');
    const timeline = {};

    data.forEach(d => {
        const raw = d.createdAt || d.dataAnalise || d.data_hora;
        if(!raw) return;
        
        // Cria chave DD/MM
        const dateObj = new Date(raw);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dateKey = `${day}/${month}`;
        
        if(!timeline[dateKey]) timeline[dateKey] = { pos: 0, neg: 0, neu: 0 };
        
        const s = (d.previsao || d.sentiment || "").toLowerCase();
        if(s.includes("positiv")) timeline[dateKey].pos++;
        else if(s.includes("negativ")) timeline[dateKey].neg++;
        else timeline[dateKey].neu++; // <--- Contando Neutro
    });

    // Ordena as datas corretamente
    const labels = Object.keys(timeline).sort((a, b) => {
        const [dA, mA] = a.split('/').map(Number);
        const [dB, mB] = b.split('/').map(Number);
        return (mA - mB) || (dA - dB);
    });

    charts['evolutionChart'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Positivo',
                    data: labels.map(l => timeline[l].pos),
                    borderColor: '#2ecc71',
                    tension: 0.4
                },
                {
                    label: 'Negativo',
                    data: labels.map(l => timeline[l].neg),
                    borderColor: '#e74c3c',
                    tension: 0.4
                },
                { // <--- NOVA LINHA AZUL (NEUTRO)
                    label: 'Neutro',
                    data: labels.map(l => timeline[l].neu),
                    borderColor: '#3498db',
                    tension: 0.4
                }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 5. BARRAS EMPILHADAS (Sentimento x Estado)
function renderStackedStateChart(data) {
    destroyChart('stackedStateChart');
    const ctx = document.getElementById('stackedStateChart').getContext('2d');

    const stateData = {};

    data.forEach(d => {
        const u = d.usuario || d.user || {};
        const uf = u.estado_uf || u.estado || "N/A";
        const s = (d.previsao || d.sentiment || "").toLowerCase();

        if (!stateData[uf]) stateData[uf] = { pos: 0, neg: 0, neu: 0 };

        if (s.includes("positiv")) stateData[uf].pos++;
        else if (s.includes("negativ")) stateData[uf].neg++;
        else stateData[uf].neu++;
    });

    const sortedStates = Object.keys(stateData).sort((a, b) => {
        const totalA = stateData[a].pos + stateData[a].neg + stateData[a].neu;
        const totalB = stateData[b].pos + stateData[b].neg + stateData[b].neu;
        return totalB - totalA; 
    }).slice(0, 8); 

    charts['stackedStateChart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedStates,
            datasets: [
                {
                    label: 'Positivo',
                    data: sortedStates.map(uf => stateData[uf].pos),
                    backgroundColor: '#2ecc71'
                },
                {
                    label: 'Neutro',
                    data: sortedStates.map(uf => stateData[uf].neu),
                    backgroundColor: '#3498db'
                },
                {
                    label: 'Negativo',
                    data: sortedStates.map(uf => stateData[uf].neg),
                    backgroundColor: '#e74c3c'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
}