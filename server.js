const bcrypt = require('bcrypt');
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });


const config = {
  user: 'quiz_user',
  password: 'QuizPassword123!',
  server: 'DESKTOP-211M7N2', 
  database: 'QuickQuizDB',
  options: {
    trustServerCertificate: true
  }
};

// REGISTER
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii.' });
  }

  try {
    const pool = await sql.connect(config);

    // Verifică dacă utilizatorul există deja
    const checkUser = await pool.request()
      .input('Username', sql.NVarChar, username)
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Username = @Username OR Email = @Email');

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Username sau email deja folosit.' });
    }

    // Criptează parola
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salvează utilizatorul
    await pool.request()
      .input('Username', sql.NVarChar, username)
      .input('Email', sql.NVarChar, email)
      .input('PasswordHash', sql.NVarChar, hashedPassword)
      .query('INSERT INTO Users (Username, Email, PasswordHash) VALUES (@Username, @Email, @PasswordHash)');

    res.status(201).json({ message: 'Cont creat cu succes!' });
  } catch (err) {
    console.error('Eroare la înregistrare:', err);
    res.status(500).json({ message: 'Eroare la înregistrare.', error: err.message });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email și parolă obligatorii.' });
  }

  try {
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @Email');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: 'Email sau parolă incorecte.' });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email sau parolă incorecte.' });
    }

    res.status(200).json({
      message: 'Autentificare reușită!',
      username: user.Username,
      role: user.Role
    });
  } catch (err) {
    console.error('Eroare la autentificare:', err);
    res.status(500).json({ message: 'Eroare internă la autentificare.', error: err.message });
  }
});

//ADD QUESTION
app.post('/add-question', async (req, res) => {
  try {
    const {
      question,
      choices,
      correctAnswer,
      category,
      difficulty
    } = req.body;

    if (
      !question || !choices || choices.length !== 4 ||
      !correctAnswer || !category || !difficulty
    ) {
      return res.status(400).json({ message: "Date incomplete sau invalide." });
    }

    const pool = await sql.connect(config);

    await pool.request()
      .input('QuestionText', sql.NVarChar, question)
      .input('Choice1', sql.NVarChar, choices[0])
      .input('Choice2', sql.NVarChar, choices[1])
      .input('Choice3', sql.NVarChar, choices[2])
      .input('Choice4', sql.NVarChar, choices[3])
      .input('CorrectAnswer', sql.Int, correctAnswer)
      .input('Category', sql.NVarChar, category)
      .input('Difficulty', sql.NVarChar, difficulty)
      .query(`
        INSERT INTO Questions 
        (QuestionText, Choice1, Choice2, Choice3, Choice4, CorrectAnswer, Category, Difficulty)
        VALUES 
        (@QuestionText, @Choice1, @Choice2, @Choice3, @Choice4, @CorrectAnswer, @Category, @Difficulty)
      `);

    res.status(200).json({ message: "Întrebarea a fost adăugată cu succes." });
  } catch (err) {
    console.error("Eroare la adăugarea întrebării:", err);
    res.status(500).json({ message: "Eroare la salvarea întrebării.", error: err.message });
  }
});

//GET QUESTIONS
app.get('/questions', async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    const pool = await sql.connect(config);

    let query = `
      SELECT TOP 10 
        Id,
        QuestionText,
        Choice1,
        Choice2,
        Choice3,
        Choice4,
        CorrectAnswer
      FROM Questions
    `;

    // Dacă există filtrare (opțională)
    const filters = [];
    if (category) {
      filters.push(`Category = @Category`);
    }
    if (difficulty) {
      filters.push(`Difficulty = @Difficulty`);
    }

    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }

    query += ' ORDER BY NEWID()'; // Randomizează rezultatele

    const request = pool.request();
    if (category) request.input('Category', sql.NVarChar, category);
    if (difficulty) request.input('Difficulty', sql.NVarChar, difficulty);

    const result = await request.query(query);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("❌ Eroare la extragerea întrebărilor:", err);
    res.status(500).json({ message: "Eroare la extragerea întrebărilor", error: err.message });
  }
});

