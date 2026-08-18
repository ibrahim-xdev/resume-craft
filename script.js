/* ============================================================
   STATE
   ============================================================ */
const STORAGE_KEY = "resumecraft-data";
const THEME_KEY = "resumecraft-theme";

let state = {
  personal: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  skills: [],
  role: "",
  template: "modern",
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = Object.assign(state, parsed);
    }
  } catch (e) {
    console.warn("Could not load saved resume", e);
  }
}
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save resume", e);
  }
}

/* ============================================================
   SKILL SUGGESTIONS DATA
   ============================================================ */
const ROLE_SKILLS = {
  "Frontend Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Git",
    "Responsive Design",
    "REST APIs",
  ],
  "Backend Developer": [
    "Node.js",
    "Python",
    "SQL",
    "REST APIs",
    "Docker",
    "Git",
    "System Design",
  ],
  "Full Stack Developer": [
    "JavaScript",
    "React",
    "Node.js",
    "SQL",
    "Git",
    "REST APIs",
    "Docker",
  ],
  "Data Scientist": [
    "Python",
    "Pandas",
    "NumPy",
    "Machine Learning",
    "SQL",
    "Data Visualization",
    "Statistics",
  ],
  "Mobile Developer": [
    "Swift",
    "Kotlin",
    "Flutter",
    "React Native",
    "Git",
    "REST APIs",
    "UI Design",
  ],
  "UI/UX Designer": [
    "Figma",
    "Wireframing",
    "Prototyping",
    "User Research",
    "Adobe XD",
    "Design Systems",
  ],
  "DevOps Engineer": [
    "Docker",
    "Kubernetes",
    "CI/CD",
    "AWS",
    "Linux",
    "Git",
    "Terraform",
  ],
};

/* ============================================================
   DOM REFS
   ============================================================ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const els = {
  name: $("#f-name"),
  title: $("#f-title"),
  email: $("#f-email"),
  phone: $("#f-phone"),
  location: $("#f-location"),
  linkedin: $("#f-linkedin"),
  github: $("#f-github"),
  summary: $("#f-summary"),
  summaryCount: $("#summaryCount"),
  role: $("#f-role"),
  skillInput: $("#f-skillInput"),
  suggestRow: $("#suggestRow"),
  skillChips: $("#skillChips"),
  experienceList: $("#experienceList"),
  educationList: $("#educationList"),
  projectsList: $("#projectsList"),
  certificationsList: $("#certificationsList"),
  paper: $("#paper"),
  stamp: $("#stamp"),
  meterFill: $("#meterFill"),
  meterPct: $("#meterPct"),
  meterChecks: $("#meterChecks"),
};

/* ============================================================
   INIT
   ============================================================ */
function init() {
  loadState();

  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);

  Object.keys(ROLE_SKILLS).forEach((role) => {
    const opt = document.createElement("option");
    opt.value = role;
    opt.textContent = role;
    els.role.appendChild(opt);
  });

  els.name.value = state.personal.name;
  els.title.value = state.personal.title;
  els.email.value = state.personal.email;
  els.phone.value = state.personal.phone;
  els.location.value = state.personal.location;
  els.linkedin.value = state.personal.linkedin;
  els.github.value = state.personal.github;
  els.summary.value = state.summary;
  els.role.value = state.role;

  $$(".tpl-switch button").forEach((b) => {
    b.classList.toggle("active", b.dataset.tpl === state.template);
  });
  els.paper.className = "paper tpl-" + state.template;

  bindEvents();
  renderExperience();
  renderEducation();
  renderProjects();
  renderCertifications();
  renderSkillChips();
  renderSuggestions();
  updateSummaryCount();
  renderPreview();
  refreshScores();
}

/* ============================================================
   THEME
   ============================================================ */
function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  $("#themeToggle").textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem(THEME_KEY, theme);
}

/* ============================================================
   EVENTS
   ============================================================ */
