<<<<<<< HEAD
# Dö: Technical Documentation

---

## 1. General Description of the System

### 1.1 Project Summary

**Dö** is an integrated e-learning platform designed to facilitate the teaching and assessment of programming and computer science concepts. The system provides a gamified learning experience, combining theoretical content, quizzes, and hands-on coding exercises. Dö tracks user progress, rewards achievements, and leverages AI to provide hints and personalized feedback.

### 1.2 Problem Statement

Traditional e-learning platforms often lack engagement, real-time feedback, and adaptive support for students. Dö addresses these issues by:
- Structuring content into progressive levels and courses.
- Tracking granular user progress.
- Providing instant feedback on coding exercises.
- Rewarding users with XP, coins, and achievements.
- Offering AI-powered hints to support learning.
- Enabling educators to monitor and analyze student performance.

---

## 2. System Architecture

### 2.1 Architecture Overview

Dö is built as a modern web application with a clear separation of concerns:

- **Frontend**: Single Page Application (SPA) built with Vite and JavaScript, responsible for user interaction and rendering.
- **Backend**: RESTful API developed with Node.js and Express.js, handling business logic, authentication, and integration with external services (e.g., OpenAI, Judge0).
- **Database**: PostgreSQL managed via Supabase, storing all persistent data (users, courses, progress, etc.).

### 2.2 High-Level Architecture Diagram (Textual)

```
+-------------------+         HTTPS         +-------------------+         SQL         +-------------------+
|                   | <-------------------> |                   | <----------------> |                   |
|   Frontend SPA    |                       |   Backend API     |                   |   PostgreSQL DB   |
| (Vite, JS, HTML)  |                       | (Node.js, Express)|                   |   (Supabase)      |
+-------------------+                       +-------------------+                   +-------------------+
        |                                         |                                         |
        |-------------------+                     |                                         |
                            |                     |                                         |
                            v                     v                                         v
                    +-------------------+   +-------------------+   +-------------------+
                    |   Judge0 API      |   |   OpenAI API      |   |   Azure DevOps    |
                    +-------------------+   +-------------------+   +-------------------+
```

---

## 3. Technologies Used

### 3.1 Frontend

- **Vite**: Fast build tool and development server.
- **JavaScript (ES6+)**: Main programming language.
- **HTML/CSS**: For UI structure and styling.

### 3.2 Backend

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for building REST APIs.
- **OpenAI SDK**: For AI-powered hints.
- **Judge0**: For code execution and evaluation.
- **bcrypt**: For password hashing.
- **jsonwebtoken**: For JWT-based authentication.

### 3.3 Database

- **PostgreSQL**: Relational database.
- **Supabase**: Backend-as-a-Service for PostgreSQL, providing RESTful access and authentication.

### 3.4 Project Management

- **Azure DevOps**: For version control, CI/CD, and project tracking.

---

## 4. Database Model

### 4.1 Relational Model Overview

The database is structured to support users, courses, levels, exercises, quizzes, progress tracking, and achievements. Relationships are enforced via foreign keys.

### 4.2 Main Tables

#### 4.2.1 users

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_user       | UUID (PK)    | Unique user identifier       |
| username      | VARCHAR      | User's display name          |
| email         | VARCHAR      | User's email address         |
| password_hash | VARCHAR      | Hashed password              |
| coins         | INTEGER      | In-app currency              |
| xp            | INTEGER      | Experience points            |
| created_at    | TIMESTAMP    | Registration date            |

#### 4.2.2 courses

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_courses    | SERIAL (PK)  | Unique course identifier     |
| name          | VARCHAR      | Course name                  |
| description   | TEXT         | Course description           |

#### 4.2.3 level

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_level      | SERIAL (PK)  | Unique level identifier      |
| id_courses    | INT (FK)     | Reference to courses         |
| name          | VARCHAR      | Level name                   |
| description   | TEXT         | Level description            |
| step          | INT          | Order within the course      |
| xp_reward     | INT          | XP reward for completion     |
| difficulty    | VARCHAR      | Difficulty label             |

