# Smart Pantry AI

Smart Pantry AI is an AI-powered full-stack web application designed to help users manage household food inventory, monitor expiry dates, reduce food waste, and generate AI-powered recommendations and recipes based on available pantry ingredients.

The project was developed using Next.js, TypeScript, Supabase, PostgreSQL, and the OpenAI API.

## 🎥 Project Demo

Watch the Smart Pantry AI application demo:

👉 [Smart Pantry AI – Demo Video](https://drive.google.com/file/d/1GuqiZ5NV8C0VypqkLLXPcJrze7C9Xnzg/view?usp=sharing)

> The demo shows the main application workflow, including pantry management, expiry tracking, pantry-aware AI recommendations, and AI recipe generation.

## ✨ Key Features

- User registration and login
- Secure authentication using Supabase
- Pantry inventory management
- Add, view, update, and delete pantry items
- Expiry date tracking
- Fresh, Expiring Soon, and Expired status indicators
- Pantry dashboard and inventory summary
- Pantry-aware AI recommendations
- AI recipe generation using available pantry ingredients
- Expired-food safety filtering
- Handling of restricted or undesired pantry items
- User-specific data protection using Row Level Security (RLS)
- Responsive web interface
- API error handling and validation

## 🛠 Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

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

### Development & Version Control
- Git
- GitHub

## 🏗 System Architecture

Smart Pantry AI uses a full-stack web architecture in which the Next.js application provides the user interface and server-side API functionality.

Supabase provides authentication and PostgreSQL database services, while the OpenAI API provides AI-powered pantry recommendations and recipe generation.

### High-Level Flow

User → Next.js Frontend → Next.js API Routes → Supabase / OpenAI → Frontend → User

The application was developed and tested locally, with the source code maintained in GitHub.

## 📦 Main Application Functions

### Pantry Management

Users can manage their personal pantry inventory by adding, viewing, updating, and deleting food items.

Each pantry item can contain information such as quantity, unit, purchase date, expiry date, storage location, barcode, and image information.

### Expiry Tracking

The application monitors food expiry dates and classifies pantry items as:

- Fresh
- Expiring Soon
- Expired

This helps users identify food that should be consumed soon and prevents expired items from being used in AI-generated food recommendations.

### Pantry-Aware AI

Authenticated users can ask AI-powered questions based on the food currently available in their pantry.

The application retrieves the user's pantry data and provides suitable pantry information to the OpenAI API to generate contextual recommendations.

### AI Recipe Generation

Users can generate recipes based on suitable ingredients currently available in their pantry.

Safety logic prevents expired food items from being intentionally recommended for consumption.

## 🔒 Security

Smart Pantry AI implements several security measures, including:

- Supabase Authentication
- User-specific database access
- PostgreSQL Row Level Security (RLS)
- Protected API requests
- Server-side environment variables for sensitive credentials
- Input validation
- API error handling
- Expired-food safety filtering

## 💻 Running the Project Locally

Install the project dependencies:

```bash
npm install
```

Create a `.env.local` file and configure the required Supabase and OpenAI environment variables.

Then start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

> API keys and other sensitive credentials should never be committed to the repository.

## 🧪 Testing

The application was tested for:

- User registration and authentication
- Valid and invalid login
- Pantry CRUD operations
- User data isolation
- Expiry tracking
- Pantry API behaviour
- Pantry-aware AI recommendations
- AI recipe generation
- Restricted/undesired item handling
- Expired-food safety handling
- Empty pantry scenarios
- API error handling
- Security and access control
- Application performance

All final test scenarios used for the project passed after identified issues were corrected and retested.

## 📌 Project Status

**Final submission version**

Core implementation and testing have been completed.

The application is currently demonstrated through a recorded project demo rather than a publicly hosted live deployment.

## 👤 Author

**Ng Hoi Yee**

Capstone Project – Smart Pantry AI
