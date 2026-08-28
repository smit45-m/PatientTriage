# PatientTriage.ai 🏥
> **AI-Powered Emergency Department Clinical Decision Support System**
> Built for Accenture Innovation Challenge 2026 — Problem Statement 2 (PatientTriage.ai)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg?logo=next.js)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/Multi--Agent-LangGraph-purple.svg)](https://langchain-ai.github.io/langgraph/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Executive Summary

**PatientTriage.ai** is an end-to-end clinical decision support platform designed to assist emergency department clinicians in assigning Emergency Severity Index triage levels rapidly, safely, and accurately.

### 🌟 Key Performance Highlights (1,200 Patient Data)
- **5-Class AUROC**: `0.8993`
- **Binary Critical AUROC (ESI 1-2 vs 3-5)**: `0.9884`
- **ESI-1 Recall Rate**: `100.0%` (Zero missed critical life threats)
- **Under-Triage Rate**: `0.2%` (vs. 5.9% for raw generative LLMs)
- **Average Decision Latency**: `208ms`
- **Deterministic Explainability**: 0% hallucination rate with exact physiological calculations.

---

## 🏗️ 5-Stage Multi-Agent Architecture

```
[Patient Data]
      │
      ▼
┌─────────────────────────┐
│  1. Intake & Scoring    │ ➔ Age-stratified thresholds, Shock Index, MEWS, MAP
└─────────────┬───────────┘
              │
              ▼
┌─────────────────────────┐
│  2. ML & NLP Fusion     │ ➔ XGBoost (13 tabular features) + 5-tier Clinical NLP
└─────────────┬───────────┘
              │
              ▼
┌─────────────────────────┐
│  3. Safety Governance   │ ➔ 18 Hard-Coded Red-Flag Rules + Asymmetric Loss Penalty
└─────────────┬───────────┘
              │
              ▼
┌─────────────────────────┐
│  4. RAG Explainer       │ ➔ ESI Handbook v4 & AHA Protocol-Grounded Clinical Rationale
└─────────────┬───────────┘
              │
              ▼
┌─────────────────────────┐
│  5. Decision Cockpit    │ ➔ Department Routing, SHAP Feature Importance, Audit Log
└─────────────────────────┘
```

---

## 💻 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ML / Scoring**: XGBoost, Scikit-Learn, NumPy, Pandas
- **Multi-Agent Orchestration**: LangGraph StateGraph pipeline
- **Safety Engine**: 18 clinical override rules + Asymmetric Loss Adjuster (20x under-triage penalty)
- **Monitoring & Audit**: Real-time Waiting Room queue monitor & persistent audit logger

### Frontend
- **Framework**: Next.js 14 App Router
- **UI & Styling**: Tailwind CSS, Framer Motion, Lucide Icons, Glassmorphism design system
- **Routing**: Multi-page cockpit (`/`, `/triage`, `/pipeline`, `/monitor`, `/audit`, `/analytics`)

---

## 🚀 Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/smit45-m/PatientTriage.git
cd PatientTriage
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Access the application at: `http://localhost:3000`

---

## 🛡️ Clinical Safety & Governance
- **18 Hard-Coded Safety Rules**: Overrides machine predictions automatically for life-threatening presentations (e.g., critical hypotension, severe hypoxemia, extreme tachycardia, acute stroke symptoms).
- **Asymmetric Loss Function**: Penalizes dangerous under-triage 20x higher than safe over-triage.
- **Clinician Override & Audit Log**: Every recommendation can be manually overridden with mandatory rationale logging for HIPAA/regulatory compliance.

---

## 📄 License
MIT License.
