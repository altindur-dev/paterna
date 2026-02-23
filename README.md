# Paterna - Product Landing Web (.NET Backend)

This project is a simple landing page web app that sells architecture-inspired products, with login/signup support and a .NET backend.

## Features
- Product listing landing page
- Login and signup forms
- In-memory auth and products API
- Static frontend served by ASP.NET Core

## Architecture
This implementation follows **Hexagonal + Onion Architecture**:

- **Domain (`Paterna.Domain`)**: core entities (`Product`, `User`).
- **Application (`Paterna.Application`)**: use-cases and ports (interfaces).
- **Infrastructure (`Paterna.Infrastructure`)**: adapters for repositories and hashing/token mechanisms.
- **API (`Paterna.Api`)**: delivery layer exposing HTTP endpoints and static site.

### Serverless-ready path
To move this into **Serverless Architecture**, keep Domain/Application unchanged and replace API+Infrastructure adapters with:
- Azure Functions / AWS Lambda HTTP handlers
- managed identity provider + database adapters

## Design Patterns used
- **Creational**: Factory pattern via `ITokenFactory` and concrete `BasicTokenFactory`.
- **Structural**: Adapter pattern in Infrastructure repositories implementing Application ports.
- **Behavioral**: Strategy pattern through interchangeable `IPasswordHasher` implementations.

## API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/products`

## Run
```bash
dotnet run --project src/Paterna.Api
```
Then open `http://localhost:5000` (or shown port).
