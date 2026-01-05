# ResourceScheduler

ResourceScheduler is a full-stack application for managing shared resources within families.  
It provides user authentication, family membership, role-based access, and reservation scheduling with conflict constraints.

This repository currently focuses on the **ASP.NET Core backend**, including database modeling, authentication, and API endpoints.

---

## Tech Stack

### Backend
- **ASP.NET Core Minimal APIs**
- **Entity Framework Core**
- **PostgreSQL**
- **JWT Authentication**
- **Swagger / OpenAPI**

### Frontend
- Planned: React (Vite)
- Not yet implemented

---

## Core Backend Concepts

### Users
- Authenticated using JWT
- Tokens include user ID, username, and email
- Used to enforce authorization on protected routes

### Families
- A family represents a shared group
- Users can belong to multiple families
- Memberships include roles (e.g. `owner`, `admin`, `member`)

### Family Memberships
- Join table between Users and Families
- Composite primary key: `(UserId, FamilyId)`
- Cascade deletes configured on both sides

### Invitations
- Families can invite users
- Tracks inviter, invited user, acceptance status, and timestamps

### Items & Reservations
- Families own items
- Items can be reserved by users
- Reservations enforce:
  - Foreign key relationships
  - Cascading deletes
  - Time validity (`StartTime < EndTime`)

---

## Database Design

- PostgreSQL with Entity Framework Core
- Migrations used for schema evolution
- Explicit relationship configuration via `ModelBuilder`
- Cascade deletes where appropriate
- Check constraint on reservations to prevent invalid time ranges

---

## Authentication & Authorization

- JWT-based authentication
- Protected endpoints use `[RequireAuthorization]`
- User ID is extracted from the JWT for ownership checks
- Swagger configured to support JWT authorization for testing

---

## Running the Backend Locally

### Prerequisites
- .NET SDK (9.0)
- PostgreSQL
- EF Core CLI tools

### Setup

1. Clone the repository
2. Configure your PostgreSQL connection string
3. Run migrations:
   ```bash
   dotnet ef database update
