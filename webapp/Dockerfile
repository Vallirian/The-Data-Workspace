FROM node:20.12.0
WORKDIR /app

# Install dependencies
COPY package*.json .
RUN npm install -g @angular/cli@17.2.1

# Copy the source code
RUN npm install
COPY . .

EXPOSE 4200