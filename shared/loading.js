// ---------- Global Loading Overlay ----------
const LoadingOverlay = (() => {
  let overlay = null;

  function create() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "loadingOverlay";
    overlay.innerHTML = `
      <div class="loading-backdrop">
        <div class="loading-box">
          <div class="loading-spinner">
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="90 150" stroke-dashoffset="0"/>
            </svg>
          </div>
          <p class="loading-text" id="loadingText">Loading...</p>
        </div>
      </div>
    `;
    const style = document.createElement("style");
    style.textContent = `
      #loadingOverlay {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 0.25s ease;
      }
      #loadingOverlay.active {
        opacity: 1; pointer-events: all;
      }
      .loading-backdrop {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
      .loading-box {
        position: relative; z-index: 1;
        display: flex; flex-direction: column;
        align-items: center; gap: 16px;
        background: var(--color-surface, #fff);
        padding: 36px 48px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      }
      [data-theme="dark"] .loading-box {
        background: #1e1e1e;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      }
      .loading-spinner svg {
        width: 44px; height: 44px;
        animation: loadingRotate 0.8s linear infinite;
        color: var(--color-accent, #c9a96e);
      }
      .loading-spinner circle {
        animation: loadingDash 1.2s ease-in-out infinite;
      }
      .loading-text {
        margin: 0;
        font-size: 0.9rem;
        color: var(--color-text-muted, #888);
        letter-spacing: 0.02em;
      }
      @keyframes loadingRotate {
        100% { transform: rotate(360deg); }
      }
      @keyframes loadingDash {
        0% { stroke-dasharray: 1 150; stroke-dashoffset: 0; }
        50% { stroke-dasharray: 90 150; stroke-dashoffset: -35; }
        100% { stroke-dasharray: 90 150; stroke-dashoffset: -124; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }

  function show(text) {
    create();
    const t = document.getElementById("loadingText");
    if (t) t.textContent = text || "Loading...";
    overlay.classList.add("active");
  }

  function hide() {
    if (overlay) overlay.classList.remove("active");
  }

  return { show, hide };
})();
