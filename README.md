
# Processly
codename: Arc  
lastest active version: `v0.7.1-beta`  

Processly, powered by Gemini, is a small business management tool that reduces time and cost for business management setup, analysis, and onboarding.

## Table of Contents

- [Introduction](#introduction)
- [Technologies](#technologies)
- [Setup](#setup)
  - [Files](#files)
  - [Docker](#docker)
- [Usage](#usage)
- [Development](#development)
  - [Frontend (Angular)](#frontend-angular)
  - [Backend (Django)](#backend-django)

## Introduction
Running a small business often means juggling multiple tools and responsibilities, leaving little time for growth. The average small business uses 50 to 70 apps just to stay operational—a costly and time-consuming reality. Enter Processly, an AI-powered business management tool designed to streamline your operations, reduce costs, and help you focus on what really matters. From effortless data analysis to seamless onboarding and smooth growth transitions, Processly is your all-in-one solution for managing and scaling your business with ease.

## Technologies

- **Angular**: 17.2.0
- **Django**: 5.0
- **Docker**: 3.x

## Setup
#### Files
- create `.env` file in `services/docker`
- crate `/environments` for Angular in `webapp/src`

### Docker

Instructions to build and run the application using Docker.

```bash
cd services/docker
docker compose build --no-cahce
docker compose up
```

Access Angular frontend at `http://localhost:4200`

## Usage
Docker compose in `services/docker/docker-compose.yaml` is setup to run three services: Angular (frontend), Django (backend), and MySQL (database).

To run scripts on specific services use 

```bash
docker compose exec -it <service-name> [commands]
```

## Development

### Frontend (Angular)

Instructions for working in the Angular part of the project:
- How to run the development server
```bash
ng serve
```

- How to build for production
```bash
ng build --prod
```

### Backend (Django)

Instructions for working in the Django part of the project:
- Running the development server
```bash
python manage.py runserver
```

- Applying migrations

```bash
python manage.py makemigrations
python manage.py migrate
```
