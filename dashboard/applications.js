// ---------- Applications table page ----------

let currentSearch = "";
let currentStatusFilter = "All";
let editingId = null;
let openRowMenuId = null;

const tbody = document.getElementById("appsTableBody");
const emptyStateEl = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const addBtn = document.getElementById("addBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalSubmit = document.getElementById("modalSubmit");
const modalClose = document.getElementById("modalClose");
const modalCancel = document.getElementById("modalCancel");
const form = document.getElementById("applicationForm");
const appIdInput = document.getElementById("appId");
const companyInput = document.getElementById("companyInput");
const roleInput = document.getElementById("roleInput");
const locationInput = document.getElementById("locationInput");
const dateInput = document.getElementById("dateInput");
const statusInput = document.getElementById("statusInput");

async function initApplicationsPage() {
  const user = await DataStore.checkSession();
  if (!user) {
    window.location.href = "../Homepage/login.html";
    return;
  }
  await renderNav("applications");
  attachApplicationListeners();
  closeModal();
  await renderRows();
}

document.addEventListener("DOMContentLoaded", initApplicationsPage);

const STAGE_ORDER = ["Applied", "Shortlisted", "Interview", "Offer"];

function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getFiltered(apps) {
  return apps.filter((app) => {
    const matchesStatus = currentStatusFilter === "All" || app.status === currentStatusFilter;
    const haystack = `${app.company} ${app.role}`.toLowerCase();
    const matchesSearch = haystack.includes(currentSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });
}

function stepStatesFor(status) {
  if (status === "Rejected") return ["rejected", "pending", "pending", "pending"];
  if (status === "Offer") return ["done", "done", "done", "done"];
  if (status === "Interview") return ["done", "done", "active", "pending"];
  return ["active", "pending", "pending", "pending"];
}

function renderProgressSteps(status) {
  const states = stepStatesFor(status);
  return `<div class="progress-track">${states
    .map((state, i) => {
      const stepNum = i + 1;
      let inner = stepNum;
      if (state === "done") {
        inner = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>';
      } else if (state === "rejected") {
        inner = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      }
      const connector = stepNum < 4 ? `<span class="progress-line progress-line-${state}"></span>` : "";
      return `<span class="progress-step progress-step-${state}">${inner}</span>${connector}`;
    })
    .join("")}</div>`;
}

async function renderRows() {
  const apps = await DataStore.getApplications();
  document.getElementById("headCount").textContent = apps.length;

  const visible = getFiltered(apps);
  tbody.innerHTML = "";
  emptyStateEl.hidden = visible.length !== 0;

  visible.forEach((app) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="cell-company">${escapeHtml(app.company)}</td>
      <td>${escapeHtml(app.role)}</td>
      <td>${escapeHtml(app.location || "\u2014")}</td>
      <td>${formatDate(app.date)}</td>
      <td><span class="status-badge" data-status="${app.status}">${app.status}</span></td>
      <td>${renderProgressSteps(app.status)}</td>
      <td class="cell-menu">
        <button class="row-menu-btn" data-id="${app.id}" aria-label="Row actions" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>
        </button>
        <div class="row-menu-dropdown" data-id="${app.id}" hidden>
          <button class="dropdown-item" data-action="edit" data-id="${app.id}" type="button">Edit</button>
          <button class="dropdown-item dropdown-danger" data-action="delete" data-id="${app.id}" type="button">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachRowEvents();
}

function attachRowEvents() {
  tbody.querySelectorAll(".row-menu-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const dropdown = tbody.querySelector(`.row-menu-dropdown[data-id="${id}"]`);
      const isOpen = openRowMenuId === id;
      closeAllRowMenus();
      if (!isOpen && dropdown) {
        dropdown.hidden = false;
        openRowMenuId = id;
      }
    });
  });

  tbody.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener("click", () => openModalForEdit(Number(btn.dataset.id)));
  });

  tbody.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      await DataStore.deleteApplication(id);
      closeAllRowMenus();
      await renderRows();
    });
  });
}

function closeAllRowMenus() {
  tbody.querySelectorAll(".row-menu-dropdown").forEach((d) => (d.hidden = true));
  openRowMenuId = null;
}

document.addEventListener("click", closeAllRowMenus);

// ---------- Search & filter ----------
searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  renderRows();
});

statusFilter.addEventListener("change", (e) => {
  currentStatusFilter = e.target.value;
  renderRows();
});

// ---------- Modal ----------
function openModalForAdd() {
  editingId = null;
  form.reset();
  if (appIdInput) appIdInput.value = "";
  modalTitle.textContent = "Add application";
  modalSubmit.textContent = "Add application";
  clearFormErrors();
  modalOverlay.hidden = false;
  companyInput.focus();
}

async function openModalForEdit(id) {
  const apps = await DataStore.getApplications();
  const app = apps.find((a) => a.id === id);
  if (!app) return;
  editingId = id;
  if (appIdInput) appIdInput.value = app.id;
  companyInput.value = app.company;
  roleInput.value = app.role;
  locationInput.value = app.location || "";
  dateInput.value = app.date;
  statusInput.value = app.status;
  modalTitle.textContent = "Edit application";
  modalSubmit.textContent = "Save changes";
  clearFormErrors();
  closeAllRowMenus();
  modalOverlay.hidden = false;
  companyInput.focus();
}

function closeModal() {
  modalOverlay.hidden = true;
  editingId = null;
  form.reset();
  clearFormErrors();
}

function clearFormErrors() {
  ["companyError", "roleError", "locationError", "dateError"].forEach((id) => {
    document.getElementById(id).textContent = "";
  });
}

function attachApplicationListeners() {
  addBtn.addEventListener("click", openModalForAdd);
  modalClose.addEventListener("click", closeModal);
  modalCancel.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
  });
}

function validateForm() {
  let valid = true;
  clearFormErrors();

  if (!document.getElementById("companyInput").value.trim()) {
    document.getElementById("companyError").textContent = "Company name is required.";
    valid = false;
  }
  if (!document.getElementById("roleInput").value.trim()) {
    document.getElementById("roleError").textContent = "Role is required.";
    valid = false;
  }
  if (!document.getElementById("locationInput").value.trim()) {
    document.getElementById("locationError").textContent = "Location is required.";
    valid = false;
  }
  if (!document.getElementById("dateInput").value) {
    document.getElementById("dateError").textContent = "Date applied is required.";
    valid = false;
  }
  return valid;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    company: companyInput.value.trim(),
    role: roleInput.value.trim(),
    location: locationInput.value.trim(),
    date: dateInput.value,
    status: statusInput.value,
  };

  if (editingId) {
    await DataStore.updateApplication(editingId, payload);
  } else {
    await DataStore.addApplication(payload);
  }

  closeModal();
  await renderRows();
});
