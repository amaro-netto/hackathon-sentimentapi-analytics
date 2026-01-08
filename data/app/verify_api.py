import requests
import sys

def test_api():
    base_url = "http://localhost:8000"
    
    # 1. Health check
    try:
        resp = requests.get(f"{base_url}/")
        print(f"Health Check: {resp.status_code}")
        print(f"Response: {resp.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
        sys.exit(1)

    # 2. Predict
    try:
        data = {"texto": "Eu amei este produto, é fantástico!"}
        resp = requests.post(f"{base_url}/predict", json=data)
        print(f"Predict (Positivo): {resp.status_code}")
        print(f"Response: {resp.json()}")
        
        data_neg = {"texto": "O produto é horrível, odiei."}
        resp = requests.post(f"{base_url}/predict", json=data_neg)
        print(f"Predict (Negativo): {resp.status_code}")
        print(f"Response: {resp.json()}")
    except Exception as e:
        print(f"Predict failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_api()
