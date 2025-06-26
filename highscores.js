const highScoresList = document.getElementById("highScoresList");

const fetchHighScores = async () => {
  try {
    const response = await fetch('http://localhost:3000/highscores');
    const highScores = await response.json();

    highScoresList.innerHTML = highScores
      .map(score => {
        const date= new Date(score.CreatedAt);
        const formatted = date.toLocaleString('ro-Ro',{
            dateStyle:'short',
            timeStyle: 'short'
        });

        return `<li class="high-score">
                    ${score.Username} - ${score.Score} puncte - ${formatted}
                </li>`
      })
      .join("");
  } catch (error) {
    console.error("❌ Eroare la încărcarea scorurilor:", error);
    highScoresList.innerHTML = "<li>Eroare la încărcarea scorurilor.</li>";
  }
};

fetchHighScores();