function bindEvents() {
  $("#themeToggle").addEventListener("click", () => {
    const cur = document.body.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
  });

  $$(".rail-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".rail-item").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const sec = btn.dataset.section;
      $$(".form-section").forEach((s) =>
        s.classList.toggle("active", s.dataset.section === sec),
      );
      if (window.innerWidth <= 1180) setMobileView("form");
    });
  });

  const bindField = (el, path) => {
    el.addEventListener("input", () => {
      state.personal[path] = el.value;
      saveState();
      renderPreview();
      refreshScores();
    });
  };
  bindField(els.name, "name");
  bindField(els.title, "title");
  bindField(els.email, "email");
  bindField(els.phone, "phone");
  bindField(els.location, "location");
  bindField(els.linkedin, "linkedin");
  bindField(els.github, "github");

  els.summary.addEventListener("input", () => {
    state.summary = els.summary.value;
    updateSummaryCount();
    saveState();
    renderPreview();
    refreshScores();
  });

  els.role.addEventListener("change", () => {
    state.role = els.role.value;
    saveState();
    renderSuggestions();
  });

  els.skillInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(els.skillInput.value);
      els.skillInput.value = "";
    }
  });
  $("#addSkillBtn").addEventListener("click", () => {
    addSkill(els.skillInput.value);
    els.skillInput.value = "";
  });

  $("#addExperience").addEventListener("click", () => {
    state.experience.push({
      id: uid(),
      company: "",
      role: "",
      location: "",
      start: "",
      end: "",
      current: false,
      description: "",
    });
    saveState();
    renderExperience();
    renderPreview();
    refreshScores();
  });
  $("#addEducation").addEventListener("click", () => {
    state.education.push({
      id: uid(),
      school: "",
      degree: "",
      start: "",
      end: "",
      gpa: "",
    });
    saveState();
    renderEducation();
    renderPreview();
    refreshScores();
  });
  $("#addProject").addEventListener("click", () => {
    state.projects.push({
      id: uid(),
      name: "",
      tech: "",
      link: "",
      description: "",
    });
    saveState();
    renderProjects();
    renderPreview();
    refreshScores();
  });
  $("#addCertification").addEventListener("click", () => {
    state.certifications.push({ id: uid(), name: "", issuer: "", date: "" });
    saveState();
    renderCertifications();
    renderPreview();
    refreshScores();
  });

  $("#tplSwitch").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    state.template = btn.dataset.tpl;
    $$(".tpl-switch button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    els.paper.className = "paper tpl-" + state.template;
    saveState();
    renderPreview();
  });

  $("#exportBtn").addEventListener("click", () => {
    window.print();
  });

  $("#analyzeBtn").addEventListener("click", openDrawer);
  $("#closeDrawer").addEventListener("click", closeDrawer);
  $("#drawerOverlay").addEventListener("click", closeDrawer);

  $$(".mobile-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setMobileView(btn.dataset.view));
  });
}

function setMobileView(view) {
  $$(".mobile-nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view),
  );
  $("#rail").classList.toggle("mobile-active", view === "rail");
  $("#formPanel").classList.toggle("mobile-hide", view !== "form");
  $("#previewPanel").classList.toggle("mobile-active", view === "preview");
}

function openDrawer() {
  refreshScores();
  $("#drawer").classList.add("open");
  $("#drawerOverlay").classList.add("open");
}
function closeDrawer() {
  $("#drawer").classList.remove("open");
  $("#drawerOverlay").classList.remove("open");
}

/* ============================================================
   SUMMARY COUNTER
   ============================================================ */
function updateSummaryCount() {
  const len = els.summary.value.length;
  els.summaryCount.textContent = `${len} / 300 characters`;
  els.summaryCount.parentElement.classList.toggle("warn", len > 280);
}

/* ============================================================
   SKILLS
   ============================================================ */
