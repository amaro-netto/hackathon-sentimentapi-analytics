document
    .getElementById("loginForm")
    .addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        const msg = document.getElementById("msg");
        msg.textContent = "Autenticando...";
        msg.style.color = "#333";

        try {
            const res = await fetch("http://localhost:8080/auth/login", {
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

            // 🔐 Salva token (se backend retornar JWT)
            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            msg.textContent = "Login realizado com sucesso!";
            msg.style.color = "green";

            setTimeout(() => {
                window.location.href = "sentiment.html";
            }, 800);

        } catch (err) {
            msg.textContent = err.message || "Erro ao conectar com a API";
            msg.style.color = "red";
        }
    });
