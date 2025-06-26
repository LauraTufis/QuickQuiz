document.getElementById("questionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = document.getElementById("question").value.trim();
  const choice1 = document.getElementById("choice1").value.trim();
  const choice2 = document.getElementById("choice2").value.trim();
  const choice3 = document.getElementById("choice3").value.trim();
  const choice4 = document.getElementById("choice4").value.trim();
  const correctAnswer = parseInt(document.getElementById("correctAnswer").value);
  const category = document.getElementById("category").value.trim();
  const difficulty = document.getElementById("difficulty").value;

  const payload = {
    question,
    choices: [choice1, choice2, choice3, choice4],
    correctAnswer,
    category,
    difficulty
  };

  try {
    const res = await fetch("http://localhost:3000/add-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`❌ Eroare: ${data.message}`);
    } else {
      alert("✅ Întrebare adăugată cu succes!");
      document.getElementById("questionForm").reset();
    }
  } catch (err) {
    console.error("❌ Eroare la trimiterea întrebării:", err);
    alert("A apărut o eroare la salvarea întrebării.");
  }
});