#### 4.2.4 exercises

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_exercise   | SERIAL (PK)  | Unique exercise identifier   |
| id_level      | INT (FK)     | Reference to level           |
| title         | VARCHAR      | Exercise title               |
| description   | TEXT         | Exercise description         |
| tests         | JSONB        | Test cases for evaluation    |
| xp_reward     | INT          | XP reward for completion     |
| coins_reward  | INT          | Coin reward for completion   |

#### 4.2.5 progress

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_user       | UUID (FK)    | Reference to user            |
| id_level      | INT (FK)     | Reference to level           |
| startat       | TIMESTAMP    | Start date/time              |
| endat         | TIMESTAMP    | Completion date/time         |
| status        | INT          | 0=pending, 1=in_progress, 2=completed, 3=failed |
| attempts      | INT          | Number of attempts           |
| score         | INT          | Final score                  |

#### 4.2.6 achievements

| Field           | Type         | Description                  |
|-----------------|--------------|------------------------------|
| id_achievement  | SERIAL (PK)  | Unique achievement ID        |
| id_level        | INT (FK)     | Linked level (optional)      |
| name            | VARCHAR      | Achievement name             |
| description     | TEXT         | Achievement description      |

#### 4.2.7 users_theories, users_quizzes, exercise_attempts, users_achievements

- **users_theories**: Tracks which theories a user has completed.
- **users_quizzes**: Tracks quiz attempts and scores.
- **exercise_attempts**: Stores each code submission, result, and feedback.
- **users_achievements**: Tracks unlocked achievements per user.

---

## 5. API REST (Backend)

### 5.1 Authentication

#### POST `/api/auth/register`
- **Request**: `{ username, email, password }`
- **Response**: `{ message, user }`

#### POST `/api/auth/login`
- **Request**: `{ email, password }`
- **Response**: `{ token, user }`

### 5.2 Courses

#### GET `/api/courses`
- **Response**: `{ courses: [ ... ] }`

#### GET `/api/courses/:id`
- **Response**: `{ course, levels: [ ... ] }`

### 5.3 Progress

#### GET `/api/progress/level/:id_level`
- **Response**:
  ```json
  {
    "level": { ... },
    "percent": 60,
    "theories": [ ... ],
    "quizzes": [ ... ],
    "exercises": [ ... ]
  }
  ```

#### GET `/api/progress/course/:id_courses`
- **Response**:
  ```json
  {
    "id_courses": 1,
    "levels": [
      {
        "id_level": 1,
        "status": 2,
        "score": 100,
        "attempts": 3,
        "theoriesCompleted": 5,
        "totalTheories": 5,
        "quizzesCompleted": 2,
        "totalQuizzes": 2,
        "percent": 100,
        "unlocked": true
      }
    ]
  }
  ```

#### POST `/api/progress/level/start`
- **Request**: `{ id_level }`
- **Response**: `{ message, data }`

#### POST `/api/progress/theory/complete`
- **Request**: `{ id_theory }`
- **Response**: `{ message, data }`

#### POST `/api/progress/quiz/complete`
- **Request**: `{ id_quiz, score }`
- **Response**: `{ message, data }`

#### POST `/api/progress/exercise/attempt`
- **Request**: `{ id_exercise, code, language }`
- **Response**: `{ passed, hint, xp_earned, coins_earned, ... }`

### 5.4 Rewards

#### POST `/api/rewards/claim`
- **Request**: `{ type }`
- **Response**: `{ message, xp, coins }`

### 5.5 Example: Completing a Quiz

**Request:**
```json
POST /api/progress/quiz/complete
{
  "id_quiz": 12,
  "score": 85
}
```
**Response:**
```json
{
  "message": "Quiz completed ✅",
  "data": {
    "id_user_quiz": 34,
    "id_user": "uuid",
    "id_quiz": 12,
    "score": 85,
    "completed_at": "2025-08-31T12:00:00Z",
    "status": "completed"
  }
}
```

---

## 6. Frontend (SPA)

