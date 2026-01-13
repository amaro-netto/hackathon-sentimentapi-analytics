# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Set the working directory in the container
WORKDIR /code

# Install system dependencies required to build Python packages from source
# This is necessary because some of your libraries (like datasets 2.16.1)
# do not have pre-built wheels for Python 3.13 yet.
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /code
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# Using --no-cache-dir to keep image size down
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /code
COPY app ./app
COPY models ./models

# Set the working directory to where the app is
WORKDIR /code/app

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run app.py when the container launches
CMD ["python", "app_v2.py"]