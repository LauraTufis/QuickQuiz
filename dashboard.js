document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedUser"));

  if (!user || !user.username) {
    alert("Trebuie să fii autentificat pentru a accesa dashboard-ul.");
    window.location.href = "/login.html";
    return;
  }

  const username = user.username;
  let latestScore = "N/A";

  try {
    const res = await fetch(`http://localhost:3000/user-scores?username=${encodeURIComponent(username)}`);
    const scores = await res.json();

    if (res.ok && scores.length > 0) {
      latestScore = `${scores[0].Score} puncte`;
    }
  } catch (err) {
    console.error("Eroare la încărcarea ultimului scor:", err);
  }


  // Salut personalizat
  const welcomeEl = document.getElementById("welcome");
  welcomeEl.innerText = `Salut, ${username}!`;

  // Ultimul scor
  const latestScoreEl = document.getElementById("latestScore");
  latestScoreEl.innerText = latestScore !== null ? `${latestScore} puncte` : "N/A";

  // Top 5 scoruri personale
  const topScoresList = document.getElementById("topScoresList");

  try {
    const response = await fetch(`http://localhost:3000/user-scores?username=${encodeURIComponent(username)}`);
    const scores = await response.json();

    if (!response.ok) {
      throw new Error(scores.message || "Eroare la încărcarea scorurilor.");
    }

    if (scores.length === 0) {
      topScoresList.innerHTML = "<li>Nu ai încă scoruri salvate.</li>";
    } else {
      topScoresList.innerHTML = scores
        .map((s) => {
          const date = new Date(s.CreatedAt);
          const formatted = date.toLocaleString("ro-RO", {
            dateStyle: "short",
            timeStyle: "short",
          });
          return `<li class="high-score">${s.Score} puncte – ${formatted}</li>`;
        })
        .join("");
    }
  } catch (err) {
    console.error("❌ Eroare la încărcarea scorurilor personale:", err);
    topScoresList.innerHTML = "<li>Eroare la încărcarea scorurilor.</li>";
  }

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    sessionStorage.clear();
    window.location.href = "/index.html";
  });
});