### 6.1 Folder Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── viewsjs/         # Page views (e.g., quiz.js, level.js)
│   ├── services/        # API service wrappers (api.js)
│   ├── assets/          # Images, icons, etc.
│   ├── App.js           # Main SPA entry point
│   └── index.html
├── public/
├── package.json
└── vite.config.js
```

### 6.2 Navigation Flow

1. **Login/Register**:  
   - User authenticates via `/login` or `/register`.
   - JWT token is stored in localStorage/session.

2. **Courses List**:  
   - User sees available courses.
   - Selects a course to view its levels.

3. **Levels Overview**:  
   - User sees all levels in the course, with progress bars and unlock status.

4. **Level Detail**:  
   - User accesses a level to view theories, quizzes, and exercises.
   - Progress is tracked and displayed.

5. **Quiz/Exercise Views**:  
   - User completes quizzes and coding exercises.
   - Immediate feedback and rewards are shown.

6. **Progress Tracking**:  
   - User can view overall progress, achievements, and earned rewards.

---

## 7. Installation and Deployment Guide

### 7.1 Requirements

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Supabase** account (for PostgreSQL)
- **Render/Heroku** (for backend deployment, optional)

### 7.2 Local Development

#### 1. Clone the repository

```bash
git clone https://your-repo-url
cd Do
```

#### 2. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install 
```

#### 3. Configure environment variables

- **Backend**: Create `.env` in `/backend` with:
  ```
  SUPABASE_URL=...
  SUPABASE_KEY=...
  OPENAI_API_KEY=...
  JWT_SECRET=...
  ```

#### 4. Run Supabase locally or connect to your Supabase project

- Set up tables using provided SQL migrations.

#### 5. Start backend and frontend

```bash
# In /backend
npm run dev

# In /frontend
npm run dev
```

- Access the app at `http://localhost:5173` (default Vite port).

### 7.3 Production Deployment

- **Frontend**: Deploy `/frontend` to Vercel or Netlify.
- **Backend**: Deploy `/backend` to Render, Heroku, or similar.
- **Database**: Use Supabase cloud or your own PostgreSQL instance.

---

## 8. Testing Strategy

### 8.1 Methodology

- **Unit Testing**: For backend controllers and utility functions.
- **Integration Testing**: For API endpoints (using tools like Jest, Supertest).
- **Manual Testing**: For frontend flows and UI/UX.

### 8.2 Example Test Cases

- **User Registration**
  - Input: Valid/invalid email, password.
  - Expected: User created, password hashed, JWT returned.

- **Login**
  - Input: Correct/incorrect credentials.
  - Expected: JWT issued or error message.

- **Course Progress**
  - Input: Complete a theory, quiz, or exercise.
  - Expected: Progress updated, rewards granted.

- **Saving Progress**
  - Input: Multiple attempts on exercises.
  - Expected: Only first successful attempt grants rewards.

---

## 9. Security Measures

### 9.1 Password Handling

- Passwords are hashed using **bcrypt** before storage.
- Plaintext passwords are never stored or logged.

### 9.2 Session Management

- Authentication is handled via **JWT** (JSON Web Tokens).
- Tokens are signed with a secret and have expiration times.
- JWT is sent in the `Authorization` header for protected endpoints.

### 9.3 API Security Best Practices

- All sensitive endpoints require authentication.
- Input validation and sanitization are enforced.
- Rate limiting and logging are recommended for production.
- CORS is configured to restrict origins.

---

## 10. Maintenance and Future Improvements

### 10.1 Scalability Recommendations

- Use connection pooling for PostgreSQL.
- Implement caching for frequently accessed data.
- Use background jobs for heavy tasks (e.g., code evaluation).
- Monitor performance and errors with tools like Sentry.

### 10.2 Possible New Features

- **Student Chat**: Real-time chat for peer support.
- **Global Ranking**: Leaderboards based on XP and achievements.
- **AI Integration**: More advanced feedback, adaptive learning paths.
- **Mobile App**: Native or PWA for mobile devices.
- **Teacher Dashboard**: Analytics and content management for educators.

---

=======
# Dö: Technical Documentation

---

