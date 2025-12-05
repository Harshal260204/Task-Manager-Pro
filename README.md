# Task Manager Pro

A full-stack task management application built with a mono-repo structure.

## Project Structure

```
Task-Manager-Pro/
├── backend/          # Backend API server
├── web/              # Web frontend (React + Vite)
├── mobile/           # Mobile application
├── .gitignore        # Git ignore rules
├── .eslintrc.json    # ESLint configuration
├── .prettierrc.json  # Prettier configuration
└── README.md         # This file
```

## Backend

The backend is a Node.js server providing the API for the Task Manager Pro application.

### Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Start the production server:
   ```bash
   npm start
   ```

### Environment Variables

See `.env.example` for required environment variables.

## Web

The web frontend is built with React and Vite for a fast development experience.

### Setup

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

The development server will start on `http://localhost:5173` by default.

## Mobile

The mobile application (to be configured based on your mobile framework choice).

### Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Start the production server:
   ```bash
   npm start
   ```

## Development

### Code Quality

This project uses ESLint and Prettier for code quality and formatting.

- **ESLint**: Linting rules for JavaScript/React
- **Prettier**: Code formatting

Run linting:
```bash
npx eslint .
```

Format code:
```bash
npx prettier --write .
```

## License

ISC

