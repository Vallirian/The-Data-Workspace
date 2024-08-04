FROM node:20.12.0
WORKDIR /app

# Install dependencies
RUN npm install -g @angular/cli@17.2.0
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

EXPOSE 4200