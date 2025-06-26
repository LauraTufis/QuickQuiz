
-- 1. Creare baza de date
CREATE DATABASE QuickQuizDB;
GO

-- 2. Utilizare baza de date
USE QuickQuizDB;
GO

-- 3. Creare tabela Users
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('user', 'admin'))
);
GO

-- 4. Creare tabela Questions
CREATE TABLE Questions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    QuestionText NVARCHAR(MAX) NOT NULL,
    Choice1 NVARCHAR(255) NOT NULL,
    Choice2 NVARCHAR(255) NOT NULL,
    Choice3 NVARCHAR(255) NOT NULL,
    Choice4 NVARCHAR(255) NOT NULL,
    CorrectAnswer INT NOT NULL CHECK (CorrectAnswer BETWEEN 1 AND 4),
    Category NVARCHAR(100) NOT NULL,
    Difficulty NVARCHAR(20) NOT NULL CHECK (Difficulty IN ('easy', 'medium', 'hard'))
);
GO

-- 5. Creare tabela Scores
CREATE TABLE Scores (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
    Score INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 6. Inserare utilizator admin implicit (parola hashuită pentru exemplu)
-- Parola este: Admin123!
INSERT INTO Users (Username, Email, PasswordHash, Role)
VALUES ('admin', 'admin@example.com', 
  '2b9c3b4b7596b8aa0f3f9d706a16d0cd1e2f1e5b472b3a6f02f64e5e6c91d51d',
  'admin');
GO
