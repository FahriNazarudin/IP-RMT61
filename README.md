# MoFlix - Movie Information Platform

## 1. Project Description

### Project Title

**MoFlix** - Movie Information Platform with AI Recommendation

### Summary

MoFlix is a movie information platform built with modern React.js and Node.js technology. This platform provides comprehensive features such as movie catalog, detailed movie information, personal watchlist, premium membership system, and AI-based movie recommendations using OpenAI API.

### Benefits

- **Complete Movie Catalog**: Movie database with detailed information, genres, ratings, and trailers
- **Personal Recommendations**: AI system that provides movie recommendations according to user preferences
- **Watchlist**: Save list of movies to watch for future reference
- **Premium System**: Upgrade to premium for more watchlist storage features
- **Modern Interface**: Responsive and user-friendly UI/UX with attractive design

### Use Cases

1. **Regular Users**: Can browse movie catalog, view detailed information, ratings, trailers, and add to personal watchlist
2. **Premium Users**: Full access to all features with more watchlist storage
3. **Movie Enthusiasts**: Platform to explore new movies, read detailed information, and manage list of movies to watch

### How to Run the Project

1. **Backend**: `npm run dev` in server-side folder (Port: 3000)
2. **Frontend**: `npm run dev` in client-side/MoFlix folder (Port: 5173)
3. **Testing**: `npm test` to run test suite

### Usage Examples

```bash
# Register new user
POST /register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password"
}

# Login
POST /login
{
  "email": "user@example.com",
  "password": "password"
}

# Get movie catalog
GET /movies

# View movie details
GET /movies/:id

# Add movie to watchlist
POST /watchlist
{
  "movie_id": 1
}
```

### Parameters and Options

- **Authentication**: Bearer token required for protected routes
- **Pagination**: Query parameters `page` and `limit` for list endpoints
- **Filtering**: Query parameters for filtering by genre, rating, etc.
- **Search**: Query parameter `search` for movie search

### Email Address

**fahrinazarudin0405@gmail.com**

### Links to Additional Documentation

- API Documentation: [Link to api_doc.md](./server-side/api_doc.md)

### Screenshots
<img width="1505" alt="Screenshot 2025-07-09 at 06 34 59" src="https://github.com/user-attachments/assets/973f154a-b1d0-4b32-9361-9798d4189c8e" />
<img width="1501" alt="Screenshot 2025-07-09 at 06 34 35" src="https://github.com/user-attachments/assets/d5c5961d-e1b5-4caa-87b3-8484e3102a69" />
<img width="1511" alt="Screenshot 2025-07-09 at 06 32 14" src="https://github.com/user-attachments/assets/bb6aff98-7cae-45ee-a2a7-0e861412d76e" />
<img width="1510" alt="Screenshot 2025-07-09 at 06 33 47" src="https://github.com/user-attachments/assets/769c0c41-04ce-4199-87c6-a5e58e503f5e" />
<img width="1503" alt="Screenshot 2025-07-09 at 06 35 09" src="https://github.com/user-attachments/assets/ac6a69d2-ada3-48f7-a288-0500b9e50c15" />

---

## Tech Stack

### Frontend

- React.js 19.1.0
- Vite
- Redux Toolkit
- React Router
- Axios
- Framer Motion
- React Icons

### Backend

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- OpenAI API
- Midtrans Payment Gateway

### Testing

- Jest
- Supertest

**Happy Coding! 🎬🍿**
