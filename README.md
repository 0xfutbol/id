# 0xFútbol ID

A full-stack application for 0xFútbol user authentication and identity management.

## Project Structure

The project is organized into three main components:

### 1. webapp/

The frontend application built with Next.js 14 and NextUI.

- **app/**: Next.js app directory with pages and routes
- **components/**: Reusable UI components
  - `auth-form.tsx`: Authentication form component for login/signup
  - `auth-guard.tsx`: Component to protect routes that require authentication
  - `gallery.tsx` and `gallery-card.tsx`: Components for displaying user galleries
  - `loading-screen.tsx`: Loading indicator component
  - `navbar.tsx`: Navigation bar component
  - `primitives.ts`: Basic UI primitives and shared styling
  - `user-profile.tsx`: Component for displaying and editing user profiles
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

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm, yarn, or pnpm
- PostgreSQL database (for server)

### Setting Up the Frontend (webapp)

1. Navigate to the webapp directory:
   ```
   cd webapp
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a `.env.local` file with required environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   # Add other environment variables as needed
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Setting Up the Backend (server)

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a `.env` file with required environment variables:
   ```
   PORT=3001
   DATABASE_URL=postgresql://user:password@localhost:5432/msid
   # Add other environment variables as needed
   ```

4. Set up the database:
   ```
   npx knex migrate:latest
   ```

5. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

### Using the Shared Library (lib)

1. Navigate to the lib directory:
   ```
   cd lib
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Build the library:
   ```
   npm run build
   # or
   yarn build
   # or
   pnpm build
   ```

4. To use the library in the webapp or other projects:
   ```
   npm link
   # Then in the webapp directory:
   cd ../webapp
   npm link @0xfutbol/id
   ```

## Component Guide

### Frontend Components (webapp/components)

- **AuthForm**: Handles user login and registration with form validation
  ```jsx
  import { AuthForm } from '@/components/auth-form';
  
  <AuthForm mode="login" onSuccess={handleSuccess} />
  ```

- **AuthGuard**: Protects routes that require authentication
  ```jsx
  import { AuthGuard } from '@/components/auth-guard';
  
  <AuthGuard>
    <ProtectedContent />
  </AuthGuard>
  ```

- **Navbar**: Main navigation component
  ```jsx
  import { Navbar } from '@/components/navbar';
  
  <Navbar />
  ```

- **UserProfile**: Displays and allows editing of user information
  ```jsx
  import { UserProfile } from '@/components/user-profile';
  
  <UserProfile userId="123" editable={true} />
  ```

- **Gallery/GalleryCard**: Display collections and items
  ```jsx
  import { Gallery } from '@/components/gallery';
  
  <Gallery items={items} />
  ```

### Backend Routes (server/src/routes)

The server provides RESTful API endpoints for:
- User authentication (login, register, logout)
- User profile management
- Asset and collection management

### Library Components (lib/src)

The shared library provides:
- Authentication providers
- React hooks for common operations
- UI components that can be used across applications

## Development Workflow

1. Make changes to the shared library when needed
2. Build the library: `cd lib && npm run build`
3. Develop the frontend and backend in parallel
4. Test integration locally
5. Deploy the frontend and backend to their respective environments

## License

[License information] 