//GET QUESTION COUNT FOR ADMIN DASHBORD
app.get('/questions/count', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT COUNT(*) AS count FROM Questions');
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Eroare la interogarea numărului de întrebări:", err);
    res.status(500).json({ message: "Eroare la interogare", error: err.message });
  }
});


app.post('/savescore', async (req, res) => {
  try {
    const { username, score } = req.body;
    const pool = await sql.connect(config);

    await pool.request()
      .input('Username', sql.NVarChar, username)
      .input('Score', sql.Int, score)
      .query('INSERT INTO Scores (Username, Score) VALUES (@Username, @Score)');

    res.status(200).json({ message: 'Scor salvat cu succes!' });
  } catch (err) {
    console.error('Eroare la salvare:', err);
    res.status(500).json({ message: 'Eroare la salvare', error: err.message });
  }
});

//SAVE SCORE
app.post('/savescore', async (req, res) => {
  try {
    const { username, score } = req.body;
    const pool = await sql.connect(config);

    await pool.request()
      .input('Username', sql.NVarChar, username)
      .input('Score', sql.Int, score)
      .query('INSERT INTO Scores (Username, Score) VALUES (@Username, @Score)');

    res.status(200).json({ message: 'Scor salvat cu succes!' });
  } catch (err) {
    console.error('Eroare la salvare:', err);
    res.status(500).json({ message: 'Eroare la salvare', error: err.message });
  }
});

//GET USER SCORE
app.get('/user-scores', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username-ul este necesar." });
  }

  try {
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('Username', sql.NVarChar, username)
      .query(`
        SELECT TOP 5 
          Score, 
          CreatedAt 
        FROM Scores
        WHERE Username = @Username
        ORDER BY CreatedAt DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("❌ Eroare la extragerea scorurilor personale:", err);
    res.status(500).json({ message: "Eroare la extragerea scorurilor personale", error: err.message });
  }
});



app.get('/highscores', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request()
      .query(`
        SELECT TOP 5 
          Username, 
          Score, 
          FORMAT(CreatedAt, 'yyyy-MM-ddTHH:mm:ss') AS CreatedAt
        FROM Scores
        ORDER BY Score DESC
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Eroare la citirea scorurilor:', err);
    res.status(500).json({ message: 'Eroare la citirea scorurilor', error: err.message });
  }
});

// GET ALL QUESTIONS
app.get("/all-questions", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT Id, QuestionText, Category, Difficulty 
      FROM Questions
      ORDER BY CreatedAt DESC
    `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("❌ Eroare la preluarea întrebărilor:", err);
    res.status(500).json({ message: "Eroare server", error: err.message });
  }
});

// DELETE QUESTION
app.delete("/question/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input("Id", sql.Int, id)
      .query("DELETE FROM Questions WHERE Id = @Id");
    
    res.status(200).json({ message: "Întrebarea a fost ștearsă." });
  } catch (err) {
    console.error("❌ Eroare la ștergere:", err);
    res.status(500).json({ message: "Eroare la ștergere", error: err.message });
  }
});

//EXPORT QUESTIONS CSV 
const { Parser } = require('json2csv'); // npm install json2csv dacă nu ai deja

app.get('/export-questions', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        Id, QuestionText, Choice1, Choice2, Choice3, Choice4, CorrectAnswer, Category, Difficulty
      FROM Questions
    `);

    const questions = result.recordset;

    const fields = [
      { label: 'ID', value: 'Id' },
      { label: 'Întrebare', value: 'QuestionText' },
      { label: 'Variantă 1', value: 'Choice1' },
      { label: 'Variantă 2', value: 'Choice2' },
      { label: 'Variantă 3', value: 'Choice3' },
      { label: 'Variantă 4', value: 'Choice4' },
      { label: 'Răspuns corect (1-4)', value: 'CorrectAnswer' },
      { label: 'Categorie', value: 'Category' },
      { label: 'Dificultate', value: 'Difficulty' },
    ];

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(questions);

    res.header('Content-Type', 'text/csv');
    res.attachment('intrebari_quiz.csv');
    res.send(csv);
  } catch (err) {
    console.error("❌ Eroare la exportul întrebărilor:", err);
    res.status(500).json({ message: "Eroare la exportul întrebărilor", error: err.message });
  }
});

