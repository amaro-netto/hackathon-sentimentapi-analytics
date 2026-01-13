# How to Publish app.py to Oracle Cloud (OCI)

This guide will walk you through deploying your FastAPI application to Oracle Cloud Infrastructure (OCI) using **Container Instances**. This is often the simplest "serverless" way to run containers on OCI.

## Prerequisites
1.  **Oracle Cloud Account**: A Free Tier account works.
2.  **Docker Desktop** (or Docker CLI) installed locally.
3.  **OCI CLI** (Optional but helpful) or access to the **Oracle Cloud Console** (web browser).

---

## Step 1: Build the Docker Image Locally

I have already created a `Dockerfile` in your `data/` folder. Open a terminal in `c:\Users\s050741159\Desktop\hackathon-sentimentapi-analytics\data` and run:

```powershell
docker build -t sentiment-api:v1 .
```

Test it locally to make sure it works:
```powershell
docker run -p 8000:8000 sentiment-api:v1
```
Open `http://localhost:8000/health` in your browser. You should see `{"status": "online", ...}`.

---

## Step 2: Push Image to Oracle Cloud Container Registry (OCIR)

1.  **Log in to Oracle Cloud Console**.
2.  Navigate to **Developer Services** -> **Container Registry**.
3.  **Create a Repository**:
    *   Click **Create Repository**.
    *   Repository Name: `sentiment-api`.
    *   Access: **Public** (Easiest for testing) or **Private** (requires ensuring policies allow the container instance to pull). Let's assume **Public** for this guide to simplify authentication.
4.  **Login to Docker** (on your machine):
    *   In the Oracle Console, viewing your new repository, look for "Actions" or "Push commands" to get the exact login command. It typically looks like:
        ```powershell
        docker login <region-code>.ocir.io
        ```
    *   You will need your **Username** (defaults to `<tenancy-namespace>/<username>`) and an **Auth Token** (NOT your password).
    *   *To get an Auth Token*: User Menu (top right) -> My Profile -> API Keys / Auth Tokens -> Generate Token. Copy it!

5.  **Tag and Push**:
    ```powershell
    # Tag your local image
    # Replace <region-code> and <tenancy-namespace> with your actual values from the console
    docker tag sentiment-api:v1 <region-code>.ocir.io/<tenancy-namespace>/sentiment-api:v1

    # Push to OCIR
    docker push <region-code>.ocir.io/<tenancy-namespace>/sentiment-api:v1
    ```

---

## Step 3: Deploy to OCI Container Instance

1.  Navigate to **Developer Services** -> **Container Instances**.
2.  Click **Create Container Instance**.
3.  **Configure Basics**:
    *   Name: `sentiment-api-instance`.
    *   Compartment: Choose your compartment.
    *   Availability Domain: Pick any.
    *   Shape: The default (Ampere A1 or E4 Flex) is fine. 1 OCPU and 4GB RAM is plenty.
4.  **Networking**:
    *   Choose an existing VCN and Subnet.
    *   **Important**: Ensure the Subnet is **Public** and has a Security List allowing ingress on port **8000** (or allow all traffic for testing).
    *   Assign a public IPv4 address: **Yes**.
5.  **Image Configuration**:
    *   Click **Select Image**.
    *   Source: **OCIR**.
    *   Select the `sentiment-api` image you just pushed.
6.  **Environment & Ports** (in the "Configure image" dialog):
    *   You shouldn't need environment variables unless your app needs them (e.g. API keys).
    *   **IMPORTANT**: Are there any "Advanced" options to expose ports? Usually, Container Instances expose all ports, but check security lists.
7.  **Review and Create**.

---

## Step 4: Access Your App

1.  Wait for the instance status to turn **Active**.
2.  Copy the **Public IP Address** shown in the instance details.
3.  Test your API:
    *   `http://<PUBLIC_IP>:8000/health`
    *   `http://<PUBLIC_IP>:8000/docs` (Interactive Swagger UI)

---

## Troubleshooting

- **504 Gateway Timeout / Connection Refused**: Check your **VCN Security List** (Firewall). You must allow TCP traffic on port 8000 from `0.0.0.0/0`.
- **Image Pull Error**: Ensure your OCIR repository is **Public**, or if Private, that you have set up the correct IAM policies for the instance to pull the image.
