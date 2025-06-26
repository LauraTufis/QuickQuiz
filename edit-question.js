document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const questionId = params.get("id");

  if (!questionId) {
    alert("Lipsă ID întrebare.");
    window.location.href = "/admin-questions.html";
    return;
  }

  const form = document.getElementById("editForm");

  // ✅ Încarcă datele întrebării existente
  try {
    const res = await fetch(`http://localhost:3000/question/${questionId}`);
    if (!res.ok) throw new Error("Nu s-a putut încărca întrebarea.");
    const data = await res.json();

    document.getElementById("question").value = data.QuestionText;
    document.getElementById("choice1").value = data.Choice1;
    document.getElementById("choice2").value = data.Choice2;
    document.getElementById("choice3").value = data.Choice3;
    document.getElementById("choice4").value = data.Choice4;
    document.getElementById("correctAnswer").value = data.CorrectAnswer;
    document.getElementById("category").value = data.Category;
    document.getElementById("difficulty").value = data.Difficulty;

  } catch (err) {
    console.error("❌ Eroare la încărcare întrebare:", err);
    alert("Eroare la încărcarea întrebării.");
  }

  // 📝 Trimite modificările
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const question = document.getElementById("question").value.trim();
    const choices = [
      document.getElementById("choice1").value.trim(),
      document.getElementById("choice2").value.trim(),
      document.getElementById("choice3").value.trim(),
      document.getElementById("choice4").value.trim()
    ];
    const correctAnswer = parseInt(document.getElementById("correctAnswer").value);
    const category = document.getElementById("category").value.trim();
    const difficulty = document.getElementById("difficulty").value;

    try {
      const res = await fetch(`http://localhost:3000/question/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question,
          choices,
          correctAnswer,
          category,
          difficulty
        })
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Eroare la salvarea întrebării.");
        return;
      }

      alert("✅ Întrebarea a fost actualizată.");
      window.location.href = "/admin-questions.html";
    } catch (err) {
      console.error("❌ Eroare la trimiterea modificărilor:", err);
      alert("Eroare la actualizarea întrebării.");
    }
  });
});