function addSkill(name) {
  name = (name || "").trim();
  if (!name) return;
  if (state.skills.some((s) => s.toLowerCase() === name.toLowerCase())) return;
  state.skills.push(name);
  saveState();
  renderSkillChips();
  renderSuggestions();
  renderPreview();
  refreshScores();
}
function removeSkill(name) {
  state.skills = state.skills.filter((s) => s !== name);
  saveState();
  renderSkillChips();
  renderSuggestions();
  renderPreview();
  refreshScores();
}
function renderSkillChips() {
  els.skillChips.innerHTML = state.skills.length
    ? ""
    : '<span class="empty-note">No skills added yet.</span>';
  state.skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `${escapeHTML(skill)} <button aria-label="Remove ${escapeHTML(skill)}">✕</button>`;
    chip
      .querySelector("button")
      .addEventListener("click", () => removeSkill(skill));
    els.skillChips.appendChild(chip);
  });
}
function renderSuggestions() {
  els.suggestRow.innerHTML = "";
  const list = ROLE_SKILLS[state.role] || [];
  if (!list.length) {
    els.suggestRow.innerHTML =
      '<span class="empty-note">Choose a target role above to see suggestions.</span>';
    return;
  }
  list.forEach((skill) => {
    const added = state.skills.some(
      (s) => s.toLowerCase() === skill.toLowerCase(),
    );
    const chip = document.createElement("button");
    chip.className = "chip-suggest" + (added ? " added" : "");
    chip.textContent = (added ? "✓ " : "+ ") + skill;
    chip.addEventListener("click", () => addSkill(skill));
    els.suggestRow.appendChild(chip);
  });
}

/* ============================================================
   DYNAMIC LIST RENDERERS
   ============================================================ */
function moveItem(arr, id, dir) {
  const i = arr.findIndex((x) => x.id === id);
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

function renderExperience() {
  const list = els.experienceList;
  list.innerHTML = "";
  if (!state.experience.length)
    list.innerHTML =
      '<p class="empty-note">No experience added yet — click below to add your first role.</p>';
  state.experience.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-card-head">
        <span class="tag">Role ${idx + 1}</span>
        <div class="entry-tools">
          <button data-act="up" title="Move up">↑</button>
          <button data-act="down" title="Move down">↓</button>
          <button data-act="del" class="danger" title="Remove">✕</button>
        </div>
      </div>
      <div class="field-grid">
        <div class="field"><label>Company</label><input data-f="company" value="${escAttr(item.company)}" placeholder="Acme Inc."></div>
        <div class="field"><label>Role</label><input data-f="role" value="${escAttr(item.role)}" placeholder="Software Developer Intern"></div>
        <div class="field"><label>Location</label><input data-f="location" value="${escAttr(item.location)}" placeholder="Remote"></div>
        <div class="field"><label>Start — End</label>
          <div style="display:flex; gap:8px;">
            <input data-f="start" value="${escAttr(item.start)}" placeholder="Jun 2025" style="width:50%;">
            <input data-f="end" value="${escAttr(item.end)}" placeholder="Aug 2025" style="width:50%;" ${item.current ? "disabled" : ""}>
          </div>
        </div>
      </div>
      <div class="checkbox-row"><input type="checkbox" data-f="current" ${item.current ? "checked" : ""}> Currently working here</div>
      <div class="field full"><label>Description (one bullet per line)</label>
        <textarea data-f="description" rows="4" placeholder="Built a REST API that reduced load time by 30%">${escapeHTML(item.description)}</textarea>
      </div>
    `;
    bindEntryCard(card, state.experience, item, idx, renderExperience);
    list.appendChild(card);
  });
}

function renderEducation() {
  const list = els.educationList;
  list.innerHTML = "";
  if (!state.education.length)
    list.innerHTML = '<p class="empty-note">No education added yet.</p>';
  state.education.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-card-head">
        <span class="tag">Entry ${idx + 1}</span>
        <div class="entry-tools">
          <button data-act="up" title="Move up">↑</button>
          <button data-act="down" title="Move down">↓</button>
          <button data-act="del" class="danger" title="Remove">✕</button>
        </div>
      </div>
      <div class="field-grid">
        <div class="field"><label>School</label><input data-f="school" value="${escAttr(item.school)}" placeholder="University name"></div>
        <div class="field"><label>Degree</label><input data-f="degree" value="${escAttr(item.degree)}" placeholder="BSc Computer Science"></div>
        <div class="field"><label>Start — End</label>
          <div style="display:flex; gap:8px;">
            <input data-f="start" value="${escAttr(item.start)}" placeholder="2022" style="width:50%;">
            <input data-f="end" value="${escAttr(item.end)}" placeholder="2026" style="width:50%;">
          </div>
        </div>
        <div class="field"><label>GPA (optional)</label><input data-f="gpa" value="${escAttr(item.gpa)}" placeholder="3.8/4.0"></div>
      </div>
    `;
    bindEntryCard(card, state.education, item, idx, renderEducation);
    list.appendChild(card);
  });
}

