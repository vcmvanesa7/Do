-- =========================
-- Tabla: users
-- =========================
CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    name VARCHAR,
    email VARCHAR UNIQUE NOT NULL,
    p VARCHAR, -- contraseña (puede encriptarse mejor en el backend)
    createdat TIMESTAMP DEFAULT NOW(),
    photourl TEXT,
    role VARCHAR
);

-- =========================
-- Tabla: courses
-- =========================
CREATE TABLE courses (
    id_courses SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT
);

-- =========================
-- Tabla: level
-- =========================
CREATE TABLE level (
    id_level SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    step INT,
    id_courses INT REFERENCES courses(id_courses) ON DELETE CASCADE,
    finished BOOLEAN DEFAULT FALSE
);

-- =========================
-- Tabla: theory
-- =========================
CREATE TABLE theory (
    id_theory SERIAL PRIMARY KEY,
    id_level INT REFERENCES level(id_level) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    content TEXT
);

-- =========================
-- Tabla: quiz
-- =========================
CREATE TABLE quiz (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    id_theory INT REFERENCES theory(id_theory) ON DELETE CASCADE,
    type VARCHAR
);

-- =========================
-- Tabla: questions
-- =========================
CREATE TYPE quiz_type AS ENUM ('multiple_choice', 'code_fix', 'code_creation');

CREATE TABLE questions (
    id_question SERIAL PRIMARY KEY,
    id_quiz INT REFERENCES quiz(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB, -- almacena las opciones de respuesta
    answer INT,    -- índice de la respuesta correcta
    type quiz_type,
    solution TEXT
);

-- =========================
-- Tabla: progress
-- =========================
CREATE TABLE progress (
    id_progress SERIAL PRIMARY KEY,
    id_level INT REFERENCES level(id_level) ON DELETE CASCADE,
    id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
    startat DATE,
    endat DATE,
    status INT
);

-- =========================
-- Tabla: users_courses
-- =========================
CREATE TABLE users_courses (
    id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
    id_courses INT REFERENCES courses(id_courses) ON DELETE CASCADE,
    level INT,
    PRIMARY KEY (id_user, id_courses)
);

-- ===============================
-- ÍNDICES RECOMENDADOS
-- ===============================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_progress_user ON progress(id_user);
CREATE INDEX idx_progress_level ON progress(id_level);
CREATE INDEX idx_level_language ON level(id_language);
