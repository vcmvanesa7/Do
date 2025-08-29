-- ===============================
-- TABLA USERS
-- ===============================
CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW(),
    photoURL TEXT
);

-- ===============================
-- TABLA LANGUAGES
-- ===============================
CREATE TABLE courses (
    id_course SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- ===============================
-- TABLA USERS_LANGUAGES (relación N:N entre users y languages)
-- ===============================
CREATE TABLE users_courses (
    id_user INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_courses INT NOT NULL REFERENCES languages(id_language) ON DELETE CASCADE,
    level INT DEFAULT 0,
    PRIMARY KEY (id_user, id_language)
);

-- ===============================
-- TABLA LEVEL
-- ===============================
CREATE TABLE level (
    id_level SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    step INT NOT NULL,
    id_courses INT NOT NULL REFERENCES languages(id_language) ON DELETE CASCADE,
    finished BOOLEAN DEFAULT FALSE
);

-- ===============================
-- TABLA THEORY
-- ===============================
CREATE TABLE theory (
    id_theory SERIAL PRIMARY KEY,
    id_level INT NOT NULL REFERENCES level(id_level) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content TEXT
);

-- ===============================
-- TABLA QUIZ
-- ===============================
CREATE TABLE quiz (
    id SERIAL PRIMARY KEY,
    type INT NOT NULL, -- podría transformarse en ENUM (ej: opción múltiple, verdadero/falso)
    name VARCHAR(255) NOT NULL,
    id_theory INT NOT NULL REFERENCES theory(id_theory) ON DELETE CASCADE
);

-- ===============================
-- TABLA PROGRESS
-- ===============================
CREATE TABLE progress (
    id_progress SERIAL PRIMARY KEY,
    id_level INT NOT NULL REFERENCES level(id_level) ON DELETE CASCADE,
    id_user INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    startAt DATE DEFAULT NOW(),
    endAt DATE,
    status INT -- se recomienda ENUM: 0=pending,1=in_progress,2=completed,3=failed
);

-- ===============================
-- ÍNDICES RECOMENDADOS
-- ===============================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_progress_user ON progress(id_user);
CREATE INDEX idx_progress_level ON progress(id_level);
CREATE INDEX idx_level_language ON level(id_language);
