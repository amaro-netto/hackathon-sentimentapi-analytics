document.addEventListener("DOMContentLoaded", () => {
    // 1. Definição do Navbar (Cabeçalho)
    const navbarHTML = `
        <nav class="app-navbar">
            <div class="nav-brand">
                <i class="fas fa-brain"></i> InsightSent
            </div>

            <div class="nav-menu">
                <a href="sentiment.html" class="nav-link" id="link-sentiment">
                    <i class="fas fa-comment-dots"></i> Análise
                </a>
                <a href="dashboard.html" class="nav-link" id="link-dashboard">
                    <i class="fas fa-chart-pie"></i> Dashboard
                </a>
            </div>

            <div class="nav-actions">
                <button onclick="logout()" class="btn-logout">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </button>
            </div>
        </nav>
    `;

    // 2. Definição do Footer (Rodapé)
    const footerHTML = `
        <footer class="app-footer">
            <p>&copy; 2026 InsightSent - Sistema de Inteligência de Dados.</p>
            <p style="font-size: 0.8em; opacity: 0.7;">Desenvolvido por DevstechOne</p>
        </footer>
    `;

    // 3. Injetar o HTML nos lugares certos (se os elementos existirem na página)
    const headerPlaceholder = document.getElementById("app-header-placeholder");
    const footerPlaceholder = document.getElementById("app-footer-placeholder");

    if (headerPlaceholder) headerPlaceholder.innerHTML = navbarHTML;
    if (footerPlaceholder) footerPlaceholder.innerHTML = footerHTML;

    // 4. Lógica para "Acender" o link da página atual
    const path = window.location.pathname;
    if (path.includes("sentiment.html")) {
        document.getElementById("link-sentiment")?.classList.add("active");
    } else if (path.includes("dashboard.html")) {
        document.getElementById("link-dashboard")?.classList.add("active");
    }
});