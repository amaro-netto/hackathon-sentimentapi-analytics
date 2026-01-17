document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    
    if (registerForm) {
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        const genero = document.getElementById("genero");
        const estadoUf = document.getElementById("estadoUf");
        const idade = document.getElementById("idade");
        const msg = document.getElementById("msg");

        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const payload = {
                email: email.value,
                password: password.value,
                genero: genero.value,
                estadoUf: estadoUf.value,
                idade: Number(idade.value)
            };

            if (!genero.value || !estadoUf.value) {
                msg.textContent = "⚠️ Preencha todos os campos obrigatórios!";
                msg.style.color = "red";
                return;
            }

            msg.textContent = "📝 Cadastrando...";
            msg.style.color = "#333";

            try {
                const res = await fetch("http://localhost:8080/auth/register", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload)
                });

                const text = await res.text();

                if (res.ok) {
                    msg.textContent = "✅ Cadastro realizado com sucesso! Redirecionando para login...";
                    msg.style.color = "green";

                    // Redireciona para a tela de login
                    setTimeout(() => {
                        window.location.href = "/src/pages/login.html";
                    }, 1500);
                } else {
                    msg.textContent = "❌ " + (text || "Erro no cadastro");
                    msg.style.color = "red";
                }
            } catch (err) {
                msg.textContent = "❌ Erro ao conectar com a API!";
                msg.style.color = "red";
                console.error("Register error:", err);
            }
        });
    }
});
