document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const payload = {
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            };

            const msg = document.getElementById("msg");
            msg.textContent = "🔐 Autenticando...";
            msg.style.color = "#333";

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || "Credenciais inválidas");
                }

                const data = await res.json();

                // 🔐 Salva token JWT no localStorage
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    console.log("✅ Token salvo com sucesso!");
                }

                msg.textContent = "✅ Login realizado com sucesso!";
                msg.style.color = "green";

                setTimeout(() => {
                    window.location.href = "/src/pages/sentiment.html";
                }, 800);

            } catch (err) {
                msg.textContent = "❌ " + (err.message || "Erro ao conectar com a API");
                msg.style.color = "red";
                console.error("Login error:", err);
            }
        });
    }
});
