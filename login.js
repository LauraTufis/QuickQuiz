const form = document.getElementById("loginForm");
const errorText = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorText.innerText = data.message || "Eroare la autentificare.";
      return;
    }

    const user = {
      email: data.email,
      username: data.username,
      role: data.role
    };

    localStorage.setItem("loggedUser", JSON.stringify(user));

    alert("Autentificare reușită!");

    if (user.role === "admin") {
      window.location.href = "/admin-dashboard.html";
    } else {
      window.location.href = "/dashboard.html";
    }

  } catch (err) {
    console.error("❌ Eroare de rețea:", err);
    errorText.innerText = "Serverul nu răspunde.";
  }
});