// IMPORT QUESTIONS CSV
app.post('/import-questions', upload.single('csv'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Fișier CSV lipsă." });
  }

  const filePath = req.file.path;
  const questions = [];

  fs.createReadStream(filePath)
    .on('error', (err) => {
      console.error("❌ Eroare la citirea fișierului:", err);
      res.status(500).json({ message: "Eroare la citirea fișierului CSV." });
    })
    .pipe(csv())
    .on('data', (row) => {
      questions.push(row);
    })
    .on('end', async () => {
      try {
        const pool = await sql.connect(config);

        for (const q of questions) {
          await pool.request()
            .input("QuestionText", sql.NVarChar, q.QuestionText)
            .input("Choice1", sql.NVarChar, q.Choice1)
            .input("Choice2", sql.NVarChar, q.Choice2)
            .input("Choice3", sql.NVarChar, q.Choice3)
            .input("Choice4", sql.NVarChar, q.Choice4)
            .input("CorrectAnswer", sql.Int, parseInt(q.CorrectAnswer))
            .input("Category", sql.NVarChar, q.Category)
            .input("Difficulty", sql.NVarChar, q.Difficulty)
            .query(`
              INSERT INTO Questions (QuestionText, Choice1, Choice2, Choice3, Choice4, CorrectAnswer, Category, Difficulty)
              VALUES (@QuestionText, @Choice1, @Choice2, @Choice3, @Choice4, @CorrectAnswer, @Category, @Difficulty)
            `);
        }

        fs.unlinkSync(filePath); // șterge fișierul după import
        res.status(200).json({ message: "Import reușit", inserted: questions.length });

      } catch (err) {
        console.error("❌ Eroare la import în baza de date:", err);
        res.status(500).json({ message: "Eroare la importul întrebărilor.", error: err.message });
      }
    });
});


// STATS SCORES
app.get('/stats/scores', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    
    const totalScores = await pool.request()
      .query(`SELECT COUNT(*) AS Total FROM Scores`);
      
    const avgScore = await pool.request()
      .query(`SELECT AVG(Score) AS Average FROM Scores`);

    const uniqueUsers = await pool.request()
      .query(`SELECT COUNT(DISTINCT Username) AS UniqueUsers FROM Scores`);

    const topUsers = await pool.request()
      .query(`
        SELECT TOP 5 Username, MAX(Score) AS BestScore
        FROM Scores
        GROUP BY Username
        ORDER BY BestScore DESC
      `);

    res.json({
      totalScores: totalScores.recordset[0].Total,
      averageScore: Math.round(avgScore.recordset[0].Average),
      uniqueUsers: uniqueUsers.recordset[0].UniqueUsers,
      topUsers: topUsers.recordset
    });
  } catch (err) {
    console.error("❌ Eroare statistici scoruri:", err);
    res.status(500).json({ message: "Eroare la extragerea statisticilor." });
  }
});

//GET ALL USERS and ADMINS
app.get('/admin/users', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT Id, Username, Email, Role 
      FROM Users
      ORDER BY Username
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Eroare la extragerea utilizatorilor:", err);
    res.status(500).json({ message: "Eroare la extragerea utilizatorilor." });
  }
});

// DELETE USER
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);

    await pool.request()
      .input('Id', sql.Int, id)
      .query('DELETE FROM Users WHERE Id = @Id');

    res.json({ message: "Utilizator șters cu succes" });
  } catch (err) {
    console.error("❌ Eroare la ștergere:", err);
    res.status(500).json({ message: "Eroare server" });
  }
});

