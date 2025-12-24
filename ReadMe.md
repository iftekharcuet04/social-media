# Social Connections Demo

> This project is a standalone demo built to showcase backend implementation for social media connections.  
> It is **not connected to any official project** and is created purely for demonstration purposes.

## Purpose

- Manage social connections (profile & page)  
- Handle access tokens and refresh tokens for social media platforms  
- Separate API request logic from business logic  
- Demonstrate upsert and cursor-based pagination for connections  
- Dockerized setup for easy deployment  

## Project Structure


```js

src/
├── common/ # Constants, utilities, interfaces
├── connection/
│ 
│ ├── connection.service.ts
│ └── connection.controller.ts
├── facebook/
│ ├── facebook.client.ts
│ └── facebook.service.ts
├── prisma/
│ └── prisma.service.ts
repository/
├── connection.repository.ts
└── base.repository.ts

```


## Features

- Facebook integration: login, get profile, get pages, post upload  
- Connection management: create, update, remove, list with pagination  
- Docker and Docker Compose support  
- PostgreSQL database  

## How to Run

```bash
# Clone the repo
git clone <repo-url>
cd social-connections-demo

# Install dependencies
npm install

# Start Docker services
docker-compose up -d

# Start the NestJS server
npm run start:dev

```


## Notes

* Instagram and LinkedIn integration will be added later.

* This project is fully independent and intended only for demonstration purposes.