# DTech Analysis API
Made a simple REST API server as a sample project with the following technologies:

- TypeScript (NodeJS v12)
- ExpressJS
- TypeORM
- Swagger
- Postgres
- Docker

## Setup

### Prerequisites
- You need [Target Data Source](https://github.com/10pearls/dtech-target-data-source) service up and running

### Docker
- Clone the repository
- Run `docker-compose up`

### Without Docker
- Clone the repository
- Run `yarn install`
- Run `yarn typeorm migration:run`*
- Run `yarn watch`*

\* You need to set environment variables to provide configuration for database connection. Please see `src/config.ts` for environment variable names.

---

The API will be served at http://localhost:3200/ and the documentation must be accessible at http://localhost:3001/.
