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

    positivos_pt = ["Eu amei este produto, é fantástico!", "Perfeito. Funciona muito bem e entrega rápida.",
                    "Muito bonito e ótimo preço."]
    negativos_pt = ["O produto é horrível. Odiei", "Muito ruim. Veio quebrado e atrasado", "Péssima qualidade e caro demais"]
    neutros_pt = ["Mais ou menos", "Nada demais. Cumpre o que promete e só", "Razoável. Faz o mínimo pelo preço."]
    try:
        for texto in positivos_pt:
            resp = requests.post(f"{base_url}/predict", json={"lang":"pt", "texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")
        
        for texto in negativos_pt:
            resp = requests.post(f"{base_url}/predict", json={"lang":"pt", "texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

        for texto in neutros_pt:
            resp = requests.post(f"{base_url}/predict", json={"lang":"pt", "texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

    except Exception as e:
        print(f"Predict failed: {e}")
        sys.exit(1)

    positivos_es = ["¡Me encantó este producto, es fantástico!", "Perfecto. Funciona muy bien y la entrega fue rápida.", "Muy bonito y a un precio excelente."]
    negativos_es = ["El producto es pésimo. Lo odié", "Muy malo. Llegó roto y tarde", "Pésima calidad y demasiado caro"]
    neutros_es = ["Regular", "Nada del otro mundo. Cumple lo que promete y punto", "Regular. Cumple con lo mínimo por el precio"]
    try:
        for texto in positivos_es:
            resp = requests.post(f"{base_url}/predict", json={"lang":"es", "texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

        for texto in negativos_es:
            resp = requests.post(f"{base_url}/predict", json={"lang":"es", "texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

        for texto in neutros_es:
            resp = requests.post(f"{base_url}/predict", json={"lang":"es", "texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

    except Exception as e:
        print(f"Predict failed: {e}")
        sys.exit(1)

    try:
        for texto in positivos_pt + positivos_es:
            resp = requests.post(f"{base_url}/predict", json={"lang":"","texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

        for texto in negativos_pt + negativos_es:
            resp = requests.post(f"{base_url}/predict", json={"lang":"","texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

        for texto in neutros_pt + neutros_es:
            resp = requests.post(f"{base_url}/predict", json={"lang":"","texto": texto})
            print(texto)
            print(f"Response: {resp.json()}\n")

    except Exception as e:
        print(f"Predict failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_api()