## 1. General Description of the System

### 1.1 Project Summary

**Dö** is an integrated e-learning platform designed to facilitate the teaching and assessment of programming and computer science concepts. The system provides a gamified learning experience, combining theoretical content, quizzes, and hands-on coding exercises. Dö tracks user progress, rewards achievements, and leverages AI to provide hints and personalized feedback.

### 1.2 Problem Statement

Traditional e-learning platforms often lack engagement, real-time feedback, and adaptive support for students. Dö addresses these issues by:
- Structuring content into progressive levels and courses.
- Tracking granular user progress.
- Providing instant feedback on coding exercises.
- Rewarding users with XP, coins, and achievements.
- Offering AI-powered hints to support learning.
- Enabling educators to monitor and analyze student performance.

---

## 2. System Architecture

### 2.1 Architecture Overview

Dö is built as a modern web application with a clear separation of concerns:

- **Frontend**: Single Page Application (SPA) built with Vite and JavaScript, responsible for user interaction and rendering.
- **Backend**: RESTful API developed with Node.js and Express.js, handling business logic, authentication, and integration with external services (e.g., OpenAI, Judge0).
- **Database**: PostgreSQL managed via Supabase, storing all persistent data (users, courses, progress, etc.).

### 2.2 High-Level Architecture Diagram (Textual)

```
+-------------------+         HTTPS         +-------------------+         SQL         +-------------------+
|                   | <-------------------> |                   | <----------------> |                   |
|   Frontend SPA    |                       |   Backend API     |                   |   PostgreSQL DB   |
| (Vite, JS, HTML)  |                       | (Node.js, Express)|                   |   (Supabase)      |
+-------------------+                       +-------------------+                   +-------------------+
        |                                         |                                         |
        |-------------------+                     |                                         |
                            |                     |                                         |
                            v                     v                                         v
                    +-------------------+   +-------------------+   +-------------------+
                    |   Judge0 API      |   |   OpenAI API      |   |   Azure DevOps    |
                    +-------------------+   +-------------------+   +-------------------+
```

---

## 3. Technologies Used

### 3.1 Frontend

- **Vite**: Fast build tool and development server.
- **JavaScript (ES6+)**: Main programming language.
- **HTML/CSS**: For UI structure and styling.

### 3.2 Backend

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for building REST APIs.
- **OpenAI SDK**: For AI-powered hints.
- **Judge0**: For code execution and evaluation.
- **bcrypt**: For password hashing.
- **jsonwebtoken**: For JWT-based authentication.

### 3.3 Database

- **PostgreSQL**: Relational database.
- **Supabase**: Backend-as-a-Service for PostgreSQL, providing RESTful access and authentication.

### 3.4 Project Management

- **Azure DevOps**: For version control, CI/CD, and project tracking.

---

## 4. Database Model

### 4.1 Relational Model Overview

The database is structured to support users, courses, levels, exercises, quizzes, progress tracking, and achievements. Relationships are enforced via foreign keys.

### 4.2 Main Tables

#### 4.2.1 users

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_user       | UUID (PK)    | Unique user identifier       |
| username      | VARCHAR      | User's display name          |
| email         | VARCHAR      | User's email address         |
| password_hash | VARCHAR      | Hashed password              |
| coins         | INTEGER      | In-app currency              |
| xp            | INTEGER      | Experience points            |
| created_at    | TIMESTAMP    | Registration date            |

#### 4.2.2 courses

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_courses    | SERIAL (PK)  | Unique course identifier     |
| name          | VARCHAR      | Course name                  |
| description   | TEXT         | Course description           |

#### 4.2.3 level

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_level      | SERIAL (PK)  | Unique level identifier      |
| id_courses    | INT (FK)     | Reference to courses         |
| name          | VARCHAR      | Level name                   |
| description   | TEXT         | Level description            |
| step          | INT          | Order within the course      |
| xp_reward     | INT          | XP reward for completion     |
| difficulty    | VARCHAR      | Difficulty label             |

