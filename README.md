# Personal Finance Assistant

This is a full-stack application designed to help users track, manage, and understand their financial activities. Users can log income and expenses, categorize transactions, view summaries of their spending habits, and automatically extract expenses from uploaded receipts using AI.

This project is built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [Firebase](https://firebase.google.com) for authentication, and [MongoDB](https://mongodb.com) for data storage.

## Core Features

-   **Transaction Management**: Create, list, and categorize income and expense entries.
-   **Financial Dashboard**: View summaries of total income, expenses, and net balance.
-   **Budgeting**: Set monthly budgets by category and track spending against them.
-   **AI Receipt Parsing**: Upload receipt images or PDFs to automatically extract transaction data using Google Gemini.
-   **Data Visualization**: Interactive charts for expense breakdown by category, budget vs. actual spending, and monthly trends.
-   **User Authentication**: Secure sign-in with Google via Firebase Authentication.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm, yarn, or pnpm
-   MongoDB database
-   Firebase project for authentication
-   Google Gemini API Key for receipt parsing

### Environment Variables

Create a `.env` file in the root of the project and add the following environment variables:

```
# Firebase Client Config (public)
NEXT_PUBLIC_FB_API_KEY=
NEXT_PUBLIC_FB_AUTH_DOMAIN=
NEXT_PUBLIC_FB_PROJECT_ID=

# Firebase Admin SDK (server-side)
FB_PROJECT_ID=
FB_CLIENT_EMAIL=
FB_PRIVATE_KEY=

# MongoDB
MONGODB_URI=

# Google Gemini API for Receipt Parsing
GOOGLE_GEMINI_API_KEY=

# Optional: Default category for uncategorized transactions
NEXT_PUBLIC_FALLBACK_CATEGORY=Other
```

### Installation & Running the App

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


