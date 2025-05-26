# Admin Monorepo

This monorepo contains the **Admin Panel** (React/Mantine/TypeScript) and the **Auth Service** (Node.js/Express/Keycloak) for your project.

---

## Contents

- [`apps/admin`](./apps/admin): Frontend admin panel (React, Mantine, TypeScript, Vite)
- [`services/auth`](./services/auth): Authentication microservice (Node.js, Express, Keycloak)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/)
- [Keycloak](https://www.keycloak.org/) instance (for Auth Service)

---

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/your-org/your-admin-monorepo.git
cd your-admin-monorepo
```

---

### 2. Install dependencies

```sh
pnpm install
# or
npm install
```

---

### 3. Environment Variables

#### Admin Panel (`apps/admin`)

Copy `.env.example` to `.env` and set your API endpoints:

```sh
cp apps/admin/.env.example apps/admin/.env
```

Edit `apps/admin/.env` as needed.

#### Auth Service (`services/auth`)

Copy `.env.example` to `.env` and set your Keycloak and service credentials:

```sh
cp services/auth/.env.example services/auth/.env
```

Edit `services/auth/.env` with your Keycloak server URL, realm, client ID, and admin credentials.

---

## Running the Apps

### Admin Panel (Frontend)

```sh
cd apps/admin
pnpm dev
# or
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

## Building for Production

### Admin Panel

```sh
cd apps/admin
pnpm build
# or
npm run build
```

---

## Project Structure

```
monorepo/
  apps/
    admin/           # React admin panel
  services/
    auth/            # Node.js/Express auth service
  package.json
  pnpm-workspace.yaml
  ...
```

---

## Features

### Admin Panel

- User authentication (login, registration, logout)
- Car announcements CRUD
- Responsive UI with Mantine
- State management with Zustand
- Type-safe with TypeScript

---

## CORS Configuration

The Auth Service only allows requests from the gateway (`http://localhost:3000`) by default.  
If you need to allow direct frontend access (e.g., Vite dev server), add its origin to the CORS config in `services/auth/src/index.js`.

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## License

[MIT](LICENSE)

---

**Made with ❤️ using Mantine, React, TypeScript, Express, and Keycloak**