#### 4.2.4 exercises

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_exercise   | SERIAL (PK)  | Unique exercise identifier   |
| id_level      | INT (FK)     | Reference to level           |
| title         | VARCHAR      | Exercise title               |
| description   | TEXT         | Exercise description         |
| tests         | JSONB        | Test cases for evaluation    |
| xp_reward     | INT          | XP reward for completion     |
| coins_reward  | INT          | Coin reward for completion   |

#### 4.2.5 progress

| Field         | Type         | Description                  |
|---------------|--------------|------------------------------|
| id_user       | UUID (FK)    | Reference to user            |
| id_level      | INT (FK)     | Reference to level           |
| startat       | TIMESTAMP    | Start date/time              |
| endat         | TIMESTAMP    | Completion date/time         |
| status        | INT          | 0=pending, 1=in_progress, 2=completed, 3=failed |
| attempts      | INT          | Number of attempts           |
| score         | INT          | Final score                  |

#### 4.2.6 achievements

| Field           | Type         | Description                  |
|-----------------|--------------|------------------------------|
| id_achievement  | SERIAL (PK)  | Unique achievement ID        |
| id_level        | INT (FK)     | Linked level (optional)      |
| name            | VARCHAR      | Achievement name             |
| description     | TEXT         | Achievement description      |

#### 4.2.7 users_theories, users_quizzes, exercise_attempts, users_achievements

- **users_theories**: Tracks which theories a user has completed.
- **users_quizzes**: Tracks quiz attempts and scores.
- **exercise_attempts**: Stores each code submission, result, and feedback.
- **users_achievements**: Tracks unlocked achievements per user.

---

## 5. API REST (Backend)

### 5.1 Authentication

#### POST `/api/auth/register`
- **Request**: `{ username, email, password }`
- **Response**: `{ message, user }`

#### POST `/api/auth/login`
- **Request**: `{ email, password }`
- **Response**: `{ token, user }`

### 5.2 Courses

#### GET `/api/courses`
- **Response**: `{ courses: [ ... ] }`

#### GET `/api/courses/:id`
- **Response**: `{ course, levels: [ ... ] }`

### 5.3 Progress

#### GET `/api/progress/level/:id_level`
- **Response**:
  ```json
  {
    "level": { ... },
    "percent": 60,
    "theories": [ ... ],
    "quizzes": [ ... ],
    "exercises": [ ... ]
  }
  ```

#### GET `/api/progress/course/:id_courses`
- **Response**:
  ```json
  {
    "id_courses": 1,
    "levels": [
      {
        "id_level": 1,
        "status": 2,
        "score": 100,
        "attempts": 3,
        "theoriesCompleted": 5,
        "totalTheories": 5,
        "quizzesCompleted": 2,
        "totalQuizzes": 2,
        "percent": 100,
        "unlocked": true
      }
    ]
  }
  ```

#### POST `/api/progress/level/start`
- **Request**: `{ id_level }`
- **Response**: `{ message, data }`

#### POST `/api/progress/theory/complete`
- **Request**: `{ id_theory }`
- **Response**: `{ message, data }`

#### POST `/api/progress/quiz/complete`
- **Request**: `{ id_quiz, score }`
- **Response**: `{ message, data }`

#### POST `/api/progress/exercise/attempt`
- **Request**: `{ id_exercise, code, language }`
- **Response**: `{ passed, hint, xp_earned, coins_earned, ... }`

### 5.4 Rewards

#### POST `/api/rewards/claim`
- **Request**: `{ type }`
- **Response**: `{ message, xp, coins }`

### 5.5 Example: Completing a Quiz

**Request:**
```json
POST /api/progress/quiz/complete
{
  "id_quiz": 12,
  "score": 85
}
```
**Response:**
```json
{
  "message": "Quiz completed ✅",
  "data": {
    "id_user_quiz": 34,
    "id_user": "uuid",
    "id_quiz": 12,
    "score": 85,
    "completed_at": "2025-08-31T12:00:00Z",
    "status": "completed"
  }
}
```

---

## 6. Frontend (SPA)

