import requests
import sys

def test_api():
    base_url = "http://localhost:8000"
    
    # 1. Health check
    try:
        resp = requests.get(f"{base_url}/health")
        print(f"Health Check: {resp.status_code}")
        print(f"Response: {resp.json()}\n")
    except Exception as e:
        print(f"Health check failed: {e}")
        sys.exit(1)

    # 2. Predict

    positivos = ["Eu amei este produto, é fantástico!", "Perfeito. Funciona muito bem e entrega rápida.", "Muito bonito e ótimo preço."]
    negativos = ["O produto é horrível. Odiei", "Muito ruim. Veio quebrado e atrasado", "Péssima qualidade e caro demais"]
    neutros = ["Mais ou menos", "Nada demais. Cumpre o que promete e só", "Razoável. Faz o mínimo pelo preço."]
    try:
        for texto in positivos:
            resp = requests.post(f"{base_url}/predict", json={"texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")
        
        for texto in negativos:
            resp = requests.post(f"{base_url}/predict", json={"texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

        for texto in neutros:
            resp = requests.post(f"{base_url}/predict", json={"texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

    except Exception as e:
        print(f"Predict failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_api()
