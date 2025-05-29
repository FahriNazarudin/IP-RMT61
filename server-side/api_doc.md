# MoFlix API Documentation

## Models

### User

```md
- email : string, required, unique, isEmail
- username : string, required
- password : string, required
- status : string (default: "basic")
```

### Movie

```md
- id : integer, primaryKey, required
- title : string, required
- description : text
- posterfilm : string
- trailer : string
- release_date : date
- genres : JSON
- vote_average : float
- popularity : float
- language : string
- voteCount : integer
```

### Watchlist

```md
- user_id : integer, required
- movie_id : integer, required
- watclistMovie : boolean (default: true)
```

### Order

```md
- orderId : string, required
- user_id : integer
- amount : string
- status : string
- paidDate : date
```

## Endpoints

List of available endpoints:

- `POST /register`
- `POST /login`
- `POST /google-login`

Routes below need authentication:

- `GET /movies`
- `GET /movies/:id`
- `POST /watchlists`
- `GET /watchlists`
- `DELETE /watchlists/:id`
- `GET /movies/recommendations`
- `PATCH /users/me/upgrade`
- `GET /payment/midtrans/initiate`

## 1. POST /register

Request

- body:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

Response (201 - Created)

```json
{
  "id": "integer",
  "username": "string",
  "email": "string"
}
```

Response (400 - Bad Request)

```json
{
  "message": "Email is already in use"
}
OR
{
  "message": "Password is required"
}
OR
{
  "message": "Email format is invalid"
}
```

## 2. POST /login

Request

- body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response (200 - OK)

```json
{
  "access_token": "string",
  "id": "integer",
  "email": "string",
  "username": "string",
  "status": "string"
}
```

Response (400 - Bad Request)

```json
{
  "message": "Email/password is required"
}
```

Response (401 - Unauthorized)

```json
{
  "message": "Invalid email/password"
}
```

## 3. POST /google-login

Request

- body:

```json
{
  "googleToken": "string"
}
```

Response (200 - OK)

```json
{
  "access_token": "string",
  "userId": "integer",
  "status": "string"
}
```

Response (400 - Bad Request)

```json
{
  "message": "Invalid Google token"
}
```

## 4. GET /movies

Description:

- Fetch all movies from the database

Request

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

Response (200 - OK)

```json
{
  "totalMovies": "integer",
  "currentPage": "integer",
  "totalPages": "integer",
  "movies": [
    {
      "id": "integer",
      "title": "string",
      "description": "string",
      "posterfilm": "string",
      "trailer": "string",
      "release_date": "date",
      "genres": "JSON",
      "vote_average": "float",
      "popularity": "float",
      "language": "string",
      "voteCount": "integer"
    }
  ]
}
```

Response (401 - Unauthorized)

```json
{
  "message": "Invalid token"
}
```

## 5. GET /movies/:id

Description:

- Fetch movie details by ID

Request

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

Response (200 - OK)

```json
{
  "id": "integer",
  "title": "string",
  "description": "string",
  "posterfilm": "string",
  "trailer": "string",
  "release_date": "date",
  "genres": "JSON",
  "vote_average": "float",
  "popularity": "float",
  "language": "string",
  "voteCount": "integer"
}
```

Response (404 - Not Found)

```json
{
  "message": "Movie not found"
}
```

## 6. POST /watchlists

Description:

- Add a movie to the user's watchlist

Request

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- body:

```json
{
  "movieId": "integer"
}
```

Response (201 - Created)

```json
{
  "id": "integer",
  "user_id": "integer",
  "movie_id": "integer",
  "watclistMovie": true
}
```

Response (400 - Bad Request)

```json
{
  "message": "Movie already in watchlist"
}
```

## 7. GET /watchlists

Description:

- Fetch the user's watchlist

Request

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

Response (200 - OK)

```json
{
  "watchlist": [
    {
      "id": "integer",
      "user_id": "integer",
      "movie_id": "integer",
      "movie": {
        "id": "integer",
        "title": "string",
        "description": "string",
        "posterfilm": "string",
        "trailer": "string",
        "release_date": "date",
        "genres": "JSON",
        "vote_average": "float",
        "popularity": "float",
        "language": "string",
        "voteCount": "integer"
      }
    }
  ]
}
```

## 8. DELETE /watchlists/:id

Description:

- Remove a movie from the user's watchlist

Request

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

Response (200 - OK)

```json
{
  "message": "Movie removed from watchlist"
}
```

Response (404 - Not Found)

```json
{
  "message": "Watchlist entry not found"
}
```

## 9. GET /movies/recommendations

Description:

- Fetch AI-powered movie recommendations

Request

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

Response (200 - OK)

```json
{
  "recommendations": [
    {
      "id": "integer",
      "title": "string",
      "description": "string",
      "posterfilm": "string",
      "trailer": "string",
      "release_date": "date",
      "genres": "JSON",
      "vote_average": "float",
      "popularity": "float",
      "language": "string",
      "voteCount": "integer"
    }
  ]
}
```

## 10. PATCH /users/me/upgrade

Description:

- Upgrade the user's account to premium

Request

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

- body:

```json
{
  "orderId": "string"
}
```

Response (200 - OK)

```json
{
  "id": "integer",
  "email": "string",
  "username": "string",
  "status": "premium"
}
```

Response (400 - Bad Request)

```json
{
  "message": "User is already premium"
}
```

## 11. GET /payment/midtrans/initiate

Description:

- Initiate a payment transaction for premium subscription

Request

- headers:

```json
{
  "Authorization": "Bearer <string token>"
}
```

Response (200 - OK)

```json
{
  "transactionToken": "string",
  "orderId": "string",
  "message": "Order Created Successfully"
}
```

Response (400 - Bad Request)

```json
{
  "message": "User already has a pending payment"
}
```

## Global Error

Response (401 - Unauthorized)

```json
{
  "message": "Invalid token"
}
```

Response (500 - Internal Server Error)

```json
{
  "message": "Internal Server Error"
}
```
