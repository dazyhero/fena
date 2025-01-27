# Fena Frontend Application

A Next.js application for email job management and scheduling.

### Prerequisites

- Node.js
- npm/yarn
- Docker (optional)

### Local Development Setup

1. **Install dependencies**

```bash
npm install
# or
yarn install
```

2. Start the development server\*\*

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Docker Setup

1. **Build the image**

```bash
docker build -t fena-frontend .
```

2. **Run the container**

```bash
docker run -p 3000:3000 fena-frontend
```