### 6.1 Folder Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── viewsjs/         # Page views (e.g., quiz.js, level.js)
│   ├── services/        # API service wrappers (api.js)
│   ├── assets/          # Images, icons, etc.
│   ├── App.js           # Main SPA entry point
│   └── index.html
├── public/
├── package.json
└── vite.config.js
```

### 6.2 Navigation Flow

1. **Login/Register**:  
   - User authenticates via `/login` or `/register`.
   - JWT token is stored in localStorage/session.

2. **Courses List**:  
   - User sees available courses.
   - Selects a course to view its levels.

3. **Levels Overview**:  
   - User sees all levels in the course, with progress bars and unlock status.

4. **Level Detail**:  
   - User accesses a level to view theories, quizzes, and exercises.
   - Progress is tracked and displayed.

5. **Quiz/Exercise Views**:  
   - User completes quizzes and coding exercises.
   - Immediate feedback and rewards are shown.

6. **Progress Tracking**:  
   - User can view overall progress, achievements, and earned rewards.

---

## 7. Installation and Deployment Guide

### 7.1 Requirements

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Supabase** account (for PostgreSQL)
- **Render/Heroku** (for backend deployment, optional)

### 7.2 Local Development

#### 1. Clone the repository

```bash
git clone https://your-repo-url
cd Do
```

#### 2. Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install 
```

#### 3. Configure environment variables

- **Backend**: Create `.env` in `/backend` with:
  ```
  SUPABASE_URL=...
  SUPABASE_KEY=...
  OPENAI_API_KEY=...
  JWT_SECRET=...
  ```

#### 4. Run Supabase locally or connect to your Supabase project

- Set up tables using provided SQL migrations.

#### 5. Start backend and frontend

```bash
# In /backend
npm run dev

# In /frontend
npm run dev
```

- Access the app at `http://localhost:5173` (default Vite port).

### 7.3 Production Deployment

- **Frontend**: Deploy `/frontend` to Vercel or Netlify.
- **Backend**: Deploy `/backend` to Render, Heroku, or similar.
- **Database**: Use Supabase cloud or your own PostgreSQL instance.

---

## 8. Testing Strategy

### 8.1 Methodology

- **Unit Testing**: For backend controllers and utility functions.
- **Integration Testing**: For API endpoints (using tools like Jest, Supertest).
- **Manual Testing**: For frontend flows and UI/UX.

### 8.2 Example Test Cases

- **User Registration**
  - Input: Valid/invalid email, password.
  - Expected: User created, password hashed, JWT returned.

- **Login**
  - Input: Correct/incorrect credentials.
  - Expected: JWT issued or error message.

- **Course Progress**
  - Input: Complete a theory, quiz, or exercise.
  - Expected: Progress updated, rewards granted.

- **Saving Progress**
  - Input: Multiple attempts on exercises.
  - Expected: Only first successful attempt grants rewards.

---

## 9. Security Measures

### 9.1 Password Handling

- Passwords are hashed using **bcrypt** before storage.
- Plaintext passwords are never stored or logged.

### 9.2 Session Management

- Authentication is handled via **JWT** (JSON Web Tokens).
- Tokens are signed with a secret and have expiration times.
- JWT is sent in the `Authorization` header for protected endpoints.

### 9.3 API Security Best Practices

- All sensitive endpoints require authentication.
- Input validation and sanitization are enforced.
- Rate limiting and logging are recommended for production.
- CORS is configured to restrict origins.

---

## 10. Maintenance and Future Improvements

### 10.1 Scalability Recommendations

- Use connection pooling for PostgreSQL.
- Implement caching for frequently accessed data.
- Use background jobs for heavy tasks (e.g., code evaluation).
- Monitor performance and errors with tools like Sentry.

### 10.2 Possible New Features

- **Student Chat**: Real-time chat for peer support.
- **Global Ranking**: Leaderboards based on XP and achievements.
- **AI Integration**: More advanced feedback, adaptive learning paths.
- **Mobile App**: Native or PWA for mobile devices.
- **Teacher Dashboard**: Analytics and content management for educators.

---

>>>>>>> Juanda
