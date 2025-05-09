# 0xFútbol ID

A full-stack application for 0xFútbol user authentication and identity management.

## Project Structure

The project is organized into three main components:

### 1. webapp/

The frontend application built with Next.js 14 and NextUI.

- **app/**: Next.js app directory with pages and routes
- **components/**: Reusable UI components
- **config/**: Configuration files
- **modules/**: Feature modules (e.g., squid integration)
- **services/**: API service integrations
- **store/**: Redux store setup with feature-based organization
- **styles/**: Global styles and theme configuration
- **types/**: TypeScript type definitions
- **utils/**: Utility functions

### 2. server/

The backend API service built with Node.js.

- **migrations/**: Database migrations using Knex
- **src/**: Source code
  - **common/**: Shared utilities and helpers
  - **repo/**: Data access layer
  - **routes/**: API endpoint definitions
  - `index.ts`: Server entry point
  - `instrument.ts`: Server instrumentation/monitoring

### 3. lib/

A shared React component library for 0xFútbol ID integration.

- **src/**: Source code
  - **components/**: Reusable React components
  - **config/**: Configuration options
  - **hooks/**: Custom React hooks
  - **providers/**: React context providers
  - **services/**: Service integrations
  - **utils/**: Utility functions
