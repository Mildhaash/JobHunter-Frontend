(function () {
  var API_BASE = "https://job-hunter-backend-five.vercel.app";

  function getToken() {
    var params = new URLSearchParams(window.location.search);
    return params.get("token");
  }

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

  async function validateToken(token) {
    try {
      var res = await fetch(API_BASE + "/api/auth/reset-password/" + token);
      if (!res.ok) {
        showMessage("invalidMsg", "This reset link is invalid or has expired. Please request a new one.", "#e74c3c");
        return false;
      }
      var data = await res.json();
      if (data.email) {
        var subtitle = document.querySelector(".auth-subtitle");
        if (subtitle) subtitle.textContent = "Resetting password for " + data.email;
      }
      document.getElementById("resetForm").style.display = "flex";
      return true;
    } catch {
      showMessage("invalidMsg", "Could not connect to server.", "#e74c3c");
      return false;
    }
  }

  function initResetForm(token) {
    var form = document.getElementById("resetForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      hideMessage("successMsg");
      hideMessage("invalidMsg");

      var password = form.password.value;
      var confirmPassword = form.confirmPassword.value;

      if (!password || !confirmPassword) {
        showMessage("invalidMsg", "Please fill out both fields.", "#e74c3c");
        return;
      }
      if (password.length < 6) {
        showMessage("invalidMsg", "Password must be at least 6 characters.", "#e74c3c");
        return;
      }
      if (password !== confirmPassword) {
        showMessage("invalidMsg", "Passwords do not match.", "#e74c3c");
        return;
      }

      LoadingOverlay.show("Resetting password...");
      try {
        var res = await fetch(API_BASE + "/api/auth/reset-password/" + token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: password }),
        });
        var data = await res.json();

        LoadingOverlay.hide();

        if (!res.ok) {
          showMessage("invalidMsg", data.error || "Something went wrong.", "#e74c3c");
          return;
        }

        form.style.display = "none";
        showMessage("successMsg", "Password reset successfully! Redirecting to login...", "#27ae60");
        setTimeout(function () {
          window.location.href = "login.html";
        }, 2500);
      } catch {
        LoadingOverlay.hide();
        showMessage("invalidMsg", "Could not connect to server.", "#e74c3c");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    var token = getToken();
    if (!token) {
      showMessage("invalidMsg", "No reset token found. Please use the link from your email.", "#e74c3c");
      return;
    }
    await validateToken(token);
    initResetForm(token);
  });
})();
