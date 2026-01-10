const email = document.getElementById("email");
const password = document.getElementById("password");
const genero = document.getElementById("genero");
const estadoUf = document.getElementById("estadoUf");
const idade = document.getElementById("idade");
const msg = document.getElementById("msg");


document.getElementById("registerForm")
.addEventListener("submit",async(e)=>{
    e.preventDefault();

    const payload = {
        email: email.value,
        password: password.value,
        genero: genero.value,
        estadoUf: estadoUf.value,
        idade: Number(idade.value)
    };

    msg.textContent = "Cadastrando...";
    msg.style.color = "#333";

    try{
        const res = await fetch("http://localhost:8080/auth/register",{
            method: "POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(payload)
        });

        const text = await res.text();

        if(res.ok){
            msg.textContent = "Cadastro realizado com sucesso!";
            msg.style.color = "green";

            // Redireciona para a tela de login
            setTimeout(() =>{
                window.location.href = "index.html";
            },1000);
        }else{
            msg.textContent = text || "Erro no cadastro";
            msg.style.color = "red";
        }
    }catch (err) {
        msg.textContent = "Erro ao conectar com a API!";
        msg.style.color = "red";
    }
});
