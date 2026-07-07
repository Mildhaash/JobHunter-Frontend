// ---------- Dashboard: stats + Chart.js visuals ----------

let statusChartInstance = null;
let monthlyChartInstance = null;
let interviewChartInstance = null;

function themeColor(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function monthLabel(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function lastSixMonths() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: monthLabel(d.getFullYear(), d.getMonth()) });
  }
  return months;
}

function renderLegend(targetId, items) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = items
    .map(
      (item) =>
        `<li><span class="legend-dot" style="background:${item.color}"></span>${escapeHtml(item.label)}: ${item.value}</li>`
    )
    .join("");
}

function renderStats(apps) {
  const total = apps.length;
  const interviewsTotal = apps.filter((a) => a.status === "Interview" || a.status === "Offer").length;
  const activeInterviews = apps.filter((a) => a.status === "Interview").length;
  const offers = apps.filter((a) => a.status === "Offer").length;
  const activePipeline = apps.filter((a) => a.status === "Applied" || a.status === "Interview").length;

  const interviewRate = total ? Math.round((interviewsTotal / total) * 100) : 0;
  const conversion = total ? Math.round((offers / total) * 100) : 0;

  document.getElementById("headCount").textContent = total;
  document.getElementById("statTotal").textContent = total;
  document.getElementById("statInterview").textContent = interviewsTotal;
  document.getElementById("statInterviewActive").textContent = `(${activeInterviews} active)`;
  document.getElementById("statInterviewRate").textContent = `${interviewRate}% interview rate`;
  document.getElementById("statOffer").textContent = offers;
  document.getElementById("statConversion").textContent = `${conversion}% conversion`;
  document.getElementById("statActive").textContent = activePipeline;
}

function renderStatusChart(apps) {
  const counts = {
    Applied: apps.filter((a) => a.status === "Applied").length,
    Interview: apps.filter((a) => a.status === "Interview").length,
    Offer: apps.filter((a) => a.status === "Offer").length,
    Rejected: apps.filter((a) => a.status === "Rejected").length
  };

  const colors = [themeColor("--color-blue-dark"), themeColor("--color-accent"), themeColor("--color-green-dark"), themeColor("--color-red")];

  const data = {
    labels: Object.keys(counts),
    datasets: [{ data: Object.values(counts), backgroundColor: colors, borderWidth: 0 }]
  };

  const ctx = document.getElementById("statusChart");
  if (statusChartInstance) statusChartInstance.destroy();
  statusChartInstance = new Chart(ctx, {
    type: "doughnut",
    data,
    options: { responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { display: false }, tooltip: { enabled: true } } }
  });

  renderLegend(
    "statusLegend",
    Object.keys(counts).map((label, i) => ({ label, value: counts[label], color: colors[i] }))
  );
}

function renderMonthlyChart(apps) {
  const months = lastSixMonths();
  const counts = months.map(
    (m) => apps.filter((a) => {
      const d = new Date(a.date + "T00:00:00");
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length
  );

  const data = {
    labels: months.map((m) => m.label),
    datasets: [{ data: counts, backgroundColor: themeColor("--color-accent"), borderRadius: 6, maxBarThickness: 36 }]
  };

  const gridColor = themeColor("--color-border");
  const textColor = themeColor("--color-text-muted");

  const ctx = document.getElementById("monthlyChart");
  if (monthlyChartInstance) monthlyChartInstance.destroy();
  monthlyChartInstance = new Chart(ctx, {
    type: "bar",
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { beginAtZero: true, ticks: { precision: 0, color: textColor }, grid: { color: gridColor } }
      }
    }
  });
}

function renderInterviewChart(apps) {
  const total = apps.length;
  const interviewed = apps.filter((a) => a.status !== "Applied").length;
  const notInterviewed = total - interviewed;

  const colors = [themeColor("--color-green-dark"), themeColor("--color-border")];

  const data = {
    labels: ["Interviewed", "Not interviewed"],
    datasets: [{ data: [interviewed, notInterviewed], backgroundColor: colors, borderWidth: 0 }]
  };

  const ctx = document.getElementById("interviewChart");
  if (interviewChartInstance) interviewChartInstance.destroy();
  interviewChartInstance = new Chart(ctx, {
    type: "doughnut",
    data,
    options: { responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { display: false } } }
  });

  renderLegend("interviewLegend", [
    { label: "Interviewed", value: interviewed, color: colors[0] },
    { label: "Not interviewed", value: notInterviewed, color: colors[1] }
  ]);
}

async function renderDashboard() {
  const apps = await DataStore.getApplications();
  renderStats(apps);
  renderStatusChart(apps);
  renderMonthlyChart(apps);
  renderInterviewChart(apps);
}

async function renderGmailStatus() {
  try {
    const status = await DataStore.getGmailStatus();
    const lastSync = document.getElementById("gmailLastSync");
    if (lastSync) {
      lastSync.textContent = status.lastSyncAt
        ? `Last synced: ${new Date(status.lastSyncAt).toLocaleString()}`
        : "Last sync: Never";
    }
  } catch {
    // silent
  }
}

function initGmailButtons() {
  const parseBtn = document.getElementById("parseEmailBtn");
  if (parseBtn) {
    parseBtn.addEventListener("click", async () => {
      const subject = document.getElementById("emailSubject").value.trim();
      const from = document.getElementById("emailFrom").value.trim();
      const body = document.getElementById("emailBody").value.trim();
      const resultEl = document.getElementById("parseResult");

      if (!body && !subject) {
        resultEl.textContent = "Please paste an email subject or body";
        resultEl.style.color = "#e74c3c";
        return;
      }

      parseBtn.disabled = true;
      parseBtn.textContent = "Parsing...";
      resultEl.textContent = "";
      try {
        const result = await DataStore.parseEmail(subject, from, body);
        if (result.found) {
          resultEl.textContent = `Added: ${result.application.company} — ${result.application.role}`;
          resultEl.style.color = "#27ae60";
          document.getElementById("emailSubject").value = "";
          document.getElementById("emailFrom").value = "";
          document.getElementById("emailBody").value = "";
          await renderGmailStatus();
          await renderDashboard();
        } else {
          resultEl.textContent = result.message || "No job application found in this email";
          resultEl.style.color = "#e67e22";
        }
      } catch (err) {
        resultEl.textContent = "Error: " + (err.message || "Failed to parse");
        resultEl.style.color = "#e74c3c";
      }
      parseBtn.disabled = false;
      parseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:16px;height:16px;vertical-align:middle;margin-right:6px"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg> Parse &amp; Add';
    });
  }

  const clearBtn = document.getElementById("clearEmailBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.getElementById("emailSubject").value = "";
      document.getElementById("emailFrom").value = "";
      document.getElementById("emailBody").value = "";
      const resultEl = document.getElementById("parseResult");
      if (resultEl) resultEl.textContent = "";
    });
  }
}

async function initDashboard() {
  const user = await DataStore.checkSession();
  if (!user) {
    window.location.href = "../Homepage/login.html";
    return;
  }
  await renderNav("dashboard");
  await renderDashboard();
  await renderGmailStatus();
  initGmailButtons();
}

document.addEventListener("DOMContentLoaded", initDashboard);

const themeObserver = new MutationObserver(() => renderDashboard());
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