function renderProjects() {
  const list = els.projectsList;
  list.innerHTML = "";
  if (!state.projects.length)
    list.innerHTML = '<p class="empty-note">No projects added yet.</p>';
  state.projects.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-card-head">
        <span class="tag">Project ${idx + 1}</span>
        <div class="entry-tools">
          <button data-act="up" title="Move up">↑</button>
          <button data-act="down" title="Move down">↓</button>
          <button data-act="del" class="danger" title="Remove">✕</button>
        </div>
      </div>
      <div class="field-grid">
        <div class="field"><label>Project name</label><input data-f="name" value="${escAttr(item.name)}" placeholder="TrustNet"></div>
        <div class="field"><label>Tech used</label><input data-f="tech" value="${escAttr(item.tech)}" placeholder="React, Node.js, PostgreSQL"></div>
        <div class="field full"><label>Link (optional)</label><input data-f="link" value="${escAttr(item.link)}" placeholder="github.com/you/project"></div>
        <div class="field full"><label>Description (one bullet per line)</label>
          <textarea data-f="description" rows="3" placeholder="Designed a verification workflow used by 3 pilot teams">${escapeHTML(item.description)}</textarea>
        </div>
      </div>
    `;
    bindEntryCard(card, state.projects, item, idx, renderProjects);
    list.appendChild(card);
  });
}

function renderCertifications() {
  const list = els.certificationsList;
  list.innerHTML = "";
  if (!state.certifications.length)
    list.innerHTML = '<p class="empty-note">No certifications added yet.</p>';
  state.certifications.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-card-head">
        <span class="tag">Cert ${idx + 1}</span>
        <div class="entry-tools">
          <button data-act="up" title="Move up">↑</button>
          <button data-act="down" title="Move down">↓</button>
          <button data-act="del" class="danger" title="Remove">✕</button>
        </div>
      </div>
      <div class="field-grid">
        <div class="field"><label>Name</label><input data-f="name" value="${escAttr(item.name)}" placeholder="AWS Certified Cloud Practitioner"></div>
        <div class="field"><label>Issuer</label><input data-f="issuer" value="${escAttr(item.issuer)}" placeholder="Amazon Web Services"></div>
        <div class="field full"><label>Date</label><input data-f="date" value="${escAttr(item.date)}" placeholder="2025"></div>
      </div>
    `;
    bindEntryCard(card, state.certifications, item, idx, renderCertifications);
    list.appendChild(card);
  });
}

function bindEntryCard(card, arr, item, idx, rerender) {
  card.querySelectorAll("[data-f]").forEach((input) => {
    const field = input.dataset.f;
    const evt =
      input.tagName === "SELECT" || input.type === "checkbox"
        ? "change"
        : "input";
    input.addEventListener(evt, () => {
      if (input.type === "checkbox") {
        item[field] = input.checked;
        if (field === "current" && input.checked) {
          item.end = "";
          const endInput = card.querySelector('[data-f="end"]');
          if (endInput) {
            endInput.value = "";
            endInput.disabled = true;
          }
        } else if (field === "current" && !input.checked) {
          const endInput = card.querySelector('[data-f="end"]');
          if (endInput) endInput.disabled = false;
        }
      } else {
        item[field] = input.value;
      }
      saveState();
      renderPreview();
      refreshScores();
    });
  });
  card.querySelector('[data-act="del"]').addEventListener("click", () => {
    const i = arr.findIndex((x) => x.id === item.id);
    arr.splice(i, 1);
    saveState();
    rerender();
    renderPreview();
    refreshScores();
  });
  card.querySelector('[data-act="up"]').addEventListener("click", () => {
    moveItem(arr, item.id, -1);
    saveState();
    rerender();
    renderPreview();
  });
  card.querySelector('[data-act="down"]').addEventListener("click", () => {
    moveItem(arr, item.id, 1);
    saveState();
    rerender();
    renderPreview();
  });
}

