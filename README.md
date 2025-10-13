# ReadMate - Personalized Book Recommendation System

A modern, production-ready book recommendation system built with MERN stack, Next.js, and LangChain. The system provides personalized book recommendations based on user context (mood, time, weather) and uses hybrid algorithms combining collaborative filtering, semantic search, and RAG.

## 🎯 Features

- **Context-Aware Recommendations**: Based on mood, time of day, weather, and user preferences
- **Hybrid Algorithm**: Combines semantic similarity, collaborative filtering, and popularity
- **User Profiles**: Track reading history, liked sections, and preferences
- **Smart Search**: Full-text and semantic search capabilities
- **Ready for Phase 2**: Structured for LangChain RAG and vector embeddings integration

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- LangChain (ready for Phase 2)
- Pinecone/Weaviate (vector DB placeholder)

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Query (server state)
- Lucide Icons

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/readmate
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
GEMINI_API_KEY=your_gemini_key (for Phase 2 AI features)
PINECONE_API_KEY=your_pinecone_key (for Phase 2)
CLIENT_URL=http://localhost:3000
```

5. Seed the database with sample books:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/me/likes` - Get liked sections
- `POST /api/users/me/like-section` - Add liked section
- `GET /api/users/me/history` - Get reading history
- `PUT /api/users/me/preferences` - Update preferences

### Books
- `GET /api/books` - Get all books (with pagination)
- `GET /api/books/search?q=query&genre=fiction` - Search books
- `GET /api/books/:id` - Get book details
- `GET /api/books/:id/sections` - Get book sections
- `POST /api/books` - Create book (protected)

### Recommendations
- `POST /api/recs/generate` - Generate recommendations
- `GET /api/recs/history` - Get recommendation history

## 🧪 Testing the System

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "dob": "1990-01-01"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get Recommendations
```bash
curl -X POST http://localhost:5000/api/recs/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "happy",
    "timeOfDay": "evening",
    "weather": "rainy"
  }'
```

## 🎨 Frontend Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/discover` - Main recommendation page (protected)
- `/book/[id]` - Book details page
- `/profile` - User profile page
- `/history` - Reading history

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Auth, error handling
│   ├── utils/             # Helper functions
│   ├── server.js          # Entry point
│   └── seed.js            # Database seeder
├── .env.example
└── package.json

frontend/
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── store/             # Zustand stores
│   ├── lib/               # API client, utilities
│   └── types/             # TypeScript types
├── .env.local.example
└── package.json
```

## 🚀 Implementation Phases

### ✅ Phase 1 (MVP - Current)
- [x] Backend API with Express + MongoDB
- [x] User authentication (JWT)
- [x] Book catalog and search
- [x] Basic recommendation engine (hybrid scoring)
- [x] Frontend structure with Next.js
- [x] User registration and login
- [ ] Discover page with mood picker
- [ ] Book detail pages
- [ ] User profile and history

### Phase 2 (Coming Next)
- [ ] LangChain RAG integration
- [x] Google Gemini AI for embeddings and chat
- [ ] Vector database (Pinecone/Weaviate)
- [ ] Explainable recommendations with LLM
- [ ] Enhanced collaborative filtering
- [ ] Advanced mood detection

### Phase 3 (Future)
- [ ] Automated context detection
- [ ] Multi-modal signals
- [ ] A/B testing framework
- [ ] Mobile app (React Native)
- [ ] Social features

## 🔐 Security Features

- JWT + Refresh Token authentication
- Password hashing with bcrypt
- CORS protection
- Helmet.js security headers
- Input validation
- SQL injection prevention (Mongoose)

## 📊 Data Models

### User
- Profile information (name, email, dob, age)
- Preferences (favorite/disliked genres)
- Liked sections with notes and tags
- Past reads with ratings and reviews
- Mood history

### Book
- Metadata (title, authors, description, genres)
- Sections with text snippets
- Popularity metrics (reads, likes, ratings)
- Embeddings ID (for vector DB)

### RecommendationLog
- User context (mood, time, weather)
- Recommended books with scores
- Explanations and sources
- Feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Happy Reading! 📚**
