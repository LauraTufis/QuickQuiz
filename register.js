const form = document.getElementById("registerForm");
const errorText = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    errorText.innerText = "Parolele nu coincid.";
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      errorText.innerText = data.message || "Eroare la înregistrare.";
    } else {
      alert("Cont creat cu succes!");
      window.location.href = "/login.html";
    }
  } catch (err) {
    console.error("Eroare la conectare:", err);
    errorText.innerText = "Serverul nu răspunde.";
  }
});
