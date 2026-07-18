(function () {
  const API_BASE = "https://job-hunter-backend-five.vercel.app";

  function showMessage(id, text, color) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.style.color = color || "inherit";
    el.style.display = "block";
  }

  function hideMessage(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = "none";
  }

  function initForgotForm() {
    var form = document.getElementById("forgotForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      hideMessage("successMsg");
      hideMessage("errorMsg");

      var email = form.email.value.trim();
      if (!email) {
        showMessage("errorMsg", "Please enter your email address.", "#e74c3c");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        showMessage("errorMsg", "Please enter a valid email address.", "#e74c3c");
        return;
      }

      LoadingOverlay.show("Sending reset link...");
      try {
        var res = await fetch(API_BASE + "/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        });
        var data = await res.json();

        LoadingOverlay.hide();

        if (!res.ok) {
          showMessage("errorMsg", data.error || "Something went wrong.", "#e74c3c");
          return;
        }

        form.style.display = "none";
        showMessage("successMsg", data.message || "If an account exists with that email, a reset link has been sent.", "#27ae60");
      } catch {
        LoadingOverlay.hide();
        showMessage("errorMsg", "Could not connect to server.", "#e74c3c");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initForgotForm);
})();
