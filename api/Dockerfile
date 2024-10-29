# use full python image because mysqlclient requires compilation via gcc
FROM python:3.10
WORKDIR /api

# Python environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Update system packages and install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libmariadb-dev-compat \
    # Cleaning up package lists to reduce the image size
    && rm -rf /var/lib/apt/lists/*


# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the source code
COPY . .

EXPOSE 8000