# Personal Finance Assistant

A comprehensive full-stack web application designed to help users track, manage, and understand their financial activities. Users can log income and expenses, categorize transactions, view detailed summaries of their spending habits, and automatically extract transaction data from uploaded receipts using AI.

## 🌐 Live Application

**[Try the Live Application](https://typeface-project-personal-finance-m-five.vercel.app/)**

*Experience the full functionality of the Personal Finance Assistant directly in your browser.*

## 🎥 Demo Video

Check out the full project demonstration:

**[Watch Demo Video](https://drive.google.com/file/d/1RinSFm5T1ZekZt6lF6zTUAGrhksAsUzS/view?usp=sharing)**

*The demo showcases all major features including transaction management, AI receipt processing, budget tracking, and analytics dashboard.*

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js 15](https://nextjs.org) with React
- **Styling**: [Tailwind CSS](https://tailwindcss.com) for responsive UI
- **Authentication**: [Firebase Auth](https://firebase.google.com) with Google Sign-in
- **Database**: [MongoDB](https://mongodb.com) for data persistence
- **AI Integration**: [Google Gemini API](https://ai.google.dev) for receipt parsing
- **Charts**: [Recharts](https://recharts.org) for data visualization
- **PDF Processing**: pdf-parse for text extraction
- **Deployment**: Vercel-ready

## ✨ Core Features

### 🔐 Authentication & Security
- **Google OAuth Integration**: Secure sign-in with Firebase Authentication
- **Protected Routes**: Automatic redirection for unauthenticated users
- **User Session Management**: Persistent login state across browser sessions

### 💳 Transaction Management
- **Manual Entry**: Add income and expense transactions with validation
- **Categorization**: Organize transactions across multiple categories (Food, Transportation, Utilities, etc.)
- **Date Filtering**: Filter transactions by custom date ranges
- **Server-side Pagination**: Efficient handling of large transaction datasets
- **Real-time Updates**: Instant UI updates when transactions are added/deleted
- **CRUD Operations**: Full create, read, update, delete functionality

### 🤖 AI-Powered Receipt Processing
- **Multi-format Support**: Process both PDF documents and image files (JPG, PNG)
- **Intelligent Extraction**: Automatically extract transaction data using Google Gemini AI
- **Table Recognition**: Parse tabular data from bank statements and receipts
- **Smart Categorization**: AI-powered category assignment based on merchant/description
- **Batch Processing**: Extract multiple transactions from a single receipt
- **Date Normalization**: Automatic date format standardization (YYYY-MM-DD)
- **Client-side Pagination**: Browse extracted transactions before saving

### 📊 Budget Management
- **Monthly Budgets**: Set spending limits by category for each month
- **Budget vs Actual**: Visual comparison charts showing planned vs actual spending
- **Spending Alerts**: Notifications when approaching or exceeding budget limits
- **Progress Tracking**: Real-time budget utilization percentages

### 📈 Data Visualization & Analytics
- **Summary Dashboard**: Overview cards showing total income, expenses, and net balance
- **Category Pie Charts**: Visual breakdown of spending by category
- **Monthly Trends**: Bar charts showing expense patterns over time
- **Budget Comparison Charts**: Side-by-side budget vs actual spending analysis
- **Interactive Charts**: Hover effects and detailed tooltips
- **Responsive Design**: Charts adapt to different screen sizes

### 💼 Advanced Features
- **Loading States**: Smooth loading indicators and transitions
- **Error Handling**: Comprehensive error messages and fallbacks
- **Form Validation**: Client and server-side validation with Zod schema

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (version 18 or later)
- **npm**, **yarn**, or **pnpm** package manager
- **MongoDB** database (local or cloud)
- **Firebase** project for authentication
- **Google Gemini API** access for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-finance-assistant.git
   cd personal-finance-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables** (see Environment Configuration below)

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

### Firebase Configuration

First, create a Firebase project at [Firebase Console](https://console.firebase.google.com/):

1. Create a new project or select existing one
2. Enable Authentication and add Google as a sign-in provider
3. Generate a web app configuration
4. Create a service account for admin SDK

```env
# Firebase Client Configuration (Public - safe for browser)
NEXT_PUBLIC_FB_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=your_project_id

# Firebase Admin SDK (Server-side - Keep these secret!)
FB_PROJECT_ID=your_project_id
FB_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

**Important**: For `FB_PRIVATE_KEY`, ensure you:
- Keep the quotes around the entire key
- Include `\n` for line breaks (they will be converted to actual newlines)
- Copy the entire key from your service account JSON file

### Database Configuration

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/personal_finance
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personal_finance
```

### AI Configuration

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/):

```env
# Google Gemini API for Receipt Parsing
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Specify Gemini model (defaults to gemini-1.5-flash)
GEMINI_MODEL=gemini-1.5-flash
```

### Optional Configuration

```env
# Default category for uncategorized transactions
NEXT_PUBLIC_FALLBACK_CATEGORY=Other

# Receipt parser provider (defaults to 'gemini')
RECEIPT_PARSER_PROVIDER=gemini

# Transaction API endpoint (defaults to '/api/transactions')
NEXT_PUBLIC_TRANSACTION_ENDPOINT=/api/transactions
```

### Setting up Firebase Admin SDK

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract the required fields:
   - `project_id` → `FB_PROJECT_ID`
   - `client_email` → `FB_CLIENT_EMAIL`
   - `private_key` → `FB_PRIVATE_KEY` (ensure proper escaping)

### Setting up MongoDB

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community  # macOS
# or follow official installation guide for your OS

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database user and network access
4. Get connection string and add to `MONGODB_URI`

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── transactions/         # Transaction CRUD operations
│   │   └── parse-receipt/        # AI receipt processing
│   ├── addTransaction/           # Transaction management page
│   ├── dashboard/                # Analytics dashboard
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── charts/                   # Chart components (Recharts)
│   ├── dashboard/                # Dashboard-specific components
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components (Navbar)
│   └── ui/                       # UI components (Button, Input, etc.)
├── contexts/                     # React Context providers
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── categories.js             # Transaction categories
│   ├── mongodb.js                # Database connection
│   ├── validation.js             # Zod schemas
│   └── withAuth.js               # Authentication middleware
└── middleware.js                 # Next.js middleware
```

## 🎯 Usage Guide

### Adding Transactions
1. Navigate to "Transaction Management" page
2. Fill in the transaction form with amount, date, category, and description
3. Use negative amounts for expenses, positive for income
4. Transaction appears immediately in the history table

### Receipt Processing
1. Go to "Extract Transactions from Receipt" section
2. Upload a PDF or image file (max 10MB)
3. AI processes the file and extracts transaction data
4. Review extracted transactions in paginated table
5. Click "Save All Transactions" to add to your records

### Budget Management
1. Visit the Dashboard
2. Use "Add Budget" to set monthly spending limits by category
3. View budget vs actual spending in comparison charts
4. Monitor alerts for overspending

### Analytics
- Dashboard shows summary cards with total income, expenses, and balance
- Interactive charts display spending patterns and trends
- Filter data by date ranges for specific analysis

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Configure Environment Variables**
   Add all your `.env.local` variables in Vercel's environment settings

### Other Platforms
The app is compatible with any platform supporting Next.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 🐛 Troubleshooting

### Common Issues

**Build Error: "Cannot read properties of undefined (reading 'replace')"**
- Ensure `FB_PRIVATE_KEY` is properly formatted with quotes and `\n` sequences
- Verify all Firebase environment variables are set

**Authentication Not Working**
- Check Firebase configuration
- Ensure Google OAuth is enabled in Firebase Console
- Verify domain is added to authorized domains

**AI Receipt Processing Fails**
- Confirm `GOOGLE_GEMINI_API_KEY` is valid
- Check file size (must be under 10MB)
- Ensure file format is supported (PDF, JPG, PNG)

**Database Connection Issues**
- Verify MongoDB is running (if local)
- Check MongoDB Atlas network access (if cloud)
- Confirm `MONGODB_URI` format is correct

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request




Built with ❤️ using Next.js, Firebase, and MongoDB


