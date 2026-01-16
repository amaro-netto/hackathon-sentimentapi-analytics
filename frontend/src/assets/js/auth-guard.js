// 🔐 Verificação de Token
function checkTokenAndRedirect() {
    const currentPage = window.location.pathname;
    const token = localStorage.getItem("token");
    
    // Páginas públicas (Raiz, Index e Cadastro)
    const publicPages = ["/index.html", "/", "/src/pages/register.html"];
    
    // Verifica se a página atual é pública
    // (O .some verifica se alguma das urls acima faz parte do endereço atual)
    const isPublicPage = publicPages.some(page => currentPage.endsWith(page) || currentPage === "/");
    
    // Se a página NÃO é pública e NÃO tem token -> Chuta para o Login (Raiz)
    if (!isPublicPage && !token) {
        // Removemos o alert para não ficar chato, ou pode manter se preferir
        window.location.href = "/"; 
    }
}

document.addEventListener("DOMContentLoaded", checkTokenAndRedirect);

// 🔓 Função de Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "/"; // Volta para a raiz
}

// 📌 Botão Sair (mantido igual)
document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    // Só mostra botão sair se NÃO estivermos na tela de login
    const isLoginPage = window.location.pathname === "/" || window.location.pathname.includes("index.html");

    if (header && localStorage.getItem("token") && !isLoginPage) {
        const logoutBtn = document.createElement("button");
        logoutBtn.id = "logoutBtn";
        logoutBtn.className = "logout-btn"; // Certifique-se de ter estilo para isso ou use class="btn"
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
        logoutBtn.style.marginLeft = "10px"; // Ajuste visual rápido
        logoutBtn.style.cursor = "pointer";
        logoutBtn.onclick = logout;
        header.appendChild(logoutBtn);
    }
});