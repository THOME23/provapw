document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  if (usuario === "admin" && senha === "1234") {
    localStorage.setItem("sessionTime", new Date().getTime());
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("loginErro").textContent = "Usuário ou senha inválidos.";
  }
});