// MODIFY ROLL
app.put('/users/:id/role', async (req, res) => {
  //console.log("Ruta schimb rol apelată"); // <-- DEBUG
  const userId = req.params.id;
  const { newRole } = req.body;

  if (!["user", "admin"].includes(newRole)) {
    return res.status(400).json({ message: "Rol invalid." });
  }

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input("Id", sql.Int, userId)
      .input("Role", sql.NVarChar, newRole)
      .query("UPDATE Users SET Role = @Role WHERE Id = @Id");

    res.status(200).json({ message: `Rol schimbat în ${newRole}.` });
  } catch (err) {
    console.error("❌ Eroare la schimbarea rolului:", err);
    res.status(500).json({ message: "Eroare la schimbarea rolului.", error: err.message });
  }
});

// FILTER-QUESTIONS
app.get("/filter-questions", async (req, res) => {
  const { text, category, difficulty } = req.query;

  try {
    const pool = await sql.connect(config);

    let query = `
      SELECT Id, QuestionText, Category, Difficulty
      FROM Questions
      WHERE 1=1
    `;

    if (text) query += ` AND QuestionText LIKE '%' + @text + '%'`;
    if (category) query += ` AND Category = @category`;
    if (difficulty) query += ` AND Difficulty = @difficulty`;

    const request = pool.request();
    if (text) request.input("text", sql.NVarChar, text);
    if (category) request.input("category", sql.NVarChar, category);
    if (difficulty) request.input("difficulty", sql.NVarChar, difficulty);

    const result = await request.query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Eroare la filtrarea întrebărilor:", err);
    res.status(500).json({ message: "Eroare la filtrare", error: err.message });
  }
});


//GET QUESTION BY ID
app.get('/question/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('Id', sql.Int, id)
      .query(`SELECT * FROM Questions WHERE Id = @Id`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Întrebarea nu a fost găsită." });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Eroare la GET /question/:id", err);
    res.status(500).json({ message: "Eroare la preluarea întrebării." });
  }
});

//MODIFY QUESTION BY ID

app.put('/question/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      question,
      choices,
      correctAnswer,
      category,
      difficulty
    } = req.body;

    if (
      !question || !choices || choices.length !== 4 ||
      !correctAnswer || !category || !difficulty
    ) {
      return res.status(400).json({ message: "Date invalide pentru actualizare." });
    }

    const pool = await sql.connect(config);

    await pool.request()
      .input('Id', sql.Int, id)
      .input('QuestionText', sql.NVarChar, question)
      .input('Choice1', sql.NVarChar, choices[0])
      .input('Choice2', sql.NVarChar, choices[1])
      .input('Choice3', sql.NVarChar, choices[2])
      .input('Choice4', sql.NVarChar, choices[3])
      .input('CorrectAnswer', sql.Int, correctAnswer)
      .input('Category', sql.NVarChar, category)
      .input('Difficulty', sql.NVarChar, difficulty)
      .query(`
        UPDATE Questions
        SET QuestionText = @QuestionText,
            Choice1 = @Choice1,
            Choice2 = @Choice2,
            Choice3 = @Choice3,
            Choice4 = @Choice4,
            CorrectAnswer = @CorrectAnswer,
            Category = @Category,
            Difficulty = @Difficulty
        WHERE Id = @Id
      `);

    res.json({ message: "Întrebarea a fost actualizată cu succes." });
  } catch (err) {
    console.error("❌ Eroare la PUT /question/:id", err);
    res.status(500).json({ message: "Eroare la actualizarea întrebării." });
  }
});

//DELETE QUESTION BY ID

app.delete('/question/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const pool = await sql.connect(config);

    await pool.request()
      .input('Id', sql.Int, id)
      .query(`DELETE FROM Questions WHERE Id = @Id`);

    res.json({ message: "Întrebarea a fost ștearsă cu succes." });
  } catch (err) {
    console.error("❌ Eroare la DELETE /question/:id", err);
    res.status(500).json({ message: "Eroare la ștergerea întrebării." });
  }
});




app.listen(3000, () => {
  console.log('✅ Serverul rulează pe http://localhost:3000');
});
