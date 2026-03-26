const FONT_LINKS = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;600&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
`;

const THEME_BOOTSTRAP = `
      (() => {
        const stored = localStorage.getItem("tmc-theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const shouldUseDark = stored ? stored === "dark" : prefersDark;
        document.documentElement.classList.toggle("dark", shouldUseDark);
      })();
`;

const APP_STYLE = `
      :root {
        color-scheme: light;
        --bg: oklch(0.975 0.012 85);
        --bg-soft: oklch(0.955 0.018 82);
        --panel: color-mix(in oklab, var(--bg) 82%, white 18%);
        --panel-strong: oklch(0.932 0.024 76);
        --panel-contrast: oklch(0.905 0.032 72);
        --text: oklch(0.255 0.028 48);
        --muted: oklch(0.545 0.02 50);
        --line: oklch(0.84 0.018 78);
        --line-strong: oklch(0.74 0.03 70);
        --accent: oklch(0.63 0.16 52);
        --accent-soft: oklch(0.93 0.05 70);
        --teal: oklch(0.57 0.084 205);
        --teal-soft: oklch(0.93 0.028 205);
        --success: oklch(0.63 0.14 150);
        --danger: oklch(0.61 0.19 28);
        --control-surface: color-mix(in oklab, var(--panel) 88%, white 12%);
        --control-surface-strong: color-mix(in oklab, var(--panel-strong) 84%, white 16%);
        --control-overlay: rgba(255, 255, 255, 0.28);
        --control-shadow: 0 10px 24px rgba(58, 41, 21, 0.08);
        --control-focus: color-mix(in oklab, var(--accent) 18%, transparent);
        --overlay: rgba(35, 26, 16, 0.18);
        --shadow: 0 20px 60px rgba(58, 41, 21, 0.08);
        --shadow-soft: 0 12px 28px rgba(58, 41, 21, 0.06);
        --radius-xl: 28px;
        --radius-lg: 20px;
        --radius-md: 14px;
        --radius-sm: 12px;
        --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
        --ease-smooth: cubic-bezier(0.25, 1, 0.5, 1);
        --display: "Newsreader", serif;
        --body: "Space Grotesk", sans-serif;
      }

      .dark {
        color-scheme: dark;
        --bg: oklch(0.205 0.018 58);
        --bg-soft: oklch(0.235 0.02 58);
        --panel: oklch(0.255 0.02 58);
        --panel-strong: oklch(0.288 0.024 58);
        --panel-contrast: oklch(0.325 0.026 58);
        --text: oklch(0.93 0.012 84);
        --muted: oklch(0.73 0.015 82);
        --line: oklch(0.39 0.018 58);
        --line-strong: oklch(0.48 0.02 58);
        --accent: oklch(0.73 0.14 58);
        --accent-soft: color-mix(in oklab, var(--accent) 16%, transparent);
        --teal: oklch(0.74 0.075 205);
        --teal-soft: color-mix(in oklab, var(--teal) 16%, transparent);
        --success: oklch(0.77 0.12 152);
        --danger: oklch(0.72 0.17 30);
        --control-surface: color-mix(in oklab, var(--panel) 92%, black 8%);
        --control-surface-strong: color-mix(in oklab, var(--panel-strong) 90%, black 10%);
        --control-overlay: rgba(255, 255, 255, 0.08);
        --control-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
        --control-focus: color-mix(in oklab, var(--accent) 24%, transparent);
        --overlay: rgba(2, 4, 7, 0.48);
        --shadow: 0 26px 80px rgba(0, 0, 0, 0.34);
        --shadow-soft: 0 16px 36px rgba(0, 0, 0, 0.26);
      }

      * {
        box-sizing: border-box;
      }

      [v-cloak] {
        display: none;
      }

      html {
        font-size: 16px;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at top left, color-mix(in oklab, var(--accent) 12%, transparent) 0, transparent 40%),
          radial-gradient(circle at top right, color-mix(in oklab, var(--teal) 12%, transparent) 0, transparent 46%),
          linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);
        color: var(--text);
        font-family: var(--body);
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }

      body::before,
      body::after {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
      }

      body::before {
        background-image:
          linear-gradient(color-mix(in oklab, var(--line) 50%, transparent) 1px, transparent 1px),
          linear-gradient(90deg, color-mix(in oklab, var(--line) 50%, transparent) 1px, transparent 1px);
        background-size: 34px 34px;
        mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.22), transparent 68%);
        opacity: 0.28;
      }

      body::after {
        background:
          radial-gradient(circle at 20% 18%, color-mix(in oklab, var(--accent) 20%, transparent), transparent 28%),
          radial-gradient(circle at 78% 16%, color-mix(in oklab, var(--teal) 16%, transparent), transparent 30%);
        filter: blur(56px);
        opacity: 0.28;
        animation: drift 18s var(--ease-smooth) infinite alternate;
      }

      button,
      input,
      textarea,
      select {
        font: inherit;
        appearance: none;
      }

      input,
      textarea,
      select {
        user-select: text;
        -webkit-user-select: text;
        pointer-events: auto;
        -webkit-touch-callout: default;
      }

      button {
        cursor: pointer;
      }

      button:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      select:focus-visible {
        outline: none;
      }

      a {
        color: inherit;
      }

      .app-shell,
      .auth-shell {
        position: relative;
        z-index: 1;
      }

      .shell {
        width: min(1180px, calc(100vw - 2rem));
        margin: 0 auto;
      }

      .app-shell {
        padding: 1rem 0 2.5rem;
      }

      .screen-enter {
        opacity: 0;
        transform: translateY(18px);
        animation: rise 0.72s var(--ease-out) forwards;
        animation-delay: calc(var(--stagger, 0) * 90ms);
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.15rem 1.2rem;
      }

      .brand {
        display: grid;
        gap: 0.45rem;
        max-width: 48rem;
      }

      .brand-mark {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
      }

      .brand-seal {
        width: 3rem;
        height: 3rem;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background:
          linear-gradient(160deg, color-mix(in oklab, var(--accent) 78%, white 12%), color-mix(in oklab, var(--teal) 44%, var(--accent) 56%));
        color: white;
        box-shadow: 0 18px 32px color-mix(in oklab, var(--accent) 25%, transparent);
      }

      .brand-title {
        font-family: var(--display);
        font-size: clamp(2rem, 3.7vw, 3.25rem);
        line-height: 0.98;
        letter-spacing: -0.04em;
        margin: 0;
        font-weight: 600;
        text-wrap: balance;
      }

      .brand-kicker,
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.68rem;
        color: var(--muted);
        font-weight: 700;
      }

      .brand-subtitle,
      .panel-copy {
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
        max-width: 46rem;
      }

      .chrome-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .status-pill,
      .mini-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.72rem 1rem;
        border-radius: 999px;
        border: 1px solid color-mix(in oklab, var(--line) 88%, transparent);
        background: color-mix(in oklab, var(--panel) 82%, transparent);
        box-shadow: var(--shadow-soft);
        color: var(--text);
        font-size: 0.86rem;
      }

      .mini-pill {
        padding: 0.44rem 0.72rem;
        font-size: 0.74rem;
        box-shadow: none;
        background: color-mix(in oklab, var(--panel) 76%, transparent);
      }

      .status-dot {
        width: 0.56rem;
        height: 0.56rem;
        border-radius: 999px;
        background: var(--danger);
        box-shadow: 0 0 0 0 color-mix(in oklab, var(--danger) 26%, transparent);
      }

      .status-dot.online {
        background: var(--success);
        animation: pulse 1.9s ease-out infinite;
      }

      .ghost-button,
      .solid-button,
      .soft-button,
      .tab-button,
      .chip-button {
        position: relative;
        z-index: 2;
        isolation: isolate;
        min-height: 2.95rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        border: 1px solid transparent;
        border-radius: 16px;
        padding: 0.82rem 1.12rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        line-height: 1;
        box-shadow: var(--control-shadow);
        backdrop-filter: blur(14px);
        transition:
          transform 180ms var(--ease-out),
          background-color 180ms var(--ease-out),
          color 180ms var(--ease-out),
          border-color 180ms var(--ease-out),
          box-shadow 180ms var(--ease-out),
          opacity 180ms var(--ease-out);
      }

      .ghost-button::before,
      .solid-button::before,
      .soft-button::before,
      .tab-button::before,
      .chip-button::before {
        content: "";
        position: absolute;
        inset: 1px;
        border-radius: inherit;
        z-index: -1;
        pointer-events: none;
        background: linear-gradient(180deg, color-mix(in oklab, var(--control-overlay) 100%, transparent), transparent 48%);
        opacity: 0.9;
      }

      .ghost-button,
      .chip-button {
        background: linear-gradient(180deg, color-mix(in oklab, var(--control-surface) 96%, transparent), color-mix(in oklab, var(--control-surface-strong) 88%, transparent));
        color: var(--text);
        border-color: color-mix(in oklab, var(--line-strong) 30%, var(--line));
      }

      .solid-button {
        background: linear-gradient(135deg, color-mix(in oklab, var(--accent) 88%, white 12%), color-mix(in oklab, var(--teal) 52%, var(--accent) 48%));
        color: white;
        border-color: color-mix(in oklab, var(--accent) 42%, transparent);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.18),
          0 18px 32px color-mix(in oklab, var(--accent) 28%, transparent);
      }

      .soft-button {
        background: linear-gradient(180deg, color-mix(in oklab, var(--accent) 14%, var(--panel) 86%), color-mix(in oklab, var(--accent) 9%, var(--panel-strong) 91%));
        color: var(--accent);
        border-color: color-mix(in oklab, var(--accent) 24%, transparent);
      }

      .ghost-button.danger-button,
      .soft-button.danger-button {
        color: color-mix(in oklab, var(--danger) 82%, var(--text));
        border-color: color-mix(in oklab, var(--danger) 26%, transparent);
        background: linear-gradient(180deg, color-mix(in oklab, var(--danger) 10%, var(--panel) 90%), color-mix(in oklab, var(--danger) 6%, var(--panel-strong) 94%));
      }

      .solid-button.danger-button {
        background: linear-gradient(135deg, color-mix(in oklab, var(--danger) 82%, white 18%), color-mix(in oklab, var(--danger) 66%, var(--accent) 34%));
        border-color: color-mix(in oklab, var(--danger) 32%, transparent);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.18),
          0 18px 32px color-mix(in oklab, var(--danger) 22%, transparent);
      }

      .ghost-button:hover,
      .solid-button:hover,
      .soft-button:hover,
      .tab-button:hover,
      .chip-button:hover {
        transform: translateY(-1px);
      }

      .ghost-button:active,
      .solid-button:active,
      .soft-button:active,
      .tab-button:active,
      .chip-button:active {
        transform: translateY(0);
      }

      .ghost-button[disabled],
      .solid-button[disabled],
      .soft-button[disabled],
      .chip-button[disabled],
      .tab-button[disabled] {
        opacity: 0.52;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .solid-button[disabled] {
        opacity: 1;
        color: color-mix(in oklab, var(--muted) 88%, var(--text) 12%);
        background:
          linear-gradient(
            180deg,
            color-mix(in oklab, var(--panel-strong) 82%, var(--line) 18%),
            color-mix(in oklab, var(--panel-contrast) 72%, transparent)
          );
        border: 1px solid color-mix(in oklab, var(--line-strong) 58%, transparent);
        box-shadow: inset 0 1px 0 color-mix(in oklab, white 12%, transparent);
        filter: saturate(0.64);
      }

      .ghost-button:focus-visible,
      .solid-button:focus-visible,
      .soft-button:focus-visible,
      .tab-button:focus-visible,
      .chip-button:focus-visible {
        box-shadow:
          0 0 0 4px var(--control-focus),
          var(--control-shadow);
      }

      .hero {
        display: grid;
        gap: 1rem;
        grid-template-columns: 1.25fr 0.95fr;
        align-items: stretch;
      }

      .hero-copy-panel,
      .hero-metrics {
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--panel) 96%, transparent), color-mix(in oklab, var(--panel-strong) 92%, transparent));
        border: 1px solid var(--line);
        border-radius: var(--radius-xl);
        padding: 1.5rem;
        box-shadow: var(--shadow);
        position: relative;
        overflow: hidden;
      }

      .hero-copy-panel::before,
      .hero-metrics::before,
      .panel::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, color-mix(in oklab, var(--accent) 8%, transparent), transparent 44%, color-mix(in oklab, var(--teal) 7%, transparent));
        opacity: 0.8;
        pointer-events: none;
      }

      .hero-copy-panel > *,
      .hero-metrics > *,
      .panel > * {
        position: relative;
        z-index: 1;
      }

      .hero-copy-panel {
        display: grid;
        gap: 1.15rem;
        min-height: 17.5rem;
      }

      .hero-title {
        margin: 0;
        font-family: var(--display);
        font-size: clamp(2rem, 3.4vw, 3.55rem);
        line-height: 1.08;
        letter-spacing: -0.045em;
        max-width: 15ch;
        text-wrap: balance;
      }

      .hero-break {
        display: block;
      }

      .hero-accent {
        color: color-mix(in oklab, var(--accent) 82%, var(--teal) 18%);
      }

      .hero-note {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        align-items: center;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.9rem;
        height: 100%;
      }

      .metric-card {
        border-radius: 22px;
        padding: 1.15rem;
        border: 1px solid color-mix(in oklab, var(--line) 92%, transparent);
        background: color-mix(in oklab, var(--panel) 82%, white 18%);
        min-height: 7.8rem;
        display: grid;
        align-content: space-between;
      }

      .metric-label {
        color: var(--muted);
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-weight: 700;
      }

      .metric-value {
        font-family: var(--display);
        font-size: clamp(2rem, 4vw, 3rem);
        line-height: 0.9;
        letter-spacing: -0.05em;
      }

      .metric-copy {
        color: var(--muted);
        font-size: 0.84rem;
      }

      .tab-rail {
        display: flex;
        gap: 0.55rem;
        flex-wrap: wrap;
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 24px;
        background: color-mix(in oklab, var(--panel) 86%, transparent);
        border: 1px solid var(--line);
        box-shadow: var(--shadow-soft);
      }

      .tab-button {
        background: transparent;
        color: var(--muted);
        font-weight: 700;
        padding-inline: 1rem;
        box-shadow: none;
      }

      .tab-button.active {
        color: white;
        background: linear-gradient(135deg, color-mix(in oklab, var(--accent) 85%, white 15%), color-mix(in oklab, var(--teal) 48%, var(--accent) 52%));
        box-shadow: 0 14px 24px color-mix(in oklab, var(--accent) 22%, transparent);
      }

      .workspace {
        margin-top: 1rem;
        display: grid;
        gap: 1rem;
      }

      .panel {
        position: relative;
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--panel) 97%, transparent), color-mix(in oklab, var(--panel-strong) 95%, transparent));
        border: 1px solid var(--line);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      .email-panel {
        overflow: visible;
      }

      .panel-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
        padding: 1.35rem 1.45rem 1rem;
        border-bottom: 1px solid color-mix(in oklab, var(--line) 82%, transparent);
      }

      .panel-title {
        margin: 0;
        font-size: 1.14rem;
        font-weight: 700;
        line-height: 1.2;
        text-wrap: balance;
      }

      .panel-subtitle {
        margin: 0.42rem 0 0;
        color: var(--muted);
        max-width: 44rem;
        line-height: 1.6;
        overflow-wrap: anywhere;
      }

      .toolbar {
        padding: 1.15rem 1.45rem 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        align-items: center;
        position: relative;
        z-index: 8;
      }

      .search-field,
      .select-field,
      .form-field {
        display: grid;
        gap: 0.4rem;
      }

      .search-field {
        flex: 1 1 18rem;
      }

      .field-label {
        color: var(--muted);
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-weight: 700;
      }

      .form-field:focus-within .field-label {
        color: color-mix(in oklab, var(--accent) 68%, var(--text));
      }

      .field-shell,
      .select-wrap {
        position: relative;
        display: block;
      }

      .field-shell::before,
      .select-wrap::before {
        content: "";
        position: absolute;
        inset: 1px;
        border-radius: 15px;
        pointer-events: none;
        background: linear-gradient(180deg, color-mix(in oklab, var(--control-overlay) 100%, transparent), transparent 58%);
        opacity: 0.9;
      }

      .field-input,
      .field-select,
      .field-textarea {
        position: relative;
        z-index: 2;
        width: 100%;
        border-radius: 16px;
        border: 1px solid color-mix(in oklab, var(--line-strong) 28%, var(--line));
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--control-surface) 96%, transparent), color-mix(in oklab, var(--control-surface-strong) 84%, transparent));
        color: var(--text);
        padding: 0.98rem 1rem;
        box-shadow:
          inset 0 1px 0 color-mix(in oklab, white 18%, transparent),
          var(--control-shadow);
        transition:
          border-color 180ms var(--ease-out),
          transform 180ms var(--ease-out),
          box-shadow 180ms var(--ease-out),
          background-color 180ms var(--ease-out);
      }

      .field-input::placeholder,
      .field-textarea::placeholder {
        color: color-mix(in oklab, var(--muted) 82%, transparent);
      }

      .field-input:hover,
      .field-select:hover,
      .field-textarea:hover {
        border-color: color-mix(in oklab, var(--line-strong) 52%, var(--line));
      }

      .field-input:focus,
      .field-select:focus,
      .field-textarea:focus {
        outline: none;
        border-color: color-mix(in oklab, var(--accent) 60%, var(--line));
        box-shadow:
          0 0 0 4px var(--control-focus),
          0 14px 34px color-mix(in oklab, var(--accent) 12%, transparent);
        transform: translateY(-1px);
      }

      .field-input[disabled],
      .field-select[disabled],
      .field-textarea[disabled] {
        cursor: not-allowed;
        color: color-mix(in oklab, var(--muted) 82%, var(--text) 18%);
        border-color: color-mix(in oklab, var(--line) 92%, transparent);
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--panel) 88%, transparent), color-mix(in oklab, var(--panel-contrast) 64%, transparent));
        box-shadow: inset 0 1px 0 color-mix(in oklab, white 10%, transparent);
      }

      .field-select {
        padding-right: 3rem;
        cursor: pointer;
      }

      .select-wrap::after {
        content: "";
        position: absolute;
        top: 50%;
        right: 1.1rem;
        width: 0.58rem;
        height: 0.58rem;
        border-right: 2px solid color-mix(in oklab, var(--muted) 80%, var(--text));
        border-bottom: 2px solid color-mix(in oklab, var(--muted) 80%, var(--text));
        transform: translateY(-70%) rotate(45deg);
        pointer-events: none;
        z-index: 3;
      }

      .custom-select {
        position: relative;
        min-width: min(18rem, 100%);
        z-index: 10;
      }

      .custom-select.menu-open {
        z-index: 18;
      }

      .select-trigger {
        width: 100%;
        justify-content: space-between;
        padding-right: 0.92rem;
      }

      .select-trigger-copy {
        min-width: 0;
        display: grid;
        gap: 0.12rem;
        text-align: left;
      }

      .select-trigger-value {
        font-size: 0.97rem;
        line-height: 1.2;
        color: var(--text);
        overflow-wrap: anywhere;
      }

      .select-trigger-meta {
        font-size: 0.76rem;
        color: var(--muted);
        line-height: 1.35;
      }

      .select-trigger-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 12px;
        display: grid;
        place-items: center;
        flex: none;
        background: color-mix(in oklab, var(--panel-contrast) 74%, transparent);
        border: 1px solid color-mix(in oklab, var(--line) 88%, transparent);
        color: var(--muted);
        transition:
          transform 180ms var(--ease-out),
          color 180ms var(--ease-out),
          border-color 180ms var(--ease-out);
      }

      .select-trigger.open .select-trigger-icon {
        transform: rotate(180deg);
        color: var(--text);
        border-color: color-mix(in oklab, var(--accent) 24%, transparent);
      }

      .custom-select-menu {
        position: absolute;
        top: calc(100% + 0.6rem);
        left: 0;
        right: 0;
        z-index: 40;
        padding: 0.45rem;
        border-radius: 22px;
        border: 1px solid color-mix(in oklab, var(--line-strong) 26%, var(--line));
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--panel) 98%, transparent), color-mix(in oklab, var(--panel-strong) 92%, transparent));
        box-shadow: var(--shadow);
        display: grid;
        gap: 0.2rem;
        max-height: min(20rem, 48vh);
        overflow: auto;
        animation: rise 0.22s var(--ease-out);
      }

      .custom-select-option {
        width: 100%;
        min-height: 3rem;
        border: 1px solid transparent;
        border-radius: 16px;
        background: transparent;
        color: var(--text);
        box-shadow: none;
        padding: 0.82rem 0.9rem;
        display: grid;
        gap: 0.14rem;
        justify-items: start;
        text-align: left;
      }

      .custom-select-option:hover {
        background: color-mix(in oklab, var(--accent) 7%, var(--panel) 93%);
        border-color: color-mix(in oklab, var(--accent) 18%, transparent);
      }

      .custom-select-option.active {
        background: linear-gradient(180deg, color-mix(in oklab, var(--accent) 12%, var(--panel) 88%), color-mix(in oklab, var(--accent) 6%, var(--panel-strong) 94%));
        border-color: color-mix(in oklab, var(--accent) 24%, transparent);
      }

      .custom-select-option .option-title {
        font-size: 0.94rem;
        line-height: 1.3;
      }

      .custom-select-option .option-meta {
        font-size: 0.76rem;
        color: var(--muted);
        line-height: 1.35;
        overflow-wrap: anywhere;
      }

      .field-textarea {
        min-height: 7rem;
        resize: vertical;
        line-height: 1.65;
      }

      .field-note {
        color: var(--muted);
        font-size: 0.82rem;
        line-height: 1.55;
        margin: 0;
      }

      .toolbar-actions,
      .pager,
      .inline-actions,
      .form-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
        align-items: center;
      }

      .stack {
        position: relative;
        z-index: 1;
        display: grid;
        gap: 1rem;
        padding: 1.2rem 1.45rem 1.45rem;
      }

      .message-feed,
      .rules-feed,
      .whitelist-feed {
        display: grid;
        gap: 0.9rem;
      }

      .message-card,
      .resource-card {
        border-radius: 22px;
        border: 1px solid color-mix(in oklab, var(--line) 88%, transparent);
        background: color-mix(in oklab, var(--panel) 92%, transparent);
        overflow: hidden;
        transition:
          transform 180ms var(--ease-out),
          border-color 180ms var(--ease-out),
          box-shadow 180ms var(--ease-out),
          background-color 180ms var(--ease-out);
      }

      .message-card:hover,
      .resource-card:hover {
        transform: translateY(-2px);
        border-color: color-mix(in oklab, var(--accent) 34%, var(--line));
        box-shadow: var(--shadow-soft);
      }

      .message-card.expanded {
        border-color: color-mix(in oklab, var(--accent) 30%, var(--line));
        box-shadow: var(--shadow-soft);
      }

      .message-summary {
        padding: 1rem 1.1rem;
        display: grid;
        gap: 0.8rem;
      }

      .message-summary-top {
        display: flex;
        justify-content: space-between;
        gap: 0.9rem;
        align-items: start;
      }

      .message-summary-copy {
        min-width: 0;
        display: grid;
        gap: 0.8rem;
      }

      .message-toggle {
        min-width: 7.25rem;
        align-self: start;
        box-shadow: none;
      }

      .message-meta,
      .resource-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        align-items: center;
      }

      .subject {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        line-height: 1.45;
        text-wrap: balance;
      }

      .subject-copy {
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
        max-width: 68ch;
        overflow-wrap: anywhere;
      }

      .message-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
        gap: 0.8rem;
        color: var(--muted);
        font-size: 0.9rem;
      }

      .message-details {
        padding: 0 1.1rem 1rem;
        display: grid;
        gap: 0.9rem;
      }

      .result-shell,
      .note-shell,
      .api-shell,
      .status-shell {
        border-radius: 18px;
        border: 1px solid color-mix(in oklab, var(--line) 82%, transparent);
        background: color-mix(in oklab, var(--panel-contrast) 70%, transparent);
        padding: 1rem;
      }

      .result-list {
        display: grid;
        gap: 0.65rem;
      }

      .result-item {
        display: grid;
        gap: 0.36rem;
        padding: 0.8rem 0.9rem;
        border-radius: 16px;
        background: color-mix(in oklab, var(--accent) 9%, var(--panel) 91%);
        border: 1px solid color-mix(in oklab, var(--accent) 16%, transparent);
      }

      .result-item strong {
        font-size: 0.86rem;
        color: var(--accent);
      }

      .result-item code,
      .mono {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        word-break: break-word;
      }

      .empty-state {
        display: grid;
        gap: 0.8rem;
        place-items: start;
        padding: 2rem 1.45rem;
        min-height: 16rem;
        align-content: center;
      }

      .empty-title {
        margin: 0;
        font-family: var(--display);
        font-size: clamp(1.8rem, 3vw, 2.5rem);
        letter-spacing: -0.04em;
      }

      .empty-copy,
      .microcopy {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
        max-width: 40rem;
      }

      .split-layout {
        display: grid;
        grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
        gap: 1rem;
        padding: 1.2rem 1.45rem 1.45rem;
      }

      .form-card,
      .collection-card,
      .api-card {
        border-radius: 22px;
        border: 1px solid color-mix(in oklab, var(--line) 88%, transparent);
        background: color-mix(in oklab, var(--panel) 92%, transparent);
        overflow: hidden;
      }

      .form-card {
        display: grid;
        gap: 1rem;
        padding: 1.2rem;
        align-content: start;
      }

      .collection-card {
        padding: 1.2rem;
      }

      .rule-sections {
        display: grid;
        gap: 1.1rem;
      }

      .rule-section {
        display: grid;
        gap: 0.95rem;
      }

      .section-head {
        align-items: center;
      }

      .section-note {
        color: var(--muted);
        font-size: 0.8rem;
        font-weight: 600;
      }

      .section-divider {
        height: 1px;
        background: linear-gradient(90deg, color-mix(in oklab, var(--accent) 26%, transparent), color-mix(in oklab, var(--line) 82%, transparent));
      }

      .builtin-catalog {
        display: grid;
        gap: 0.95rem;
        min-width: 0;
      }

      .builtin-catalog-intro {
        display: grid;
        gap: 0.72rem;
      }

      .builtin-scroll {
        border-radius: 22px;
        border: 1px solid color-mix(in oklab, var(--line) 88%, transparent);
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--panel) 95%, transparent), color-mix(in oklab, var(--panel-strong) 82%, transparent));
        box-shadow: inset 0 1px 0 color-mix(in oklab, white 12%, transparent);
        max-height: min(31rem, calc(100vh - 20rem));
        overflow: auto;
      }

      .builtin-list {
        display: grid;
      }

      .builtin-row {
        display: grid;
        gap: 0.72rem;
        padding: 1rem 1.05rem;
        border-bottom: 1px solid color-mix(in oklab, var(--line) 72%, transparent);
        transition: background-color 180ms var(--ease-out);
      }

      .builtin-row:last-child {
        border-bottom: 0;
      }

      .builtin-row:hover {
        background: color-mix(in oklab, var(--accent) 5%, transparent);
      }

      .builtin-row-top {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.85rem;
        align-items: start;
      }

      .builtin-row-title {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.68rem;
        min-width: 0;
      }

      .builtin-key {
        display: inline-flex;
        align-items: center;
        min-height: 1.95rem;
        padding: 0.36rem 0.7rem;
        border-radius: 12px;
        border: 1px solid color-mix(in oklab, var(--line) 88%, transparent);
        background: color-mix(in oklab, var(--panel-contrast) 72%, transparent);
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .builtin-meta {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.45rem;
      }

      .builtin-description {
        margin-top: -0.05rem;
      }

      .builtin-pattern {
        display: block;
        margin: 0;
        padding: 0.82rem 0.92rem;
        border-radius: 14px;
        border: 1px solid color-mix(in oklab, var(--line) 82%, transparent);
        background: color-mix(in oklab, var(--panel-contrast) 78%, transparent);
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 0.83rem;
        line-height: 1.45;
        color: var(--text);
        white-space: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: thin;
      }

      .api-card {
        display: grid;
        gap: 1rem;
        padding: 1.2rem;
        align-content: start;
      }

      .api-section {
        display: grid;
        gap: 0.72rem;
        min-width: 0;
      }

      .api-divider {
        height: 1px;
        width: 100%;
        background: linear-gradient(90deg, color-mix(in oklab, var(--accent) 24%, transparent), color-mix(in oklab, var(--line) 78%, transparent));
      }

      .resource-card {
        padding: 1rem;
        display: grid;
        gap: 0.75rem;
      }

      .compact-empty {
        min-height: 12rem;
        padding-inline: 0;
      }

      .resource-title {
        margin: 0;
        font-weight: 700;
        font-size: 1rem;
        line-height: 1.35;
        overflow-wrap: anywhere;
      }

      .resource-copy {
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
        overflow-wrap: anywhere;
      }

      .tag-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .tag {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.42rem 0.74rem;
        border-radius: 999px;
        background: color-mix(in oklab, var(--panel-contrast) 68%, transparent);
        border: 1px solid color-mix(in oklab, var(--line) 88%, transparent);
        color: var(--muted);
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
      }

      .tag.positive {
        background: color-mix(in oklab, var(--success) 15%, var(--panel) 85%);
        color: var(--success);
        border-color: color-mix(in oklab, var(--success) 22%, transparent);
      }

      .tag.attention {
        background: color-mix(in oklab, var(--accent) 14%, var(--panel) 86%);
        color: var(--accent);
        border-color: color-mix(in oklab, var(--accent) 22%, transparent);
      }

      .tag.neutral {
        color: var(--muted);
      }

      .settings-grid,
      .api-grid {
        display: grid;
        grid-template-columns: minmax(0, 0.84fr) minmax(0, 1.16fr);
        gap: 1rem;
        padding: 1.2rem 1.45rem 1.45rem;
      }

      .mode-switch {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        padding: 0.34rem;
        border-radius: 20px;
        border: 1px solid var(--line);
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--panel) 92%, transparent), color-mix(in oklab, var(--panel-contrast) 60%, transparent));
        box-shadow: inset 0 1px 0 color-mix(in oklab, white 18%, transparent);
      }

      .mode-option {
        position: relative;
        z-index: 2;
        border: 0;
        min-height: 2.95rem;
        border-radius: 14px;
        padding: 0.72rem 0.96rem;
        color: var(--muted);
        background: transparent;
        font-weight: 700;
        letter-spacing: -0.01em;
        transition:
          background-color 180ms var(--ease-out),
          color 180ms var(--ease-out),
          transform 180ms var(--ease-out),
          box-shadow 180ms var(--ease-out);
      }

      .mode-option.active {
        color: white;
        background: linear-gradient(135deg, color-mix(in oklab, var(--accent) 82%, white 18%), color-mix(in oklab, var(--teal) 38%, var(--accent) 62%));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.18),
          0 10px 18px color-mix(in oklab, var(--accent) 16%, transparent);
      }

      .mode-option[disabled] {
        opacity: 0.42;
        cursor: not-allowed;
      }

      .mode-option[disabled]:hover,
      .mode-option[disabled]:active {
        transform: none;
      }

      .code-block {
        margin: 0;
        padding: 1rem;
        border-radius: 18px;
        overflow: auto;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 0.9rem;
        line-height: 1.7;
        border: 1px solid color-mix(in oklab, var(--line) 88%, transparent);
        background: color-mix(in oklab, var(--panel-contrast) 80%, transparent);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .result-context {
        display: grid;
        gap: 0.28rem;
        color: var(--muted);
        font-size: 0.84rem;
        line-height: 1.55;
      }

      .result-context .mono {
        display: inline;
      }

      .inline-alert {
        margin-top: 1rem;
        padding: 0.95rem 1.1rem;
        border-radius: 18px;
        border: 1px solid color-mix(in oklab, var(--danger) 18%, transparent);
        background: color-mix(in oklab, var(--danger) 9%, var(--panel) 91%);
        color: color-mix(in oklab, var(--danger) 78%, var(--text));
      }

      .toast-stack {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 60;
        pointer-events: none;
      }

      .toast {
        --toast-accent: var(--accent);
        min-width: min(25rem, calc(100vw - 2rem));
        max-width: 30rem;
        border-radius: 24px;
        border: 1px solid color-mix(in oklab, var(--line-strong) 22%, var(--line));
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--panel) 98%, transparent), color-mix(in oklab, var(--panel-strong) 92%, transparent));
        box-shadow: var(--shadow);
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: 0.9rem;
        padding: 1rem 1rem 0.92rem;
        animation: rise 0.3s var(--ease-out);
        pointer-events: auto;
        position: relative;
        overflow: hidden;
      }

      .toast::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 4px;
        background: linear-gradient(180deg, color-mix(in oklab, var(--toast-accent) 88%, white 12%), color-mix(in oklab, var(--toast-accent) 62%, transparent));
      }

      .toast.success {
        --toast-accent: var(--success);
      }

      .toast.error {
        --toast-accent: var(--danger);
      }

      .toast-icon {
        width: 2.2rem;
        height: 2.2rem;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: color-mix(in oklab, var(--toast-accent) 12%, var(--panel) 88%);
        color: color-mix(in oklab, var(--toast-accent) 78%, var(--text));
        font-weight: 800;
        box-shadow: inset 0 1px 0 color-mix(in oklab, white 16%, transparent);
      }

      .toast-copy {
        min-width: 0;
        display: grid;
        gap: 0.22rem;
      }

      .toast-copy strong,
      .toast-copy div {
        overflow-wrap: anywhere;
      }

      .toast-copy strong {
        font-size: 0.95rem;
      }

      .toast-copy div {
        color: var(--muted);
        line-height: 1.55;
      }

      .toast-close {
        width: 2rem;
        height: 2rem;
        border-radius: 12px;
        border: 1px solid color-mix(in oklab, var(--line) 88%, transparent);
        background: color-mix(in oklab, var(--panel-contrast) 72%, transparent);
        color: var(--muted);
        box-shadow: none;
        padding: 0;
      }

      .toast-close:hover {
        color: var(--text);
        border-color: color-mix(in oklab, var(--line-strong) 42%, var(--line));
        transform: translateY(-1px);
      }

      .toast-progress {
        grid-column: 1 / -1;
        height: 4px;
        margin-top: 0.1rem;
        border-radius: 999px;
        background: color-mix(in oklab, var(--line) 72%, transparent);
        overflow: hidden;
      }

      .toast-progress-bar {
        display: block;
        width: 100%;
        height: 100%;
        transform-origin: left center;
        background: linear-gradient(90deg, color-mix(in oklab, var(--toast-accent) 84%, white 16%), color-mix(in oklab, var(--toast-accent) 52%, transparent));
        animation: toast-drain 3.2s linear forwards;
      }

      .dialog-backdrop {
        position: fixed;
        inset: 0;
        z-index: 55;
        padding: 1rem;
        display: grid;
        place-items: center;
        background: color-mix(in oklab, var(--overlay) 100%, transparent);
        backdrop-filter: blur(10px);
        animation: fade-in 0.22s var(--ease-out);
      }

      .dialog-panel {
        position: relative;
        overflow: hidden;
        width: min(34rem, calc(100vw - 2rem));
        border-radius: 30px;
        border: 1px solid color-mix(in oklab, var(--line-strong) 24%, var(--line));
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--panel) 98%, transparent), color-mix(in oklab, var(--panel-strong) 94%, transparent));
        box-shadow: var(--shadow);
        animation: rise 0.26s var(--ease-out);
      }

      .dialog-panel::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(145deg, color-mix(in oklab, var(--accent) 10%, transparent), transparent 40%, color-mix(in oklab, var(--teal) 9%, transparent));
        pointer-events: none;
      }

      .dialog-panel.danger::before {
        background: linear-gradient(145deg, color-mix(in oklab, var(--danger) 12%, transparent), transparent 46%, color-mix(in oklab, var(--accent) 8%, transparent));
      }

      .dialog-content,
      .dialog-actions {
        position: relative;
        z-index: 1;
      }

      .dialog-content {
        display: grid;
        gap: 1rem;
        padding: 1.35rem 1.35rem 1rem;
      }

      .dialog-topline {
        display: flex;
        gap: 0.9rem;
        align-items: start;
      }

      .dialog-icon {
        width: 2.8rem;
        height: 2.8rem;
        border-radius: 18px;
        display: grid;
        place-items: center;
        flex: none;
        background: color-mix(in oklab, var(--accent) 11%, var(--panel) 89%);
        color: var(--accent);
        font-weight: 800;
        box-shadow: inset 0 1px 0 color-mix(in oklab, white 16%, transparent);
      }

      .dialog-panel.danger .dialog-icon {
        background: color-mix(in oklab, var(--danger) 12%, var(--panel) 88%);
        color: color-mix(in oklab, var(--danger) 82%, var(--text));
      }

      .dialog-copy {
        min-width: 0;
        display: grid;
        gap: 0.45rem;
      }

      .dialog-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 700;
        line-height: 1.2;
      }

      .dialog-message {
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
        white-space: pre-line;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.7rem;
        padding: 0 1.35rem 1.25rem;
      }

      .auth-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 1.25rem;
      }

      .auth-grid {
        width: min(1080px, 100%);
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
        gap: 1rem;
      }

      .auth-story,
      .auth-card {
        position: relative;
        overflow: hidden;
        background:
          linear-gradient(180deg, color-mix(in oklab, var(--panel) 97%, transparent), color-mix(in oklab, var(--panel-strong) 95%, transparent));
        border: 1px solid var(--line);
        border-radius: 32px;
        box-shadow: var(--shadow);
      }

      .auth-story::before,
      .auth-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(145deg, color-mix(in oklab, var(--accent) 10%, transparent), transparent 45%, color-mix(in oklab, var(--teal) 10%, transparent));
        pointer-events: none;
      }

      .auth-story-content,
      .auth-card-content {
        position: relative;
        z-index: 1;
        padding: clamp(1.5rem, 4vw, 2.2rem);
      }

      .auth-story-content {
        display: grid;
        gap: 1.1rem;
        min-height: 30rem;
        align-content: space-between;
      }

      .auth-title {
        margin: 0;
        font-family: var(--display);
        font-size: clamp(2.5rem, 6vw, 4.9rem);
        line-height: 0.96;
        letter-spacing: -0.05em;
        max-width: 10ch;
        text-wrap: balance;
      }

      .auth-card-content {
        display: grid;
        gap: 1rem;
        align-content: start;
      }

      .auth-form {
        position: relative;
        z-index: 2;
        display: grid;
        gap: 1rem;
      }

      .auth-foot {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        color: var(--muted);
        font-size: 0.88rem;
        flex-wrap: wrap;
      }

      .list-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        margin-bottom: 0.9rem;
      }

      .section-number {
        font-family: var(--display);
        font-size: 2rem;
        letter-spacing: -0.05em;
      }

      .stat-line {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
        align-items: center;
        color: var(--muted);
        font-size: 0.85rem;
      }

      .key-points {
        display: grid;
        gap: 0.85rem;
      }

      .key-point {
        display: grid;
        gap: 0.28rem;
        padding-left: 1rem;
        border-left: 2px solid color-mix(in oklab, var(--accent) 28%, transparent);
      }

      .key-point strong {
        font-size: 0.94rem;
        line-height: 1.35;
        overflow-wrap: anywhere;
      }

      .brand-subtitle,
      .panel-copy,
      .microcopy,
      .metric-copy,
      .mini-pill,
      .field-label {
        overflow-wrap: anywhere;
      }

      .panel-head > div,
      .list-head > div,
      .collection-card,
      .form-card,
      .api-card,
      .resource-card,
      .metric-card,
      .chrome-actions,
      .auth-foot {
        min-width: 0;
      }

      .auth-error {
        display: none;
        border-radius: 16px;
        padding: 0.85rem 0.95rem;
        border: 1px solid color-mix(in oklab, var(--danger) 20%, transparent);
        background: color-mix(in oklab, var(--danger) 9%, var(--panel) 91%);
        color: color-mix(in oklab, var(--danger) 78%, var(--text));
      }

      .auth-error.show {
        display: block;
      }

      .auth-submit {
        width: 100%;
      }

      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 color-mix(in oklab, var(--success) 28%, transparent);
        }
        70% {
          box-shadow: 0 0 0 14px transparent;
        }
        100% {
          box-shadow: 0 0 0 0 transparent;
        }
      }

      @keyframes drift {
        from {
          transform: translate3d(-1.5%, -1.5%, 0) scale(1);
        }
        to {
          transform: translate3d(1.5%, 1.5%, 0) scale(1.04);
        }
      }

      @keyframes toast-drain {
        from {
          transform: scaleX(1);
        }
        to {
          transform: scaleX(0);
        }
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @media (max-width: 1080px) {
        .hero,
        .split-layout,
        .settings-grid,
        .api-grid,
        .auth-grid {
          grid-template-columns: 1fr;
        }

        .builtin-scroll {
          max-height: 28rem;
        }
      }

      @media (max-width: 760px) {
        .topbar {
          align-items: start;
          flex-direction: column;
        }

        .chrome-actions,
        .hero-actions,
        .toolbar-actions,
        .pager,
        .inline-actions,
        .form-actions,
        .dialog-actions {
          width: 100%;
        }

        .message-grid {
          grid-template-columns: 1fr 1fr;
        }

        .message-summary-top {
          flex-direction: column;
        }

        .message-toggle {
          width: 100%;
        }

        .builtin-row-top {
          grid-template-columns: 1fr;
        }

        .builtin-meta {
          justify-content: flex-start;
        }

        .metrics-grid {
          grid-template-columns: 1fr;
        }

        .shell {
          width: min(100vw - 1rem, 1180px);
        }

        .panel-head,
        .toolbar,
        .stack,
        .split-layout,
        .settings-grid,
        .api-grid {
          padding-inline: 1rem;
        }

        .toast-stack {
          right: 0.5rem;
          left: 0.5rem;
          bottom: 0.5rem;
        }

        .toast {
          min-width: 0;
          max-width: none;
          width: 100%;
          grid-template-columns: auto minmax(0, 1fr);
        }

        .toast-close {
          grid-column: 2;
          justify-self: end;
        }

        .dialog-actions {
          flex-direction: column-reverse;
        }

        .dialog-actions > button {
          width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
`;

function renderLogo() {
  return `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7.5C4 6.12 5.12 5 6.5 5h11C18.88 5 20 6.12 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="m5.5 7 6.5 5 6.5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.5 14.5h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `;
}

function renderDocumentHead(title) {
  return `
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
${FONT_LINKS}
    <script>${THEME_BOOTSTRAP}</script>
    <style>${APP_STYLE}</style>
  </head>`;
}

function renderAppScript(pageSize, rulesPageSize) {
  return `
      const { createApp, nextTick } = Vue;
      const STORAGE_THEME = "tmc-theme";
      const STORAGE_TAB = "tmc-active-tab";
      const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
        dateStyle: "medium",
        timeStyle: "short"
      });

      function createToastState() {
        return {
          show: false,
          tone: "success",
          title: "",
          message: ""
        };
      }

      function createDialogState() {
        return {
          open: false,
          tone: "default",
          eyebrow: "",
          title: "",
          message: "",
          confirmLabel: "确认",
          cancelLabel: "取消"
        };
      }

      createApp({
        data() {
          return {
            ready: false,
            activeTab: localStorage.getItem(STORAGE_TAB) || "emails",
            page: 1,
            total: 0,
            items: [],
            expandedMessageIds: {},
            searchQuery: "",
            filterDomain: "",
            domainMenuOpen: false,
            availableDomains: [],
            rules: [],
            builtinRules: [],
            siteParsers: [],
            rulesPage: 1,
            rulesTotal: 0,
            ruleForm: { remark: "", sender_filter: "", pattern: "" },
            ruleOriginal: { remark: "", sender_filter: "", pattern: "" },
            editingRuleId: null,
            whitelistItems: [],
            whitelistPage: 1,
            whitelistTotal: 0,
            whitelistForm: { sender_pattern: "" },
            whitelistOriginal: { sender_pattern: "" },
            editingWhitelistId: null,
            forwardingForm: {
              forwarding_mode: "env",
              forward_to: "",
              builtin_rule_mode: "append",
              forward_payload_mode: "raw",
              env_forward_to: "",
              effective_forward_to: "",
              forwarding_active: false,
              matched_forwarding_available: false
            },
            forwardingOriginal: {
              forwarding_mode: "env",
              forward_to: "",
              builtin_rule_mode: "append",
              forward_payload_mode: "raw"
            },
            adminToken: "",
            adminError: "",
            poller: null,
            isDark: document.documentElement.classList.contains("dark"),
            apiActive: true,
            savingRule: false,
            savingWhitelist: false,
            savingForwarding: false,
            toast: createToastState(),
            dialog: createDialogState()
          };
        },
        computed: {
          totalPages() {
            return Math.max(1, Math.ceil(this.total / ${pageSize}));
          },
          rulesTotalPages() {
            return Math.max(1, Math.ceil(this.rulesTotal / ${rulesPageSize}));
          },
          totalRuleInventory() {
            return this.rulesTotal + this.builtinRules.length + this.siteParsers.length;
          },
          whitelistTotalPages() {
            return Math.max(1, Math.ceil(this.whitelistTotal / ${rulesPageSize}));
          },
          forwardingModeLabel() {
            if (this.forwardingForm.forwarding_mode === "custom") return "自定义邮箱";
            if (this.forwardingForm.forwarding_mode === "disabled") return "已停用";
            return "跟随部署默认值";
          },
          builtinRuleModeLabel() {
            if (this.forwardingForm.builtin_rule_mode === "builtin_only") return "只用内置规则";
            if (this.forwardingForm.builtin_rule_mode === "custom_only") return "只用自定义规则";
            return "内置 + 自定义";
          },
          forwardPayloadModeLabel() {
            if (this.forwardingForm.forward_payload_mode === "matched") return "命中摘要邮件";
            return "原始邮件";
          },
          effectiveForwardTarget() {
            return this.forwardingForm.effective_forward_to || "";
          },
          isRuleDirty() {
            return !this.areStatesEqual(this.normalizeRuleForm(this.ruleForm), this.ruleOriginal);
          },
          canSaveRule() {
            return !this.savingRule && Boolean(this.ruleForm.pattern.trim()) && this.isRuleDirty;
          },
          ruleSaveLabel() {
            if (this.savingRule) return "保存中...";
            if (!this.ruleForm.pattern.trim()) return this.editingRuleId ? "填写正则后保存" : "填写正则后创建";
            if (!this.isRuleDirty) return this.editingRuleId ? "内容未变更" : "填写内容后创建";
            return this.editingRuleId ? "更新规则" : "创建规则";
          },
          isWhitelistDirty() {
            return !this.areStatesEqual(this.normalizeWhitelistForm(this.whitelistForm), this.whitelistOriginal);
          },
          canSaveWhitelist() {
            return !this.savingWhitelist && Boolean(this.whitelistForm.sender_pattern.trim()) && this.isWhitelistDirty;
          },
          whitelistSaveLabel() {
            if (this.savingWhitelist) return "保存中...";
            if (!this.whitelistForm.sender_pattern.trim()) return this.editingWhitelistId ? "填写模式后保存" : "填写模式后创建";
            if (!this.isWhitelistDirty) return this.editingWhitelistId ? "内容未变更" : "填写内容后创建";
            return this.editingWhitelistId ? "更新白名单" : "添加白名单";
          },
          isForwardingDirty() {
            return !this.areStatesEqual(this.normalizeForwardingForm(this.forwardingForm), this.forwardingOriginal);
          },
          canSaveForwarding() {
            if (this.savingForwarding || !this.isForwardingDirty) return false;
            if (this.forwardingForm.forwarding_mode === "custom" && !this.forwardingForm.forward_to.trim()) return false;
            if (this.forwardingForm.forward_payload_mode === "matched" && !this.forwardingForm.matched_forwarding_available) return false;
            return true;
          },
          forwardingSaveLabel() {
            if (this.savingForwarding) return "保存中...";
            if (this.forwardingForm.forwarding_mode === "custom" && !this.forwardingForm.forward_to.trim()) return "填写邮箱后保存";
            if (!this.isForwardingDirty) return "当前配置已保存";
            return "保存转发设置";
          }
        },
        mounted() {
          this.adminToken = getCookieValue("admin_token");
          requestAnimationFrame(() => {
            this.ready = true;
          });
          if (!this.adminToken) return;
          this.bootstrap();
        },
        beforeUnmount() {
          this.stopPolling();
          clearTimeout(this._toastTimer);
          document.body.style.overflow = "";
          document.removeEventListener("pointerdown", this.handleDocumentPointerDown);
          if (this._dialogResolver) {
            this._dialogResolver(false);
            this._dialogResolver = null;
          }
        },
        methods: {
          async bootstrap() {
            document.addEventListener("pointerdown", this.handleDocumentPointerDown);
            await Promise.all([
              this.loadList(),
              this.loadRules(),
              this.loadWhitelistData(),
              this.loadDomains(),
              this.loadForwardingSettings()
            ]);
            this.startPolling();
          },
          setActiveTab(tab) {
            this.activeTab = tab;
            localStorage.setItem(STORAGE_TAB, tab);
            if (tab !== "emails") this.domainMenuOpen = false;
          },
          toggleTheme() {
            this.isDark = !this.isDark;
            document.documentElement.classList.toggle("dark", this.isDark);
            localStorage.setItem(STORAGE_THEME, this.isDark ? "dark" : "light");
          },
          startPolling() {
            this.stopPolling();
            this.poller = setInterval(() => {
              if (this.adminToken && this.activeTab === "emails") this.loadList();
            }, 6000);
          },
          stopPolling() {
            if (this.poller) {
              clearInterval(this.poller);
              this.poller = null;
            }
          },
          logout(message = "") {
            this.adminToken = "";
            this.adminError = message;
            document.cookie = "admin_token=; Path=/; Max-Age=0; SameSite=Lax";
            this.stopPolling();
            window.location.href = "/";
          },
          async handleAuthError(res) {
            if (res.status === 401) {
              this.logout("管理令牌已失效，请重新登录");
              return true;
            }
            return false;
          },
          showToast(title, message, tone = "success") {
            this.toast = { show: true, tone, title, message };
            clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => {
              this.dismissToast();
            }, 3200);
          },
          dismissToast() {
            this.toast = createToastState();
          },
          currentDomainLabel() {
            return this.filterDomain || "全部域名";
          },
          currentDomainMeta() {
            if (this.filterDomain) return "只查看这个收件域名的邮件";
            return "切换到单个域名或回到全部";
          },
          toggleDomainMenu() {
            this.domainMenuOpen = !this.domainMenuOpen;
          },
          openDomainMenu() {
            this.domainMenuOpen = true;
          },
          closeDomainMenu() {
            this.domainMenuOpen = false;
          },
          selectDomain(domain) {
            this.filterDomain = domain;
            this.domainMenuOpen = false;
            this.applyEmailFilters();
          },
          handleDocumentPointerDown(event) {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest("[data-domain-select]")) return;
            this.domainMenuOpen = false;
          },
          async openDialog(config = {}) {
            if (this._dialogResolver) {
              this._dialogResolver(false);
              this._dialogResolver = null;
            }
            this.dialog = {
              open: true,
              tone: config.tone || "default",
              eyebrow: config.eyebrow || "确认操作",
              title: config.title || "继续操作？",
              message: config.message || "",
              confirmLabel: config.confirmLabel || "确认",
              cancelLabel: config.cancelLabel || "取消"
            };
            document.body.style.overflow = "hidden";
            return new Promise((resolve) => {
              this._dialogResolver = resolve;
              nextTick(() => {
                document.querySelector("[data-dialog-confirm]")?.focus();
              });
            });
          },
          resolveDialog(confirmed) {
            const resolver = this._dialogResolver;
            this._dialogResolver = null;
            this.dialog = createDialogState();
            document.body.style.overflow = "";
            if (resolver) resolver(confirmed);
          },
          adminHeaders() {
            return this.adminToken ? { Authorization: "Bearer " + this.adminToken } : {};
          },
          areStatesEqual(left, right) {
            return JSON.stringify(left) === JSON.stringify(right);
          },
          normalizeRuleForm(source = {}) {
            return {
              remark: String(source.remark || "").trim(),
              sender_filter: String(source.sender_filter || "").trim(),
              pattern: String(source.pattern || "").trim()
            };
          },
          normalizeWhitelistForm(source = {}) {
            return {
              sender_pattern: String(source.sender_pattern || "").trim()
            };
          },
          normalizeForwardingForm(source = {}) {
            return {
              forwarding_mode: String(source.forwarding_mode || "env").trim() || "env",
              forward_to: String(source.forward_to || "").trim().toLowerCase(),
              builtin_rule_mode: String(source.builtin_rule_mode || "append").trim() || "append",
              forward_payload_mode: String(source.forward_payload_mode || "raw").trim() || "raw"
            };
          },
          buildForwardingForm(source = {}) {
            return {
              forwarding_mode: source.forwarding_mode || "env",
              forward_to: source.forward_to || "",
              builtin_rule_mode: source.builtin_rule_mode || "append",
              forward_payload_mode: source.forward_payload_mode || "raw",
              env_forward_to: source.env_forward_to || "",
              effective_forward_to: source.effective_forward_to || "",
              forwarding_active: Boolean(source.forwarding_active),
              matched_forwarding_available: Boolean(source.matched_forwarding_available)
            };
          },
          updateRuleOriginal(source = this.ruleForm) {
            this.ruleOriginal = this.normalizeRuleForm(source);
          },
          updateWhitelistOriginal(source = this.whitelistForm) {
            this.whitelistOriginal = this.normalizeWhitelistForm(source);
          },
          updateForwardingOriginal(source = this.forwardingForm) {
            this.forwardingOriginal = this.normalizeForwardingForm(source);
          },
          async requestJson(url, options = {}) {
            try {
              const res = await fetch(url, {
                ...options,
                headers: {
                  ...this.adminHeaders(),
                  ...(options.headers || {})
                }
              });
              if (await this.handleAuthError(res)) return null;
              const payload = await res.json().catch(() => null);
              this.apiActive = true;
              if (!res.ok) {
                this.showToast("请求失败", payload?.message || "服务器未返回有效结果", "error");
                return null;
              }
              return payload;
            } catch (err) {
              this.apiActive = false;
              this.showToast("网络异常", "请检查本地 Worker 或网络连接后重试", "error");
              console.error("API Request failed:", err);
              return null;
            }
          },
          async loadList() {
            let url = "/admin/emails?page=" + this.page;
            if (this.filterDomain) url += "&domain=" + encodeURIComponent(this.filterDomain);
            if (this.searchQuery.trim()) url += "&q=" + encodeURIComponent(this.searchQuery.trim());
            const payload = await this.requestJson(url);
            if (!payload?.data) return;
            const expandedMap = this.expandedMessageIds || {};
            this.items = (payload.data.items || []).map((item) => ({
              ...item,
              _expanded: Boolean(expandedMap[item.message_id])
            }));
            this.total = payload.data.total || 0;
          },
          async loadDomains() {
            const payload = await this.requestJson("/admin/domains");
            if (!payload?.data) return;
            this.availableDomains = payload.data.domains || [];
          },
          applyEmailFilters() {
            this.domainMenuOpen = false;
            this.page = 1;
            this.loadList();
          },
          clearEmailFilters() {
            this.searchQuery = "";
            this.filterDomain = "";
            this.domainMenuOpen = false;
            this.page = 1;
            this.loadList();
          },
          async nextPage() {
            if (this.page >= this.totalPages) return;
            this.page += 1;
            await this.loadList();
          },
          async prevPage() {
            if (this.page <= 1) return;
            this.page -= 1;
            await this.loadList();
          },
          parseResults(raw) {
            try {
              const parsed = JSON.parse(raw);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          },
          hasResult(raw) {
            return this.parseResults(raw).length > 0;
          },
          resultCount(raw) {
            return this.parseResults(raw).length;
          },
          formatResult(raw) {
            try {
              const parsed = JSON.parse(raw);
              return Array.isArray(parsed) ? JSON.stringify(parsed, null, 2) : String(parsed ?? "");
            } catch {
              return raw || "";
            }
          },
          resultKey(result, index) {
            return [
              result?.rule_id ?? "builtin",
              result?.plugin_key ?? "plugin",
              result?.rule_key ?? "custom",
              result?.value ?? "",
              index
            ].join("-");
          },
          resultSourceLabel(result) {
            if (result?.source === "site_parser") return "站点解析器";
            if (result?.source === "builtin") return "内置规则";
            return "自定义规则";
          },
          async copyContent(text) {
            try {
              await navigator.clipboard.writeText(text);
              this.showToast("已复制", "提取结果已经复制到剪贴板");
            } catch (err) {
              this.showToast("复制失败", "浏览器拒绝了剪贴板权限", "error");
              console.error("Failed to copy:", err);
            }
          },
          toggleResult(messageId) {
            const expandedMap = { ...this.expandedMessageIds };
            this.items = this.items.map((item) => {
              if (item.message_id !== messageId) return item;
              const nextExpanded = !item._expanded;
              if (nextExpanded) {
                expandedMap[messageId] = true;
              } else {
                delete expandedMap[messageId];
              }
              return { ...item, _expanded: nextExpanded };
            });
            this.expandedMessageIds = expandedMap;
          },
          formatTime(ts) {
            return timeFormatter.format(new Date(ts));
          },
          async loadRules() {
            const payload = await this.requestJson("/admin/rules?page=" + this.rulesPage);
            if (!payload?.data) return;
            this.rules = payload.data.items || [];
            this.rulesTotal = payload.data.total || 0;
            this.builtinRules = payload.data.builtin_items || [];
            this.siteParsers = payload.data.site_parser_items || [];
          },
          editRule(rule) {
            this.editingRuleId = rule.id;
            this.ruleForm = {
              remark: rule.remark || "",
              sender_filter: rule.sender_filter || "",
              pattern: rule.pattern || ""
            };
            this.updateRuleOriginal();
            this.setActiveTab("rules");
          },
          resetRuleForm() {
            this.editingRuleId = null;
            this.ruleForm = { remark: "", sender_filter: "", pattern: "" };
            this.updateRuleOriginal();
          },
          async submitRule() {
            if (!this.canSaveRule) return;
            if (!this.ruleForm.pattern.trim()) {
              this.showToast("规则未保存", "内容匹配正则不能为空", "error");
              return;
            }
            this.savingRule = true;
            const url = this.editingRuleId ? "/admin/rules/" + this.editingRuleId : "/admin/rules";
            const method = this.editingRuleId ? "PUT" : "POST";
            const payload = await this.requestJson(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(this.ruleForm)
            });
            this.savingRule = false;
            if (!payload) return;
            this.showToast(
              this.editingRuleId ? "规则已更新" : "规则已创建",
              this.editingRuleId ? "新的匹配逻辑已生效" : "后续命中的邮件将按新规则提取"
            );
            this.rulesPage = 1;
            this.resetRuleForm();
            await this.loadRules();
          },
          async deleteRule(id) {
            const confirmed = await this.openDialog({
              tone: "danger",
              eyebrow: "Delete Rule",
              title: "确认删除这条规则？",
              message: "删除后它不会再参与后续邮件提取。如果这是你最后一条业务规则，后续只会保留站点解析器和内置规则。",
              confirmLabel: "删除规则"
            });
            if (!confirmed) return;
            const payload = await this.requestJson("/admin/rules/" + id, { method: "DELETE" });
            if (!payload) return;
            this.showToast("规则已删除", "这条提取规则不会再参与后续邮件解析");
            await this.loadRules();
            if (this.rules.length === 0 && this.rulesPage > 1) {
              this.rulesPage -= 1;
              await this.loadRules();
            }
            if (this.editingRuleId === id) this.resetRuleForm();
          },
          async nextRulesPage() {
            if (this.rulesPage >= this.rulesTotalPages) return;
            this.rulesPage += 1;
            await this.loadRules();
          },
          async prevRulesPage() {
            if (this.rulesPage <= 1) return;
            this.rulesPage -= 1;
            await this.loadRules();
          },
          async loadWhitelistData() {
            const payload = await this.requestJson("/admin/whitelist?page=" + this.whitelistPage);
            if (!payload?.data) return;
            this.whitelistItems = payload.data.items || [];
            this.whitelistTotal = payload.data.total || 0;
          },
          editWhitelist(item) {
            this.editingWhitelistId = item.id;
            this.whitelistForm = { sender_pattern: item.sender_pattern || "" };
            this.updateWhitelistOriginal();
            this.setActiveTab("whitelist");
          },
          resetWhitelistForm() {
            this.editingWhitelistId = null;
            this.whitelistForm = { sender_pattern: "" };
            this.updateWhitelistOriginal();
          },
          async submitWhitelist() {
            if (!this.canSaveWhitelist) return;
            if (!this.whitelistForm.sender_pattern.trim()) {
              this.showToast("白名单未保存", "发件人模式不能为空", "error");
              return;
            }
            this.savingWhitelist = true;
            const url = this.editingWhitelistId ? "/admin/whitelist/" + this.editingWhitelistId : "/admin/whitelist";
            const method = this.editingWhitelistId ? "PUT" : "POST";
            const payload = await this.requestJson(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(this.whitelistForm)
            });
            this.savingWhitelist = false;
            if (!payload) return;
            this.showToast(
              this.editingWhitelistId ? "白名单已更新" : "白名单已添加",
              this.editingWhitelistId ? "发件人过滤规则已替换" : "后续邮件会先通过新模式过滤"
            );
            this.whitelistPage = 1;
            this.resetWhitelistForm();
            await this.loadWhitelistData();
          },
          async deleteWhitelistEntry(id) {
            const confirmed = await this.openDialog({
              tone: "danger",
              eyebrow: "Delete Allowlist",
              title: "确认删除这条白名单？",
              message: "删除后，与这条模式匹配的发件人会失去放行约束。若当前没有其他白名单，系统会重新接受所有发件人。",
              confirmLabel: "删除白名单"
            });
            if (!confirmed) return;
            const payload = await this.requestJson("/admin/whitelist/" + id, { method: "DELETE" });
            if (!payload) return;
            this.showToast("白名单已删除", "发件人过滤列表已更新");
            await this.loadWhitelistData();
            if (this.whitelistItems.length === 0 && this.whitelistPage > 1) {
              this.whitelistPage -= 1;
              await this.loadWhitelistData();
            }
            if (this.editingWhitelistId === id) this.resetWhitelistForm();
          },
          async nextWhitelistPage() {
            if (this.whitelistPage >= this.whitelistTotalPages) return;
            this.whitelistPage += 1;
            await this.loadWhitelistData();
          },
          async prevWhitelistPage() {
            if (this.whitelistPage <= 1) return;
            this.whitelistPage -= 1;
            await this.loadWhitelistData();
          },
          async loadForwardingSettings() {
            const payload = await this.requestJson("/admin/settings/forwarding");
            if (!payload?.data) return;
            this.forwardingForm = this.buildForwardingForm(payload.data);
            this.updateForwardingOriginal();
          },
          async saveForwardingSettings() {
            if (!this.canSaveForwarding) return;
            this.savingForwarding = true;
            const payload = await this.requestJson("/admin/settings/forwarding", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                forwarding_mode: this.forwardingForm.forwarding_mode,
                forward_to: this.forwardingForm.forward_to,
                builtin_rule_mode: this.forwardingForm.builtin_rule_mode,
                forward_payload_mode: this.forwardingForm.forward_payload_mode
              })
            });
            this.savingForwarding = false;
            if (!payload?.data) return;
            this.forwardingForm = this.buildForwardingForm(payload.data);
            this.updateForwardingOriginal();
            this.showToast(
              "邮件策略已保存",
              this.forwardingForm.forwarding_active
                ? ("新的" + this.forwardPayloadModeLabel + "会继续按当前地址转发，提取策略也已同步更新")
                : "转发状态与内置规则策略都已保存"
            );
          }
        }
      }).mount("#app");

      function getCookieValue(name) {
        const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
        return match ? decodeURIComponent(match[1]) : "";
      }
`;
}

export function renderHtml(pageSize, rulesPageSize) {
  return `<!DOCTYPE html>
<html lang="zh">
${renderDocumentHead("Temp Mail Console")}
  <body>
    <div id="app" v-cloak class="app-shell">
      <header class="shell topbar screen-enter" style="--stagger:0">
        <div class="brand">
          <div class="brand-kicker">Warm Signal Desk</div>
          <div class="brand-mark">
            <div class="brand-seal">${renderLogo()}</div>
            <div>
              <h1 class="brand-title">Temp Mail<br />Console</h1>
            </div>
          </div>
          <p class="brand-subtitle">面向开发、QA 与自动化维护的邮件信号台。快速筛查收件事件、维护提取规则、配置原始邮件转发，并把调试成本压到最低。</p>
        </div>
        <div class="chrome-actions">
          <div class="status-pill">
            <span class="status-dot" :class="{ online: apiActive }"></span>
            <span>{{ apiActive ? "控制台在线" : "请求异常" }}</span>
          </div>
          <button class="ghost-button" @click="toggleTheme">{{ isDark ? "切到亮色" : "切到暗色" }}</button>
          <button class="ghost-button" @click="logout()">退出</button>
        </div>
      </header>

      <main class="shell">
        <section class="hero screen-enter" style="--stagger:1">
          <article class="hero-copy-panel">
            <div>
              <div class="eyebrow">Operational Briefing</div>
              <h2 class="hero-title">让收件、提取、转发与巡检<span class="hero-break">收束成一条<span class="hero-accent">更短的路径</span>。</span></h2>
            </div>
            <p class="panel-copy">所有页面围绕“快速判断”和“即时调整”设计：邮件是否命中、规则是否正确、白名单是否放行、转发是否生效，都应该在一个视图内得到答案。</p>
            <div class="hero-note">
              <span class="mini-pill">{{ forwardingForm.forwarding_active ? "转发已启用" : "转发未启用" }}</span>
              <span class="mini-pill">转发内容：{{ forwardPayloadModeLabel }}</span>
              <span class="mini-pill">提取策略：{{ builtinRuleModeLabel }}</span>
              <span class="mini-pill">{{ filterDomain ? "正在筛选域名：" + filterDomain : "当前查看全部域名" }}</span>
              <span class="mini-pill">{{ searchQuery ? "搜索：" + searchQuery : "支持按主题 / 发件人 / 收件人 / 结果搜索" }}</span>
            </div>
            <div class="hero-actions">
              <button class="solid-button" @click="setActiveTab('forwarding')">配置 QQ 转发</button>
              <button class="soft-button" @click="setActiveTab('rules')">维护规则</button>
            </div>
          </article>

          <article class="hero-metrics">
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Inbox</div>
                <div class="metric-value">{{ total }}</div>
                <div class="metric-copy">当前筛选条件下的邮件总数</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Signals</div>
                <div class="metric-value">{{ totalRuleInventory }}</div>
                <div class="metric-copy">站点解析器、内置规则与自定义规则的总量</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Allowlist</div>
                <div class="metric-value">{{ whitelistTotal }}</div>
                <div class="metric-copy">发件人放行模式数量</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Forwarding</div>
                <div class="metric-value">{{ forwardingForm.forwarding_active ? "ON" : "OFF" }}</div>
                <div class="metric-copy">{{ effectiveForwardTarget || "没有生效中的目标邮箱" }}</div>
              </div>
            </div>
          </article>
        </section>

        <nav class="tab-rail screen-enter" style="--stagger:2" aria-label="主导航">
          <button class="tab-button" :class="{ active: activeTab === 'emails' }" @click="setActiveTab('emails')">邮件记录</button>
          <button class="tab-button" :class="{ active: activeTab === 'rules' }" @click="setActiveTab('rules')">命中规则</button>
          <button class="tab-button" :class="{ active: activeTab === 'whitelist' }" @click="setActiveTab('whitelist')">发件人白名单</button>
          <button class="tab-button" :class="{ active: activeTab === 'forwarding' }" @click="setActiveTab('forwarding')">转发设置</button>
          <button class="tab-button" :class="{ active: activeTab === 'api' }" @click="setActiveTab('api')">API</button>
        </nav>

        <div v-if="adminError" class="inline-alert">{{ adminError }}</div>

        <section v-if="activeTab === 'emails'" class="workspace screen-enter" style="--stagger:3">
          <article class="panel email-panel">
            <div class="panel-head">
              <div>
                <h3 class="panel-title">收件箱巡检</h3>
                <p class="panel-subtitle">按域名和关键字联动筛查最近邮件。搜索会同时命中主题、发件人、收件人和提取结果，适合快速定位验证码、注册链接或特定发件源。</p>
              </div>
              <div class="stat-line">
                <span>第 {{ page }} / {{ totalPages }} 页</span>
                <span>总计 {{ total }} 封</span>
              </div>
            </div>

            <div class="toolbar">
              <div class="search-field">
                <label class="field-label" for="email-search">搜索邮件</label>
                <div class="field-shell">
                  <input id="email-search" class="field-input" type="search" v-model="searchQuery" @keydown.enter="applyEmailFilters" placeholder="主题、发件人、收件人、提取值" autocomplete="off" spellcheck="false" />
                </div>
              </div>
              <div class="select-field">
                <label class="field-label" for="domain-filter">域名筛选</label>
                <div class="custom-select" data-domain-select :class="{ 'menu-open': domainMenuOpen }">
                  <button
                    id="domain-filter"
                    class="ghost-button select-trigger"
                    :class="{ open: domainMenuOpen }"
                    type="button"
                    aria-haspopup="listbox"
                    :aria-expanded="domainMenuOpen ? 'true' : 'false'"
                    @click="toggleDomainMenu"
                    @keydown.down.prevent="openDomainMenu"
                    @keydown.enter.prevent="toggleDomainMenu"
                    @keydown.space.prevent="toggleDomainMenu"
                  >
                    <span class="select-trigger-copy">
                      <span class="select-trigger-value">{{ currentDomainLabel() }}</span>
                      <span class="select-trigger-meta">{{ currentDomainMeta() }}</span>
                    </span>
                    <span class="select-trigger-icon" aria-hidden="true">⌄</span>
                  </button>
                  <div v-if="domainMenuOpen" class="custom-select-menu" role="listbox" aria-labelledby="domain-filter">
                    <button class="custom-select-option" :class="{ active: !filterDomain }" type="button" role="option" :aria-selected="!filterDomain ? 'true' : 'false'" @click="selectDomain('')">
                      <span class="option-title">全部域名</span>
                      <span class="option-meta">不过滤收件域名，查看当前邮箱池的所有邮件。</span>
                    </button>
                    <button
                      v-for="domain in availableDomains"
                      :key="domain"
                      class="custom-select-option"
                      :class="{ active: filterDomain === domain }"
                      type="button"
                      role="option"
                      :aria-selected="filterDomain === domain ? 'true' : 'false'"
                      @click="selectDomain(domain)"
                    >
                      <span class="option-title">{{ domain }}</span>
                      <span class="option-meta">只查看收件地址包含 {{ domain }} 的邮件。</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="toolbar-actions">
                <button class="solid-button" @click="applyEmailFilters">应用筛选</button>
                <button class="ghost-button" @click="clearEmailFilters">清空</button>
              </div>
            </div>

            <div class="stack">
              <div v-if="items.length === 0" class="empty-state">
                <div class="eyebrow">Inbox Empty</div>
                <h4 class="empty-title">当前筛选下没有邮件。</h4>
                <p class="empty-copy">可以先清空搜索条件，也可以等待新的路由邮件进入。若你正在调试 Cloudflare Email Routing，建议同时确认白名单和目标域名配置。</p>
              </div>

              <div v-else class="message-feed">
                <article v-for="item in items" :key="item.message_id" class="message-card" :class="{ expanded: item._expanded }">
                  <div class="message-summary">
                    <div class="message-summary-top">
                      <div class="message-summary-copy">
                        <div class="message-meta">
                          <span class="tag" :class="hasResult(item.extracted_json) ? 'positive' : 'neutral'">
                            {{ hasResult(item.extracted_json) ? ('命中 ' + resultCount(item.extracted_json) + ' 条') : '未命中' }}
                          </span>
                          <span class="tag attention" v-if="item.to_address && item.to_address.includes(',')">多收件人</span>
                        </div>
                        <h4 class="subject">{{ item.subject || "（无主题）" }}</h4>
                        <div class="message-grid">
                          <div><strong>发件人</strong><br />{{ item.from_address }}</div>
                          <div><strong>收件人</strong><br />{{ item.to_address }}</div>
                          <div><strong>接收时间</strong><br />{{ formatTime(item.received_at) }}</div>
                          <div><strong>状态</strong><br />{{ item._expanded ? "详情已展开" : "详情已折叠" }}</div>
                        </div>
                        <p class="subject-copy" v-if="item.content_summary">{{ item.content_summary }}</p>
                      </div>
                      <button
                        class="ghost-button message-toggle"
                        type="button"
                        :aria-expanded="item._expanded ? 'true' : 'false'"
                        :aria-label="item._expanded ? '收起邮件详情' : '展开邮件详情'"
                        @click="toggleResult(item.message_id)"
                      >
                        {{ item._expanded ? "收起详情" : "展开详情" }}
                      </button>
                    </div>
                  </div>

                  <div v-if="item._expanded" class="message-details">
                    <div class="result-shell" v-if="hasResult(item.extracted_json)">
                      <div class="list-head">
                        <div>
                          <div class="field-label">提取结果</div>
                          <div class="microcopy">按规则分组展示本封邮件命中的内容。</div>
                        </div>
                        <button class="chip-button" @click="copyContent(formatResult(item.extracted_json))">复制 JSON</button>
                      </div>
                      <div class="result-list">
                        <div class="result-item" v-for="(result, index) in parseResults(item.extracted_json)" :key="resultKey(result, index)">
                          <strong>{{ result.remark || (result.rule_id ? ('规则 #' + result.rule_id) : '未命名命中') }}</strong>
                          <div class="tag-cloud">
                            <span class="tag neutral">{{ resultSourceLabel(result) }}</span>
                            <span class="tag neutral" v-if="result.rule_key">{{ result.rule_key }}</span>
                            <span class="tag neutral" v-if="result.plugin_key">{{ result.plugin_key }}</span>
                          </div>
                          <div class="mono">{{ result.value }}</div>
                          <div class="result-context" v-if="result.before || result.after">
                            <div v-if="result.before"><strong>Before</strong> <span class="mono">{{ result.before }}</span></div>
                            <div><strong>Match</strong> <span class="mono">{{ result.match || result.value }}</span></div>
                            <div v-if="result.after"><strong>After</strong> <span class="mono">{{ result.after }}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="note-shell" v-else>
                      <div class="field-label">没有命中结果</div>
                      <p class="microcopy">这封邮件通过了白名单，但没有命中任何站点解析器或提取规则。可以去“命中规则”页补充新的自定义正则，或继续扩展站点解析插件。</p>
                    </div>
                  </div>
                </article>
              </div>

              <div class="pager">
                <button class="ghost-button" :disabled="page === 1" @click="prevPage">上一页</button>
                <button class="ghost-button" @click="loadList">刷新</button>
                <button class="ghost-button" :disabled="page >= totalPages" @click="nextPage">下一页</button>
              </div>
            </div>
          </article>
        </section>

        <section v-if="activeTab === 'rules'" class="workspace screen-enter" style="--stagger:3">
          <article class="panel">
            <div class="panel-head">
              <div>
                <h3 class="panel-title">规则控制台</h3>
                <p class="panel-subtitle">这里会同时展示站点解析器目录、系统内置规则和你手动维护的自定义规则。创建前会校验正则合法性，避免无效表达式被写入后在运行时静默跳过。</p>
              </div>
              <div class="stat-line">
                <span>站点解析器 {{ siteParsers.length }} 个</span>
                <span>内置 {{ builtinRules.length }} 条</span>
                <span>自定义第 {{ rulesPage }} / {{ rulesTotalPages }} 页</span>
                <span>总计 {{ totalRuleInventory }} 条</span>
              </div>
            </div>

            <div class="split-layout">
              <div class="form-card">
                <div>
                  <div class="eyebrow">{{ editingRuleId ? "Edit Rule" : "Create Rule" }}</div>
                  <h4 class="panel-title">{{ editingRuleId ? "更新现有规则" : "添加新的提取规则" }}</h4>
                  <p class="panel-copy">支持针对指定发件人范围配置内容正则。发件人过滤可以使用逗号或换行分隔多个模式。</p>
                </div>

                <label class="form-field">
                  <span class="field-label">备注名称</span>
                  <div class="field-shell">
                    <input class="field-input" type="text" v-model="ruleForm.remark" placeholder="例如：验证码 / 激活链接" autocomplete="off" />
                  </div>
                </label>

                <label class="form-field">
                  <span class="field-label">发件人过滤规则</span>
                  <div class="field-shell">
                    <textarea class="field-textarea" v-model="ruleForm.sender_filter" placeholder="例如：.*@example\\.com 或多行模式" spellcheck="false"></textarea>
                  </div>
                </label>

                <label class="form-field">
                  <span class="field-label">内容匹配正则</span>
                  <div class="field-shell">
                    <textarea class="field-textarea" v-model="ruleForm.pattern" placeholder="例如：\\b\\d{6}\\b" spellcheck="false"></textarea>
                  </div>
                </label>

                <div class="form-actions">
                  <button class="solid-button" :disabled="!canSaveRule" :title="ruleSaveLabel" @click="submitRule">{{ ruleSaveLabel }}</button>
                  <button class="ghost-button" v-if="editingRuleId" @click="resetRuleForm">取消编辑</button>
                </div>
              </div>

              <div class="collection-card">
                <div class="rule-sections">
                  <section class="rule-section">
                    <div class="list-head section-head">
                      <div>
                        <div class="eyebrow">System Catalog</div>
                        <h4 class="panel-title">内置规则</h4>
                      </div>
                      <span class="section-note">始终参与提取，不需要手动创建</span>
                    </div>

                    <div class="builtin-catalog">
                      <div class="builtin-catalog-intro">
                        <p class="panel-copy">内置规则目录固定启用，规则再多也只会在这个区域内部滚动，不会继续把整页高度无限拉长。模式标签和正则预览都做成了紧凑清单，深浅色下都会保持足够对比。</p>
                        <div class="tag-cloud">
                          <span class="tag positive">主题 + 正文</span>
                          <span class="tag neutral">始终启用</span>
                          <span class="tag neutral">超出后内部滚动</span>
                        </div>
                      </div>

                      <div class="builtin-scroll">
                        <div class="builtin-list">
                          <article v-for="rule in builtinRules" :key="rule.key" class="builtin-row">
                            <div class="builtin-row-top">
                              <div class="builtin-row-title">
                                <span class="builtin-key">{{ rule.key }}</span>
                                <h4 class="resource-title">{{ rule.remark }}</h4>
                              </div>
                              <div class="builtin-meta">
                                <span class="tag positive">内置</span>
                                <span class="tag neutral">{{ rule.multiple ? "多命中" : "单命中" }}</span>
                              </div>
                            </div>
                            <p class="resource-copy builtin-description">{{ rule.description }}</p>
                            <code class="builtin-pattern" :title="rule.pattern">{{ rule.pattern }}</code>
                          </article>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div class="section-divider"></div>

                  <section class="rule-section">
                    <div class="list-head section-head">
                      <div>
                        <div class="eyebrow">Site Parsers</div>
                        <h4 class="panel-title">站点解析器</h4>
                      </div>
                      <span class="section-note">优先做站点特定提取，再交给规则引擎兜底</span>
                    </div>

                    <div class="builtin-catalog">
                      <div class="builtin-catalog-intro">
                        <p class="panel-copy">这里列出的解析器会先按发件人、关键词和平台提示过滤候选邮件，再做站点特定的验证码或链接提取。后续如果要接新站点，优先在插件目录新增解析器，而不是继续堆一层全局正则。</p>
                        <div class="tag-cloud">
                          <span class="tag positive">站点特定</span>
                          <span class="tag neutral">插件化扩展</span>
                          <span class="tag neutral">优先于规则引擎</span>
                        </div>
                      </div>

                      <div class="builtin-scroll">
                        <div class="builtin-list">
                          <article v-for="parser in siteParsers" :key="parser.key" class="builtin-row">
                            <div class="builtin-row-top">
                              <div class="builtin-row-title">
                                <span class="builtin-key">{{ parser.key }}</span>
                                <h4 class="resource-title">{{ parser.display_name }}</h4>
                              </div>
                              <div class="builtin-meta">
                                <span class="tag positive">站点解析</span>
                                <span class="tag neutral">{{ parser.site_key }}</span>
                              </div>
                            </div>
                            <p class="resource-copy builtin-description">{{ parser.description }}</p>
                            <div class="tag-cloud">
                              <span class="tag neutral" v-for="keyword in parser.sender_keywords.slice(0, 3)" :key="parser.key + '-sender-' + keyword">sender: {{ keyword }}</span>
                              <span class="tag neutral" v-for="keyword in parser.verify_keywords.slice(0, 2)" :key="parser.key + '-verify-' + keyword">verify: {{ keyword }}</span>
                            </div>
                          </article>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div class="section-divider"></div>

                  <section class="rule-section">
                    <div class="list-head section-head">
                      <div>
                        <div class="eyebrow">Rule Inventory</div>
                        <h4 class="panel-title">自定义规则</h4>
                      </div>
                      <div class="pager">
                        <button class="ghost-button" :disabled="rulesPage === 1" @click="prevRulesPage">上一页</button>
                        <button class="ghost-button" :disabled="rulesPage >= rulesTotalPages" @click="nextRulesPage">下一页</button>
                      </div>
                    </div>

                    <div v-if="rules.length === 0" class="empty-state compact-empty">
                      <div class="eyebrow">No Custom Rules</div>
                      <h4 class="empty-title">内置规则已就绪，自定义规则还没开始。</h4>
                      <p class="empty-copy">上面的站点解析器和内置规则已经会直接参与提取。这里为空只代表你还没有额外补充业务专用正则，例如某个平台的特定验证码或邀请链接格式。</p>
                    </div>

                    <div v-else class="rules-feed">
                      <article v-for="rule in rules" :key="rule.id" class="resource-card">
                        <div class="resource-meta">
                          <span class="tag attention">规则 #{{ rule.id }}</span>
                          <span class="tag" v-if="rule.sender_filter">定向发件人</span>
                          <span class="tag neutral" v-else>作用于全部发件人</span>
                        </div>
                        <h4 class="resource-title">{{ rule.remark || "未命名规则" }}</h4>
                        <p class="resource-copy"><strong>发件人：</strong>{{ rule.sender_filter || "全部发件人" }}</p>
                        <div class="code-block">{{ rule.pattern }}</div>
                        <div class="inline-actions">
                          <button class="soft-button" @click="editRule(rule)">编辑</button>
                          <button class="ghost-button" @click="deleteRule(rule.id)">删除</button>
                        </div>
                      </article>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section v-if="activeTab === 'whitelist'" class="workspace screen-enter" style="--stagger:3">
          <article class="panel">
            <div class="panel-head">
              <div>
                <h3 class="panel-title">发件人白名单</h3>
                <p class="panel-subtitle">白名单为空时会接受所有发件人；一旦添加模式，系统只处理匹配的发信源。现在支持创建、编辑和删除，且会在保存前做正则校验。</p>
              </div>
              <div class="stat-line">
                <span>第 {{ whitelistPage }} / {{ whitelistTotalPages }} 页</span>
                <span>总计 {{ whitelistTotal }} 条</span>
              </div>
            </div>

            <div class="split-layout">
              <div class="form-card">
                <div>
                  <div class="eyebrow">{{ editingWhitelistId ? "Edit Allowlist" : "Create Allowlist" }}</div>
                  <h4 class="panel-title">{{ editingWhitelistId ? "更新白名单模式" : "添加新的白名单模式" }}</h4>
                  <p class="panel-copy">适合只接受指定服务商、测试域或通知地址。推荐用一条模式覆盖一类来源，便于后续维护。</p>
                </div>

                <label class="form-field">
                  <span class="field-label">发件人模式</span>
                  <div class="field-shell">
                    <textarea class="field-textarea" v-model="whitelistForm.sender_pattern" placeholder="例如：.*@qq\\.com" spellcheck="false"></textarea>
                  </div>
                </label>

                <div class="form-actions">
                  <button class="solid-button" :disabled="!canSaveWhitelist" :title="whitelistSaveLabel" @click="submitWhitelist">{{ whitelistSaveLabel }}</button>
                  <button class="ghost-button" v-if="editingWhitelistId" @click="resetWhitelistForm">取消编辑</button>
                </div>
              </div>

              <div class="collection-card">
                <div class="list-head">
                  <div>
                    <div class="eyebrow">Allowlist Inventory</div>
                    <h4 class="panel-title">放行模式列表</h4>
                  </div>
                  <div class="pager">
                    <button class="ghost-button" :disabled="whitelistPage === 1" @click="prevWhitelistPage">上一页</button>
                    <button class="ghost-button" :disabled="whitelistPage >= whitelistTotalPages" @click="nextWhitelistPage">下一页</button>
                  </div>
                </div>

                <div v-if="whitelistItems.length === 0" class="empty-state">
                  <div class="eyebrow">Open Gate</div>
                  <h4 class="empty-title">当前没有白名单限制。</h4>
                  <p class="empty-copy">这代表所有发件人都会进入规则匹配流程。如果你只需要处理某些平台或测试域邮件，建议尽快添加白名单。</p>
                </div>

                <div v-else class="whitelist-feed">
                  <article v-for="item in whitelistItems" :key="item.id" class="resource-card">
                    <div class="resource-meta">
                      <span class="tag attention">模式 #{{ item.id }}</span>
                      <span class="tag neutral">正则匹配</span>
                    </div>
                    <h4 class="resource-title">{{ item.sender_pattern }}</h4>
                    <p class="resource-copy">匹配任意发件人地址时，该邮件才会进入规则提取和可选转发流程。</p>
                    <div class="inline-actions">
                      <button class="soft-button" @click="editWhitelist(item)">编辑</button>
                      <button class="ghost-button" @click="deleteWhitelistEntry(item.id)">删除</button>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section v-if="activeTab === 'forwarding'" class="workspace screen-enter" style="--stagger:3">
          <article class="panel">
            <div class="panel-head">
              <div>
                <h3 class="panel-title">原始邮件转发与提取策略</h3>
                <p class="panel-subtitle">默认仍然转发原始邮件；如果当前环境启用了 <code>SEND_EMAIL</code> binding，也可以切到命中摘要邮件。同时这里可以控制系统是只用自定义规则、只用内置规则，还是把两者一起参与提取。你可以继续使用部署时的 <code>FORWARD_TO</code>，也可以在后台改成一个 QQ 邮箱地址，或者直接停用转发。</p>
              </div>
              <div class="stat-line">
                <span>{{ forwardingModeLabel }}</span>
                <span>{{ forwardPayloadModeLabel }}</span>
                <span>{{ builtinRuleModeLabel }}</span>
                <span>{{ forwardingForm.forwarding_active ? "已生效" : "未生效" }}</span>
              </div>
            </div>

            <div class="settings-grid">
              <div class="form-card">
                <div>
                  <div class="eyebrow">Forwarding Strategy</div>
                  <h4 class="panel-title">选择邮件转发模式</h4>
                  <p class="panel-copy">Cloudflare Email Workers 仍要求目标邮箱先在 Email Routing 的 Destination addresses 中完成验证。QQ 邮箱可以直接用 <code>你的QQ号@qq.com</code> 作为目标地址。</p>
                </div>

                <div class="mode-switch" role="tablist" aria-label="转发模式">
                  <button class="mode-option" :class="{ active: forwardingForm.forwarding_mode === 'env' }" @click="forwardingForm.forwarding_mode = 'env'">跟随默认值</button>
                  <button class="mode-option" :class="{ active: forwardingForm.forwarding_mode === 'custom' }" @click="forwardingForm.forwarding_mode = 'custom'">自定义邮箱</button>
                  <button class="mode-option" :class="{ active: forwardingForm.forwarding_mode === 'disabled' }" @click="forwardingForm.forwarding_mode = 'disabled'">停用转发</button>
                </div>

                <label class="form-field">
                  <span class="field-label">自定义目标邮箱</span>
                  <div class="field-shell">
                    <input class="field-input" type="email" v-model="forwardingForm.forward_to" :disabled="forwardingForm.forwarding_mode !== 'custom'" placeholder="例如：123456789@qq.com" autocomplete="off" spellcheck="false" inputmode="email" />
                  </div>
                  <p class="field-note">这里填的地址必须已经在 Cloudflare Email Routing 里验证。切回“跟随默认值”时会继续使用部署里的 <code>FORWARD_TO</code>。</p>
                </label>

                <div>
                  <span class="field-label">内置规则策略</span>
                  <div class="mode-switch" role="tablist" aria-label="内置规则策略">
                    <button class="mode-option" :class="{ active: forwardingForm.builtin_rule_mode === 'append' }" @click="forwardingForm.builtin_rule_mode = 'append'">内置 + 自定义</button>
                    <button class="mode-option" :class="{ active: forwardingForm.builtin_rule_mode === 'builtin_only' }" @click="forwardingForm.builtin_rule_mode = 'builtin_only'">只用内置规则</button>
                    <button class="mode-option" :class="{ active: forwardingForm.builtin_rule_mode === 'custom_only' }" @click="forwardingForm.builtin_rule_mode = 'custom_only'">只用自定义规则</button>
                  </div>
                </div>

                <div>
                  <span class="field-label">转发内容</span>
                  <div class="mode-switch" role="tablist" aria-label="转发内容">
                    <button class="mode-option" :class="{ active: forwardingForm.forward_payload_mode === 'raw' }" @click="forwardingForm.forward_payload_mode = 'raw'">原始邮件</button>
                    <button class="mode-option" :class="{ active: forwardingForm.forward_payload_mode === 'matched' }" :disabled="!forwardingForm.matched_forwarding_available" @click="forwardingForm.forward_payload_mode = 'matched'">命中摘要邮件</button>
                  </div>
                </div>

                <div class="status-shell">
                  <div class="field-label">当前解析结果</div>
                  <div class="key-points">
                    <div class="key-point">
                      <strong>部署默认值</strong>
                      <span class="microcopy">{{ forwardingForm.env_forward_to || "未设置 FORWARD_TO" }}</span>
                    </div>
                    <div class="key-point">
                      <strong>当前生效目标</strong>
                      <span class="microcopy">{{ effectiveForwardTarget || "没有生效中的转发地址" }}</span>
                    </div>
                    <div class="key-point">
                      <strong>QQ 邮箱提示</strong>
                      <span class="microcopy">先到 Cloudflare Email Routing 验证 QQ 地址，再在这里保存；只有通过白名单的邮件会继续转发。</span>
                    </div>
                    <div class="key-point">
                      <strong>当前提取策略</strong>
                      <span class="microcopy">{{ builtinRuleModeLabel }}。这里只控制规则引擎；站点解析器会优先按站点特征做提取。内置规则默认覆盖数字、英文+数字、连字符代码、链接和封禁邮件；匹配源会同时包含主题与正文。</span>
                    </div>
                    <div class="key-point">
                      <strong>当前转发内容</strong>
                      <span class="microcopy">{{ forwardPayloadModeLabel }}。默认继续转发完整原始邮件；如果启用命中摘要邮件，则会改为发送一封结构化摘要。</span>
                    </div>
                    <div class="key-point" v-if="!forwardingForm.matched_forwarding_available">
                      <strong>摘要转发暂不可用</strong>
                      <span class="microcopy">需要在 Worker 中配置 <code>SEND_EMAIL</code> binding 后，才能把命中摘要作为一封新邮件发送出去。</span>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button class="solid-button" :disabled="!canSaveForwarding" :title="forwardingSaveLabel" @click="saveForwardingSettings">{{ forwardingSaveLabel }}</button>
                </div>
              </div>

              <div class="collection-card">
                <div class="list-head">
                  <div>
                    <div class="eyebrow">Operational Notes</div>
                    <h4 class="panel-title">转发生效边界</h4>
                  </div>
                  <span class="tag" :class="forwardingForm.forwarding_active ? 'positive' : 'neutral'">{{ forwardingForm.forwarding_active ? "Active" : "Idle" }}</span>
                </div>

                <div class="key-points">
                  <div class="key-point">
                    <strong>只转发通过白名单的邮件</strong>
                    <span class="microcopy">未命中白名单的邮件会在入口阶段直接忽略，也不会进入转发逻辑。</span>
                  </div>
                  <div class="key-point">
                    <strong>模式为“跟随默认值”时向下兼容</strong>
                    <span class="microcopy">如果部署里已经设置了 <code>FORWARD_TO</code>，系统会直接沿用；如果没有，则不会进行任何转发。</span>
                  </div>
                  <div class="key-point">
                    <strong>模式为“自定义邮箱”时优先生效</strong>
                    <span class="microcopy">适合在不重新部署 Worker 的情况下，临时改成一个 QQ 邮箱做人工巡检。</span>
                  </div>
                  <div class="key-point">
                    <strong>转发失败不会阻断入库</strong>
                    <span class="microcopy">即使 Cloudflare 拒绝转发，邮件仍会照常解析并写入 D1，方便继续排查。</span>
                  </div>
                  <div class="key-point">
                    <strong>默认仍然转发原始邮件</strong>
                    <span class="microcopy">默认配置仍然是原始邮件；只有在当前环境支持并且你手动切到“命中摘要邮件”时，转发内容才会改成结构化摘要。</span>
                  </div>
                  <div class="key-point">
                    <strong>摘要转发需要额外发送能力</strong>
                    <span class="microcopy">当你切到“命中摘要邮件”时，Worker 会用 <code>SEND_EMAIL</code> binding 构造一封摘要邮件发送到目标邮箱，而不是调用原始的 <code>message.forward()</code>。</span>
                  </div>
                  <div class="key-point">
                    <strong>内置规则可作为兜底</strong>
                    <span class="microcopy">当你还没配自定义规则时，系统也能直接尝试抓纯数字、英文数字组合、连字符代码、链接和封禁 / 停用通知。</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section v-if="activeTab === 'api'" class="workspace screen-enter" style="--stagger:3">
          <article class="panel">
            <div class="panel-head">
              <div>
                <h3 class="panel-title">公开 API 速览</h3>
                <p class="panel-subtitle">公开 API 现在同时支持“最新一条”与“列表查询”。你可以按收件地址、起始时间和命中备注筛选，并拿到主题、内容摘要和命中前后上下文。</p>
              </div>
            </div>

            <div class="api-grid">
              <div class="api-card">
                <section class="api-section">
                  <div class="list-head">
                    <div>
                      <div class="eyebrow">Auth</div>
                      <h4 class="panel-title">Bearer 鉴权</h4>
                    </div>
                  </div>
                  <pre class="code-block">Authorization: Bearer &lt;API_TOKEN&gt;</pre>
                </section>

                <div class="api-divider"></div>

                <section class="api-section">
                  <div class="list-head">
                    <div>
                      <div class="eyebrow">Request</div>
                      <h4 class="panel-title">查询最新命中结果</h4>
                    </div>
                  </div>
                  <pre class="code-block">GET /api/emails/latest?address=target@example.com&remark=链接&since=2026-03-26T00:00:00.000Z</pre>
                </section>

                <section class="api-section">
                  <div class="list-head">
                    <div>
                      <div class="eyebrow">List</div>
                      <h4 class="panel-title">按条件拉取邮件列表</h4>
                    </div>
                  </div>
                  <pre class="code-block">GET /api/emails?address=target@example.com&remark=数字&since=1742947200000&limit=20</pre>
                </section>

                <div class="api-divider"></div>

                <section class="api-section">
                  <div class="list-head">
                    <div>
                      <div class="eyebrow">Query</div>
                      <h4 class="panel-title">参数定义</h4>
                    </div>
                  </div>
                  <div class="key-points">
                    <div class="key-point">
                      <strong>address</strong>
                      <span class="microcopy">必填。要查询的收件人邮箱地址，公开 API 仍然默认按收件地址做隔离。</span>
                    </div>
                    <div class="key-point">
                      <strong>since</strong>
                      <span class="microcopy">可选。支持 13 位毫秒时间戳或 ISO 时间，用来限制只看某个时刻之后收到的邮件。</span>
                    </div>
                    <div class="key-point">
                      <strong>remark</strong>
                      <span class="microcopy">可选。按命中备注过滤，例如“数字”“链接”“封禁邮件”“验证码”。命中列表会被同步裁剪成同 remark 的结果。</span>
                    </div>
                    <div class="key-point">
                      <strong>limit</strong>
                      <span class="microcopy">仅列表接口可选，默认 20，最大 50。</span>
                    </div>
                  </div>
                </section>
              </div>

              <div class="api-card">
                <section class="api-section">
                  <div class="list-head">
                    <div>
                      <div class="eyebrow">Response</div>
                      <h4 class="panel-title">返回体示例</h4>
                    </div>
                  </div>
                  <pre class="code-block">{
  "code": 200,
  "data": {
    "message_id": "4f9c...",
    "from_address": "noreply@example.com",
    "to_address": "demo@your-domain.com",
    "subject": "Your sign-in code",
    "content_summary": "Use code 123456 to continue. Visit https://example.com/verify if needed.",
    "received_at": 1741881600000,
    "results": [
      {
        "rule_id": null,
        "rule_key": "builtin_digits",
        "source": "builtin",
        "remark": "数字",
        "value": "123456",
        "match": "123456",
        "before": "Use code",
        "after": "to continue."
      }
    ]
  }
}</pre>
                </section>

                <div class="api-divider"></div>

                <section class="api-section">
                  <div class="key-points">
                    <div class="key-point">
                      <strong>subject / content_summary</strong>
                      <span class="microcopy">不返回整封原文，但会暴露足够短的主题和正文摘要，方便业务侧做进一步判断。</span>
                    </div>
                    <div class="key-point">
                      <strong>before / match / after</strong>
                      <span class="microcopy">每条命中结果都带上下文片段，方便调用方在不存整封邮件的情况下判断是不是目标验证码或链接。</span>
                    </div>
                    <div class="key-point">
                      <strong>source / rule_key</strong>
                      <span class="microcopy">可区分命中来自站点解析器、内置规则还是自定义规则。内置规则默认包含数字、英文+数字、连字符代码、链接和封禁邮件。</span>
                    </div>
                    <div class="key-point">
                      <strong>完整请求示例</strong>
                      <span class="microcopy">仓库里有 <code>API_REQUEST_EXAMPLES.md</code>，包含 cURL、JavaScript 和 Python 可直接复制的调用方式。</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </article>
        </section>
      </main>

      <div class="toast-stack" aria-live="polite" aria-atomic="true">
        <div v-if="toast.show" class="toast" :class="toast.tone">
          <div class="toast-icon" aria-hidden="true">{{ toast.tone === "error" ? "!" : "✓" }}</div>
          <div class="toast-copy">
            <strong>{{ toast.title }}</strong>
            <div>{{ toast.message }}</div>
          </div>
          <button class="toast-close" type="button" @click="dismissToast" aria-label="关闭通知">×</button>
          <div class="toast-progress" aria-hidden="true">
            <span class="toast-progress-bar"></span>
          </div>
        </div>
      </div>

      <div v-if="dialog.open" class="dialog-backdrop" tabindex="-1" @click.self="resolveDialog(false)" @keydown.esc="resolveDialog(false)">
        <section class="dialog-panel" :class="dialog.tone" role="alertdialog" aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-message">
          <div class="dialog-content">
            <div class="dialog-topline">
              <div class="dialog-icon" aria-hidden="true">{{ dialog.tone === "danger" ? "!" : "?" }}</div>
              <div class="dialog-copy">
                <div class="eyebrow">{{ dialog.eyebrow }}</div>
                <h4 id="app-dialog-title" class="dialog-title">{{ dialog.title }}</h4>
                <p id="app-dialog-message" class="dialog-message">{{ dialog.message }}</p>
              </div>
            </div>
          </div>
          <div class="dialog-actions">
            <button class="ghost-button" type="button" @click="resolveDialog(false)">{{ dialog.cancelLabel }}</button>
            <button class="solid-button" :class="{ 'danger-button': dialog.tone === 'danger' }" type="button" data-dialog-confirm @click="resolveDialog(true)">{{ dialog.confirmLabel }}</button>
          </div>
        </section>
      </div>
    </div>

    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script>${renderAppScript(pageSize, rulesPageSize)}</script>
  </body>
</html>`;
}

export function renderAuthHtml() {
  return `<!DOCTYPE html>
<html lang="zh">
${renderDocumentHead("Temp Mail Console - 登录")}
  <body>
    <div class="auth-shell">
      <div class="auth-grid">
        <section class="auth-story screen-enter" style="--stagger:0">
          <div class="auth-story-content">
            <div>
              <div class="brand-kicker">Entry Console</div>
              <div class="brand-mark">
                <div class="brand-seal">${renderLogo()}</div>
                <div>
                  <h1 class="auth-title">进入你的邮件信号台。</h1>
                </div>
              </div>
              <p class="panel-copy">这不是普通后台，而是一张用于快速判断邮件状态的工作台。你可以在这里检查命中结果、编辑规则、维护白名单，并把原始邮件转发到已验证的 QQ 邮箱做人工巡检。</p>
            </div>

            <div class="key-points">
              <div class="key-point">
                <strong>快速排查</strong>
                <span class="microcopy">查看最近邮件、搜索命中内容、确认收件域与发件源是否正确。</span>
              </div>
              <div class="key-point">
                <strong>即时调整</strong>
                <span class="microcopy">直接编辑规则与白名单，不需要离开控制台再改配置文件。</span>
              </div>
              <div class="key-point">
                <strong>保持人工兜底</strong>
                <span class="microcopy">可选启用原始邮件转发，把关键邮件镜像到 QQ 邮箱做复核。</span>
              </div>
            </div>
          </div>
        </section>

        <section class="auth-card screen-enter" style="--stagger:1">
          <div class="auth-card-content">
            <div class="auth-foot">
              <span class="eyebrow">Admin Access</span>
              <button id="theme-toggle" class="ghost-button" type="button">切换主题</button>
            </div>

            <div>
              <h2 class="panel-title">输入管理员令牌</h2>
              <p class="panel-copy">登录页会先调用管理接口校验令牌，成功后写入 <code>admin_token</code> Cookie，再自动回到主页。</p>
            </div>

            <form class="auth-form" onsubmit="return false;">
              <label class="form-field">
                <span class="field-label">ADMIN_TOKEN</span>
                <div class="field-shell">
                  <input id="admin-token" class="field-input" type="password" placeholder="请输入后台访问令牌" autocomplete="current-password" spellcheck="false" />
                </div>
                <p class="field-note">令牌会先请求管理接口做一次校验，通过后再写入 <code>admin_token</code> Cookie。</p>
              </label>
              <div id="admin-error" class="auth-error">密码不正确，请重试。</div>
              <button id="admin-submit" class="solid-button auth-submit" type="button" disabled>进入控制台</button>
            </form>

            <div class="auth-foot">
              <span>支持亮色 / 暗色主题，登录后状态保持一致。</span>
              <a href="https://github.com/beyoug/temp-mail-console" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        </section>
      </div>
    </div>

    <script>
      const input = document.getElementById("admin-token");
      const error = document.getElementById("admin-error");
      const submit = document.getElementById("admin-submit");
      const themeToggle = document.getElementById("theme-toggle");

      if (input) input.focus();

      themeToggle?.addEventListener("click", () => {
        const nextDark = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", nextDark);
        localStorage.setItem("tmc-theme", nextDark ? "dark" : "light");
      });

      function showError(message) {
        if (!error) return;
        error.textContent = message;
        error.classList.add("show");
      }

      function hideError() {
        error?.classList.remove("show");
      }

      function syncSubmitState(isLoading = false) {
        if (!submit) return;
        const hasToken = Boolean(input && input.value.trim());
        submit.disabled = isLoading || !hasToken;
        submit.textContent = isLoading ? "校验中..." : "进入控制台";
      }

      async function attempt() {
        const token = input ? input.value.trim() : "";
        if (!token) {
          showError("请输入访问令牌。");
          return;
        }
        hideError();
        syncSubmitState(true);
        try {
          const res = await fetch("/admin/emails?page=1", {
            headers: { Authorization: "Bearer " + token }
          });
          if (res.status === 401) {
            showError("密码不正确，请重试。");
            return;
          }
          if (!res.ok) {
            showError("登录失败，请稍后再试。");
            return;
          }
          document.cookie = "admin_token=" + encodeURIComponent(token) + "; Path=/; SameSite=Lax";
          window.location.href = "/";
        } finally {
          syncSubmitState(false);
        }
      }

      submit?.addEventListener("click", attempt);
      input?.addEventListener("input", () => {
        hideError();
        syncSubmitState(false);
      });
      input?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") attempt();
      });
      syncSubmitState(false);
    </script>
  </body>
</html>`;
}
