# ResumeCraft

A live, browser-based resume builder — type your details and watch a professional resume update in real time. Switch templates, get skill suggestions for your target role, track a live resume strength score, and export straight to PDF. No frameworks, no backend, no build step.

**[Live Demo]** · Built with plain HTML, CSS & JavaScript

## Overview

Most resume builders either lock features behind an account, or feel clunky to edit. ResumeCraft is a single, fast, fully client-side tool: everything you type is reflected instantly in a live preview, your progress autosaves to your browser, and there's nothing to install or sign up for.

## Features

- **Live preview** — every field you fill updates the resume preview instantly, no "generate" button needed.
- **Three switchable templates** — Modern, Professional, and Minimal. Switch anytime without losing your data.
- **Dynamic sections** — add, remove, and reorder entries for Experience, Education, Projects, and Certifications.
- **Role-based skill suggestions** — pick a target role (Frontend Developer, Backend Developer, Data Scientist, and more) and get one-click relevant skill suggestions, plus the option to add your own.
- **Resume Strength Meter** — a live percentage score with a checklist of what's complete and what's missing (contact info, summary, education, skills, projects, experience, LinkedIn, GitHub).
- **Resume Analyzer** — a detailed breakdown scoring Content, Formatting, Completeness, and Skills, with specific written suggestions for improving the resume.
- **Character-guided summary field** — a live counter (0/300) keeps your professional summary concise.
- **Autosave** — your resume is saved to `localStorage` as you type; closing and reopening the browser keeps your data.
- **Dark / light theme** — toggle instantly, preference is remembered.
- **Print / Export to PDF** — a dedicated print stylesheet produces a clean, properly formatted PDF with no app UI in it.
- **Fully responsive** — a dedicated mobile layout (Sections / Edit / Preview tabs) alongside the three-panel desktop layout.

## Tech stack

- **HTML5** — semantic structure
- **CSS3** — custom properties (CSS variables) for theming, responsive layout, print-specific styles
- **Vanilla JavaScript (ES6+)** — no frameworks, no libraries, no build tools

## Project structure

```
resumecraft/
├── index.html   → page structure and markup
├── style.css    → all styling: layout, themes, templates, responsive & print rules
├── script.js    → application logic: state, rendering, scoring, persistence
└── README.md    → this file
```

All three files are required and must sit in the same folder — `index.html` links to `style.css` and `script.js` directly.

## Getting started

No installation, no dependencies, no build process.

1. Clone or download this repository.
2. Open `index.html` directly in any modern browser — **or**, for the best experience (e.g. with Live Server in VS Code), serve the folder locally:
   ```bash
   git clone https://github.com/<your-username>/resumecraft.git
   cd resumecraft
   # then open index.html in your browser, or use a local server / Live Server extension
   ```
3. Start typing — the resume builds itself as you go.

## How it works

1. **Fill in your details** using the section tabs on the left: Personal Info, Summary, Experience, Education, Skills, Projects, Certifications.
2. **Watch the live preview** update on the right (or in the Preview tab on mobile).
3. **Switch templates** anytime using the tabs above the preview — your data carries over.
4. **Check your Resume Strength score** in the sidebar meter, and open **Analyze Resume** for a deeper breakdown with specific suggestions.
5. **Export to PDF** when you're ready — click Export PDF, and in the print dialog, make sure "Background graphics" is enabled and "Headers and footers" is disabled for the cleanest result.

## Resume Strength scoring

The strength meter is calculated out of 100 points:

| Section                      | Points |
| ---------------------------- | ------ |
| Contact info (email + phone) | 20     |
| Professional summary         | 10     |
| Education                    | 10     |
| Skills                       | 15     |
| Projects                     | 15     |
| Work experience              | 15     |
| LinkedIn profile             | 5      |
| GitHub profile               | 5      |

The Resume Analyzer goes further, scoring **Content** (summary/description depth and measurable results), **Formatting** (how completely each entry is filled in), **Completeness** (the strength score above), and **Skills** (skill count) — then combines them into an overall score with written, specific suggestions.

## Browser support

Works in all modern browsers (Chrome, Edge, Firefox, Safari). PDF export relies on the browser's native print-to-PDF function, so there are no external dependencies — but two print-dialog settings affect output quality:

- **Background graphics** should be enabled, or template background colors won't print.
- **Headers and footers** should be disabled, or the browser will add its own URL/date/title lines to the PDF.

## Data & privacy

All resume data is stored only in your browser's `localStorage`. Nothing is uploaded, transmitted, or stored anywhere else — closing the tab keeps your data locally; clearing your browser data will remove it.

## Roadmap / possible improvements

- Additional templates
- Custom accent colors per template
- Import/export resume data as JSON
- More target roles in the skill-suggestion list
- Multi-page resume support for longer work histories

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

Built as an independent project to explore live-preview UI patterns, client-side state management, and print-accurate CSS — entirely with vanilla HTML, CSS, and JavaScript.
