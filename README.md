# Pre-Adjudication Matrix Configuration Demo

A modern web application for configuring and managing pre-adjudication matrices in the criminal justice system. This tool helps standardize decision-making processes by providing a user-friendly interface for setting up and maintaining adjudication rules.

## Features

- **User Authentication**: Secure login and signup system using Supabase
- **Matrix Configuration**: Interactive interface for setting up adjudication rules
- **Admin Dashboard**: Administrative controls for managing system settings
- **Real-time Updates**: Immediate reflection of configuration changes
- **Batch Processing**: Support for batch decision processing

## Technical Stack

- **Frontend**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.0
- **Backend as a Service**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Styling**: CSS Modules
- **Testing**: K6 for load testing
- **Containerization**: Docker

## Project Structure

```
├── src/                  # Source code
│   ├── components/       # React components
│   ├── context/         # React context providers
│   └── pages/           # Page components
├── migrations/          # Database migrations
├── docker/             # Docker configuration
└── load-tests/         # K6 load testing scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (included with Node.js)
- Docker (optional, for containerized development)

### Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env.local` file at the project root with the following variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Docker Support

The project includes Docker configuration for different environments:

- `Dockerfile.frontend`: Development environment
- `Dockerfile.frontend-runtime`: Production runtime
- `Dockerfile.k6`: Load testing environment

To run using Docker:
```bash
docker-compose up
```

## Load Testing

Load tests are implemented using K6 and can be found in the `load-tests/k6` directory.

## Database Migrations

Database migrations are stored in the `migrations/` directory and should be run in sequence:
1. `001_add_look_back_period.sql`
2. `002_unique_decision_constraint.sql`
3. `003_create_decisions_batch.sql`

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Notes

- `.env.local` is ignored by `.gitignore` for security
- Python packages in `requirements.txt` are for optional Python tooling
- The project uses TypeScript for enhanced type safety
- Nginx configuration is provided for production deployment
