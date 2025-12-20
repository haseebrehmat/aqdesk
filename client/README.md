# AQDesk Client

The AQDesk client is a React and Vite application that provides the public website and authenticated workspace.

## Setup

Requirements: Node.js 22+ and npm. Start the Laravel server before the client.

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. The default environment forwards API requests to `http://localhost:8000`.

## Useful commands

```bash
npm run lint       # Check code quality
npm run build      # Create a production build
npm run test:a11y  # Run accessibility tests
```
