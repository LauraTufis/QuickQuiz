// 🔐 Verificare acces administrator
const user = JSON.parse(localStorage.getItem("loggedUser"));
if (!user || user.role !== "admin") {
  alert("Acces interzis.");
  window.location.href = "/login.html";
}

// 🔢 Număr total întrebări
const questionCountElement = document.getElementById("questionCount");
fetch("http://localhost:3000/questions/count")
  .then(res => res.json())
  .then(data => {
    questionCountElement.innerText = `Număr total de întrebări: ${data.count}`;
  })
  .catch(err => {
    console.error("Eroare la încărcarea numărului de întrebări:", err);
    questionCountElement.innerText = "Nu s-a putut încărca numărul de întrebări.";
  });

// 🔓 Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedUser");
  window.location.href = "/index.html";
});

// 🔍 Filtrare întrebări
document.getElementById("filterForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("searchText").value.trim();
  const category = document.getElementById("filterCategory").value;
  const difficulty = document.getElementById("filterDifficulty").value;

  try {
    const params = new URLSearchParams();
    if (text) params.append("text", text);
    if (category) params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);

    const res = await fetch(`http://localhost:3000/filter-questions?${params}`);
    const questions = await res.json();

    renderQuestions(questions);
  } catch (err) {
    console.error("❌ Eroare la filtrare:", err);
    alert("Eroare la încărcarea întrebărilor filtrate.");
  }
});

// 📋 Afișare întrebări
function renderQuestions(questions) {
  const tbody = document.querySelector("#questionsTable tbody");
  tbody.innerHTML = "";

  if (questions.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>Nicio întrebare găsită.</td></tr>";
    return;
  }

  questions.forEach((q, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${q.QuestionText}</td>
      <td>${q.Category}</td>
      <td>${q.Difficulty}</td>
      <td>
        <button onclick="editQuestion(${q.Id})">✏️</button>
        <button onclick="deleteQuestion(${q.Id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ❌ Ștergere întrebare
window.deleteQuestion = async (id) => {
  if (!confirm("Sigur dorești să ștergi această întrebare?")) return;
  try {
    const res = await fetch(`http://localhost:3000/question/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    alert(data.message);
    document.getElementById("filterForm").dispatchEvent(new Event("submit"));
  } catch (err) {
    console.error("❌ Eroare la ștergere întrebare:", err);
  }
};

// ✏️ Editare întrebare (redirect spre o altă pagină – de implementat)
window.editQuestion = (id) => {
  window.location.href = `/edit-question.html?id=${id}`;
};

// 📤 Export întrebări
window.exportQuestions = () => {
  window.open("http://localhost:3000/export-questions", "_blank");
};

// 📥 Import CSV
document.getElementById("importForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];
  if (!file) {
    alert("Selectează un fișier CSV.");
    return;
  }

  const formData = new FormData();
  formData.append("csv", file);

  try {
    const response = await fetch("http://localhost:3000/import-questions", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ Întrebări importate: ${data.inserted}`);
      setTimeout(()=>{
        document.getElementById("filterForm").dispatchEvent(new Event("submit"));
      },1000);

    } else {
      alert(`❌ Eroare: ${data.message}`);
    }
  }catch (err){
    console.error("❌ Eroare la import:", err);
    alert("Eroare la trimiterea fișierului.");
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  window.open("http://localhost:3000/export-questions", "_blank");
});
