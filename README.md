<<<<<<< HEAD
# BWB_Insightflow
=======
# InsightFlow — AI-Powered Business Analytics SaaS

InsightFlow is an AI-powered business analytics workspace that transforms messy business data (CSV, XLSX) and dashboard screenshots into structured insights, visual analytics, anomaly detection, and conversational analysis.

## Architecture

```text
Browser (React + TypeScript + Tailwind v4 + Recharts)
  │
  ├─► Supabase Auth (Email + Google OAuth)
  ├─► Supabase PostgreSQL (Reports, Files, Messages, RLS)
  ├─► Supabase Storage (File uploads)
  └─► Supabase Edge Functions (analyze-upload & chat-followup)
        └─► Gemini 2.5 Pro Multimodal API
```

## Features

- **Multimodal Data Ingestion**: Drag-and-drop support for `.csv`, `.xlsx`, `.png`, `.jpg`, `.webp` (up to 25MB per file).
- **Strict Analytical JSON Schema**: Gemini converts messy inputs into structured metrics, trends, anomalies, and chart datasets.
- **Executive Summary & KPI Cards**: Auto-calculated period-over-period percentages, trend arrows, and comparison periods.
- **Interactive Visualizations**: Dynamic Recharts rendering for Area, Bar, Line, and Donut charts.
- **Conversational Follow-Up**: Ask natural language questions against the cached report context without re-uploading raw files.
- **Dynamic Chart Updates**: Assistant chat responses return structured chart update instructions.
- **Dark Mode & Responsive**: Premium Apple + Linear + Stripe design language built with Tailwind CSS v4.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MAX_FILE_SIZE_MB=25
VITE_MAX_FILES=5
```

### 3. Local Development
```bash
npm run dev
```

### 4. Supabase Database Migration
Apply the database schema in `supabase/migrations/20260826000000_init.sql` via Supabase Dashboard or CLI:
```bash
supabase db push
```

### 5. Deploy Edge Functions
Deploy Edge Functions to Supabase:
```bash
supabase functions deploy analyze-upload --no-verify-jwt
supabase functions deploy chat-followup --no-verify-jwt
supabase secrets set GEMINI_API_KEY=your_gemini_api_key GEMINI_MODEL=gemini-2.5-pro
```

### 6. Production Deployment (Vercel)
Deploy to Vercel with zero extra config:
```bash
vercel --prod
```
>>>>>>> 186e051 (Initial commit)
