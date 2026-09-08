# Smart Pantry AI

Smart Pantry AI is an AI-powered web application designed to help users manage household food inventory, monitor expiry dates, reduce food waste, and generate recipe recommendations based on available pantry ingredients.

The project was developed as a full-stack AI application using Next.js, Supabase, the OpenAI API, and Vercel.

## Key Features

- User registration and login
- Secure authentication using Supabase
- Pantry inventory management
- Add, view, update, and delete pantry items
- Expiry date tracking
- Expired, Expiring Soon, and Fresh status indicators
- Pantry dashboard and inventory summary
- Pantry-aware AI recommendations
- AI recipe generation using available pantry ingredients
- Expired-food safety filtering
- User-specific data protection using Row Level Security (RLS)
- Responsive web interface
- Cloud deployment using Vercel

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- Next.js API Routes
- Supabase

### Database
- PostgreSQL (Supabase)

### Authentication & Security
- Supabase Authentication
- Row Level Security (RLS)

### Artificial Intelligence
- OpenAI API

### Deployment
- Vercel

## System Architecture

Smart Pantry AI uses a full-stack web architecture in which the Next.js application provides the user interface and server-side API functionality.

Supabase provides authentication and PostgreSQL database services, while the OpenAI API provides AI-powered pantry recommendations and recipe generation.

The application is deployed using Vercel.

## Main Application Functions

### Pantry Management

Users can manage their personal pantry inventory by adding, viewing, updating, and deleting food items.

Each pantry item can contain information such as quantity, unit, purchase date, expiry date, storage location, barcode, and image information.

### Expiry Tracking

The application monitors food expiry dates and classifies pantry items according to their expiry status, helping users identify expired items and food that should be consumed soon.

### Pantry-Aware AI

Authenticated users can ask AI-powered questions based on the food currently available in their pantry.

The application retrieves the user's pantry data and provides the relevant information to the OpenAI API to generate contextual recommendations.

### AI Recipe Generation

Users can generate recipes based on ingredients currently available in their pantry.

Safety logic prevents expired food items from being recommended for consumption.

## Security

Smart Pantry AI implements several security measures, including:

- Supabase Authentication
- User-specific database access
- PostgreSQL Row Level Security
- Protected API requests
- Environment variables for sensitive credentials
- Input validation
- HTTPS through cloud deployment

## Running the Project Locally

Install the project dependencies:

```bash
npm install
```

Create a `.env.local` file and configure the required environment variables.

Then start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in a web browser.

> API keys and other sensitive credentials should never be committed to the repository.

## Testing

The application was tested for:

- User registration and authentication
- Pantry CRUD operations
- User data isolation
- Expiry tracking
- Pantry-aware AI recommendations
- AI recipe generation
- Expired-food safety handling
- API error handling
- Security and access control
- Application performance

## Project Status

**Final submission version**

Core implementation and testing have been completed.

## Author

**Ng Hoi Yee**

Capstone Project – Smart Pantry AI
