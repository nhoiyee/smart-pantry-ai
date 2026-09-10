# Smart Pantry AI

Smart Pantry AI is a full-stack AI web application that helps users manage their pantry, track food expiry dates, and get AI-powered food recommendations and recipes.

The project was built using Next.js, TypeScript, Supabase, PostgreSQL, and the OpenAI API.

## Demo

[Watch the Smart Pantry AI Demo](https://drive.google.com/file/d/1GuqiZ5NV8C0VypqkLLXPcJrze7C9Xnzg/view?usp=sharing)

## Key Features

- User registration and login
- Add, edit, view, and delete pantry items
- Track food expiry dates
- Fresh, Expiring Soon, and Expired status
- Pantry inventory summary
- AI recommendations based on pantry items
- AI recipe generation
- Expired-food safety filtering
- User data protection using Row Level Security (RLS)

## Technology Used

- Next.js
- React
- TypeScript
- Supabase
- PostgreSQL
- OpenAI API
- Tailwind CSS
- GitHub

## How It Works

Users add food items to their pantry and record information such as quantity and expiry date.

The system tracks the food's expiry status. Users can also ask the Pantry AI for suggestions or generate recipes using available pantry ingredients.

Expired food is filtered out so that it is not intentionally recommended for consumption.

## Running the Project

Install the dependencies:

```bash
npm install
```

Create a `.env.local` file with the required Supabase and OpenAI API settings.

Start the application:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Testing

The project was tested for authentication, pantry management, expiry tracking, AI recommendations, recipe generation, safety filtering, and error handling.

## Project Status

Core development and testing are complete.

The application was developed and tested locally. A recorded demo is provided above.

## Author

**Ng Hoi Yee**

Smart Pantry AI Capstone Project
