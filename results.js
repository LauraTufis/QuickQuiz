const scoreText = document.getElementById("userScore");
const highScoresList = document.getElementById("highScoresList");
const score = sessionStorage.getItem("mostRecentScore");
const user = JSON.parse(localStorage.getItem("loggedUser"));

if (!user || !score) {
  alert("Trebuie să fii autentificat.");
  window.location.href = "/login.html";
}

// Afișăm scorul personal
scoreText.innerText = `Scor: ${score} puncte`;

// Salvăm scorul în baza de date
const saveScore = async () => {
  try {
    const response = await fetch("http://localhost:3000/savescore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user.username,
        score: parseInt(score)
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Eroare server:", data);
      alert("Eroare la salvarea scorului.");
    }
  } catch (err) {
    console.error("❌ Eroare rețea:", err);
    alert("Serverul nu răspunde.");
  }
};

// Afișăm top 5 scoruri
const fetchHighScores = async () => {
  try {
    const response = await fetch("http://localhost:3000/highscores");
    const highScores = await response.json();

    highScoresList.innerHTML = highScores
      .map(score => {
        const date = new Date(score.CreatedAt);
        const formatted = date.toLocaleString("ro-RO", {
          dateStyle: "short",
          timeStyle: "short"
        });

        return `<li class="high-score">
          ${score.Username} - ${score.Score} puncte - ${formatted}
        </li>`;
      })
      .join("");
  } catch (err) {
    console.error("❌ Eroare la încărcarea scorurilor:", err);
    highScoresList.innerHTML = "<li>Eroare la încărcarea scorurilor.</li>";
  }
};

// Executăm totul
saveScore().then(fetchHighScores);
