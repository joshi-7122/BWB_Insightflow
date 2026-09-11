# InsightFlow — AI Business Analytics SaaS

InsightFlow is an intelligent data analysis SaaS MVP built with React, Vite, TypeScript, Tailwind CSS, Supabase, and Google Gemini API. It transforms messy business datasets (CSVs, Excel files) and dashboard screenshots into structured executive reports, KPI metrics, anomaly alerts, dynamic chart visualizations, and interactive AI Q&A follow-ups.

---

## 🚀 Key Features

- **Truthful & Deterministic Analytics Engine**: Every KPI card, record count, and analytical metric is calculated directly from persisted dataset records with zero fabricated data.
- **Stitch Design System Integration ("Luminous Clarity")**: Fully aligned with the Stitch design system (`projects/18205870786574720178`), featuring:
  - **Light/Dark Mode Theme Toggle**: Switch seamlessly between **Luminous Light** (`#f8f9ff` canvas, `#ffffff` surface, `#0b1c30` typography) and **Graphite Dark** (`#080b11`).
  - **Space Grotesk Technical Monospace**: Monospace typography (`font-mono-label`) for raw dataset headers, file names, record counts, and anomaly metrics.
  - **Stitch Dropzone & Quick Actions**: Dotted indigo border, `indigo-soft` fill, and actions for **Browse Files**, **Paste Text**, and **Connect DB**.
  - **Stitch Anomaly Callouts**: Left-accented 4px amber border (`border-l-amber-500 bg-amber-500/5`) callouts for data outliers.
- **⌘K / Ctrl+K Command Palette**: Fast keyboard-navigable search across reports, actions, and navigation items.
- **Staggered Motion & 60fps Count-Up Stats**: Staggered page load entrance animations and animated count-up KPI statistics (`useCountUp`).
- **SaaS Product Usage Indicator**: Account popover displaying actual analyses used against plan tier limits.
- **Multimodal File Analysis**: Supports CSVs, Excel files (`.xlsx`), images (`.png`, `.jpg`, `.webp`), and structured dataset outputs.
- **Conversational Follow-Up Chat**: Contextual AI Q&A drawer for interrogating dataset records and generating live chart visualizations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts
- **Backend & Persistence**: Supabase (Database, Auth, Row-Level Security, Edge Functions)
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`, `gemini-2.0-flash`)

---

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/joshi-7122/BWB_Insightflow.git
   cd BWB_Insightflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (`.env`):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License

MIT License. Developed for InsightFlow Business Intelligence & Analytics.
