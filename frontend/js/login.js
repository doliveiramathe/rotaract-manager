const form = document.querySelector("#loginForm");
const errorBox = document.querySelector("#loginError");

if (localStorage.getItem("rotaractToken")) {
  window.location.href = "app.html";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.classList.add("hidden");

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    let data;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 404 || response.headers.get("content-type")?.includes("text/html")) {
        throw new TypeError("Backend indisponivel.");
      }

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel entrar.");
      }
    } catch (backendError) {
      if (!(backendError instanceof TypeError)) throw backendError;
      data = window.RotaractLocal.login(payload.username, payload.password);
    }

    localStorage.setItem("rotaractToken", data.token);
    localStorage.setItem("rotaractUser", JSON.stringify(data.user));
    window.location.href = "app.html";
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove("hidden");
  }
});