/* ============================================================
   PREVIEW RENDER
   ============================================================ */
function bulletList(desc) {
  const lines = (desc || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return "";
  return (
    "<ul>" + lines.map((l) => `<li>${escapeHTML(l)}</li>`).join("") + "</ul>"
  );
}

function renderPreview() {
  const p = state.personal;
  const contactParts = [
    p.email,
    p.phone,
    p.location,
    p.linkedin,
    p.github,
  ].filter(Boolean);

  let html = `
    <div class="r-header">
      <div class="r-name">${p.name ? escapeHTML(p.name) : '<span class="r-placeholder">Your Name</span>'}</div>
      <div class="r-role">${p.title ? escapeHTML(p.title) : "Your professional title"}</div>
      <div class="r-contact">${contactParts.length ? contactParts.map(escapeHTML).join(" · ") : "email · phone · location"}</div>
    </div>
    <div class="r-body">
  `;

  if (state.summary) {
    html += `<div class="r-sec"><div class="r-sec-title">Summary</div><div>${escapeHTML(state.summary)}</div></div>`;
  }

  if (state.experience.length) {
    html += `<div class="r-sec"><div class="r-sec-title">Experience</div>`;
    state.experience.forEach((e) => {
      const dates = e.current
        ? `${e.start || ""} — Present`
        : [e.start, e.end].filter(Boolean).join(" — ");
      html += `<div class="r-item">
        <div class="r-item-top"><span>${escapeHTML(e.role || "Role")}${e.company ? " · " + escapeHTML(e.company) : ""}</span><span>${escapeHTML(dates)}</span></div>
        <div class="r-item-sub">${escapeHTML(e.location || "")}</div>
        ${bulletList(e.description)}
      </div>`;
    });
    html += `</div>`;
  }

  if (state.education.length) {
    html += `<div class="r-sec"><div class="r-sec-title">Education</div>`;
    state.education.forEach((ed) => {
      const dates = [ed.start, ed.end].filter(Boolean).join(" — ");
      html += `<div class="r-item">
        <div class="r-item-top"><span>${escapeHTML(ed.degree || "Degree")}</span><span>${escapeHTML(dates)}</span></div>
        <div class="r-item-sub">${escapeHTML(ed.school || "")}${ed.gpa ? " · GPA " + escapeHTML(ed.gpa) : ""}</div>
      </div>`;
    });
    html += `</div>`;
  }

  if (state.skills.length) {
    html += `<div class="r-sec"><div class="r-sec-title">Skills</div><div class="r-skills">`;
    if (state.template === "modern") {
      html += state.skills
        .map((s) => `<span class="r-skill">${escapeHTML(s)}</span>`)
        .join("");
    } else {
      html += escapeHTML(state.skills.join("  ·  "));
    }
    html += `</div></div>`;
  }

  if (state.projects.length) {
    html += `<div class="r-sec"><div class="r-sec-title">Projects</div>`;
    state.projects.forEach((pr) => {
      html += `<div class="r-item">
        <div class="r-item-top"><span>${escapeHTML(pr.name || "Project")}</span><span>${escapeHTML(pr.tech || "")}</span></div>
        ${bulletList(pr.description)}
      </div>`;
    });
    html += `</div>`;
  }

  if (state.certifications.length) {
    html += `<div class="r-sec"><div class="r-sec-title">Certifications</div>`;
    state.certifications.forEach((c) => {
      html += `<div class="r-item">
        <div class="r-item-top"><span>${escapeHTML(c.name || "Certification")}</span><span>${escapeHTML(c.date || "")}</span></div>
        <div class="r-item-sub">${escapeHTML(c.issuer || "")}</div>
      </div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  els.paper.innerHTML = html;

  $$(".rail-item").forEach((btn) => {
    const sec = btn.dataset.section;
    let filled = false;
    if (sec === "personal") filled = !!(p.name && p.email);
    if (sec === "summary") filled = !!state.summary;
    if (sec === "experience") filled = state.experience.length > 0;
    if (sec === "education") filled = state.education.length > 0;
    if (sec === "skills") filled = state.skills.length > 0;
    if (sec === "projects") filled = state.projects.length > 0;
    if (sec === "certifications") filled = state.certifications.length > 0;
    btn.classList.toggle("filled", filled);
  });
}

/* ============================================================
   SCORING — strength meter + analyzer
   ============================================================ */
function computeScore() {
  const p = state.personal;
  let score = 0;
  const checklist = [];

  const hasContact = !!(p.email && p.phone);
  if (hasContact) {
    score += 20;
    checklist.push({ label: "Contact information", ok: true });
  } else
    checklist.push({
      label: "Add contact information (email & phone)",
      ok: false,
    });

  if (state.summary) {
    score += 10;
    checklist.push({ label: "Professional summary", ok: true });
  } else checklist.push({ label: "Add a professional summary", ok: false });

  if (state.education.length) {
    score += 10;
    checklist.push({ label: "Education", ok: true });
  } else checklist.push({ label: "Add education", ok: false });

  if (state.skills.length) {
    score += 15;
    checklist.push({ label: "Skills", ok: true });
  } else checklist.push({ label: "Add skills", ok: false });

  if (state.projects.length) {
    score += 15;
    checklist.push({ label: "Projects", ok: true });
  } else checklist.push({ label: "Add projects", ok: false });

  if (state.experience.length) {
    score += 15;
    checklist.push({ label: "Work experience", ok: true });
  } else checklist.push({ label: "Add work experience", ok: false });

  if (p.linkedin) {
    score += 5;
    checklist.push({ label: "LinkedIn profile", ok: true });
  } else checklist.push({ label: "Add your LinkedIn profile", ok: false });

  if (p.github) {
    score += 5;
    checklist.push({ label: "GitHub profile", ok: true });
  } else checklist.push({ label: "Add your GitHub profile", ok: false });

  score = Math.min(100, score);
  return { score, checklist };
}

function wordCount(str) {
  return (str || "").trim().split(/\s+/).filter(Boolean).length;
}

function computeAnalysis() {
  const { score: completeness } = computeScore();

  let contentPts = 0,
    contentMax = 4;
  if (wordCount(state.summary) >= 15) contentPts++;
  const expDescs = state.experience.map((e) => e.description).filter(Boolean);
  if (expDescs.length && expDescs.every((d) => wordCount(d) >= 8)) contentPts++;
  const projDescs = state.projects.map((p) => p.description).filter(Boolean);
  if (projDescs.length && projDescs.every((d) => wordCount(d) >= 8))
    contentPts++;
  const hasMetrics = expDescs.some((d) => /\d/.test(d));
  if (hasMetrics) contentPts++;
  const content = Math.round((contentPts / contentMax) * 100);

  let fmtChecks = [];
  state.experience.forEach((e) => {
    fmtChecks.push(!!(e.company && e.role && e.start));
  });
  state.education.forEach((ed) => {
    fmtChecks.push(!!(ed.school && ed.degree));
  });
  state.projects.forEach((pr) => {
    fmtChecks.push(!!(pr.name && pr.description));
  });
  const fmtOk = fmtChecks.length
    ? fmtChecks.filter(Boolean).length / fmtChecks.length
    : 0.5;
  const formatting = Math.round(fmtOk * 100);

  const skillsScore = Math.round(Math.min(100, state.skills.length * 14));

  const overall = Math.round(
    completeness * 0.4 + content * 0.25 + formatting * 0.2 + skillsScore * 0.15,
  );

  const suggestions = [];
  if (state.personal.email && state.personal.phone)
    suggestions.push({
      ok: true,
      text: "Your contact information is complete.",
    });
  else
    suggestions.push({
      ok: false,
      text: "Add both an email and phone number so recruiters can reach you.",
    });

  if (!state.summary)
    suggestions.push({
      ok: false,
      text: "Add a professional summary to introduce yourself.",
    });
  else if (wordCount(state.summary) < 15)
    suggestions.push({
      ok: false,
      text: "Your summary is quite short — aim for 2–3 full sentences.",
    });

  if (!state.experience.length)
    suggestions.push({
      ok: false,
      text: "Add work experience to strengthen your resume.",
    });
  else if (!hasMetrics)
    suggestions.push({
      ok: false,
      text: "Add measurable results to your experience descriptions.",
    });

  if (state.projects.length && projDescs.some((d) => wordCount(d) < 8))
    suggestions.push({
      ok: false,
      text: "Your project descriptions are short — add more detail.",
    });

  if (state.skills.length >= 5)
    suggestions.push({
      ok: true,
      text: "Your skills section is well structured.",
    });
  else
    suggestions.push({
      ok: false,
      text: "Add more skills relevant to your target role.",
    });

  if (!state.personal.linkedin)
    suggestions.push({ ok: false, text: "Add your LinkedIn profile." });
  if (!state.personal.github)
    suggestions.push({ ok: false, text: "Add your GitHub profile." });
  if (state.education.length)
    suggestions.push({ ok: true, text: "Education section looks complete." });

  return {
    overall,
    content,
    formatting,
    completeness,
    skillsScore,
    suggestions,
  };
}

function scoreColorVar(score) {
  return score < 50
    ? "var(--accent-red)"
    : score < 80
      ? "var(--accent-yellow)"
      : "var(--accent-cyan)";
}

function refreshScores() {
  const { score, checklist } = computeScore();

  els.meterFill.style.width = score + "%";
  els.meterPct.textContent = score + "%";
  els.meterFill.style.background = scoreColorVar(score);

  els.meterChecks.innerHTML = "";
  checklist.forEach((c) => {
    const row = document.createElement("div");
    row.className = "meter-check " + (c.ok ? "ok" : "warn");
    row.innerHTML = `<span class="mark">${c.ok ? "✓" : "⚠"}</span><span>${escapeHTML(c.label)}</span>`;
    els.meterChecks.appendChild(row);
  });

  els.stamp.textContent = score + "%";
  els.stamp.style.color = scoreColorVar(score);
  els.stamp.style.borderColor = scoreColorVar(score);

  const a = computeAnalysis();
  $("#ringNum").textContent = a.overall + "%";
  $("#ringNumWrap").style.borderColor = scoreColorVar(a.overall);

  setSub("scContent", a.content);
  setSub("scFormat", a.formatting);
  setSub("scComplete", a.completeness);
  setSub("scSkills", a.skillsScore);

  $("#suggestList").innerHTML = "";
  a.suggestions.forEach((s) => {
    const row = document.createElement("div");
    row.className = "suggest-item " + (s.ok ? "ok" : "warn");
    row.innerHTML = `<span class="mark">${s.ok ? "✓" : "⚠"}</span><span>${escapeHTML(s.text)}</span>`;
    $("#suggestList").appendChild(row);
  });
}

function setSub(prefix, val) {
  $("#" + prefix).style.width = val + "%";
  $("#" + prefix + "N").textContent = val + "%";
}

/* ============================================================
   UTIL
   ============================================================ */
function escapeHTML(str) {
  return (str || "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
}
function escAttr(str) {
  return escapeHTML(str).replace(/"/g, "&quot;");
}

/* ============================================================
   GO
   ============================================================ */
init();
