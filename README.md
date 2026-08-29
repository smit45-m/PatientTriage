# PatientTriage.ai 🏥
> **AI-Powered Emergency Department Clinical Decision Support System**  
> Built for Accenture Innovation Challenge 2026 — Problem Statement 2 (PatientTriage.ai)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg?logo=next.js)](https://nextjs.org/)
[![JWT Auth](https://img.shields.io/badge/Security-JWT%20(HS256)-red.svg)](https://jwt.io/)
[![LangGraph](https://img.shields.io/badge/Multi--Agent-LangGraph-purple.svg)](https://langchain-ai.github.io/langgraph/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Executive Summary

**PatientTriage.ai** is an end-to-end clinical decision support platform designed to assist emergency department clinicians in assigning Emergency Severity Index (ESI 1–5) triage levels rapidly, safely, and accurately.

### 🌟 Key Clinical Performance Highlights (1,200 Patient Cohort)
- **5-Class AUROC**: `0.8993`
- **Binary Critical AUROC (ESI 1-2 vs 3-5)**: `0.9884`
- **ESI-1 Recall Rate**: `100.0%` (Zero missed critical life threats)
- **Under-Triage Rate**: `0.2%` (vs. 5.9% for raw generative LLMs)
- **Average Decision Latency**: `208ms`
- **Deterministic Explainability**: 0% hallucination rate with exact physiological calculations.

---

## 🔐 JWT Authentication & Quick Demo Clinicians

The platform features an enterprise-grade RFC 7519 **JWT Authentication System** with password salting via PBKDF2-HMAC-SHA256 and pre-seeded demo clinicians for 1-click evaluator test login:

| Clinician | Email | Password | Role / Badge |
| :--- | :--- | :--- | :--- |
| **Dr. Rohit Sharma, MD** | `rohit.sharma@metro.health` | `Emergency123!` | Lead Emergency Physician (*Senior Attending*) |
| **RN-Sarah Jenkins** | `sarah.jenkins@metro.health` | `Nurse123!` | Triage Charge Nurse (*Triage Lead*) |
| **Dr. Priya Nair, MD, FACS** | `priya.nair@apollo.health` | `Chief123!` | Chief of Emergency Medicine (*Clinical Lead*) |
| **Dr. Ananya Patel, MD** | `ananya.patel@aiims.health` | `Fellow123!` | Emergency AI Fellow (*AI Research*) |
| **Clinical Administrator** | `admin@patienttriage.ai` | `Admin123!` | CMIO (*System Governance*) |

---

## 🏗️ 5-Stage Multi-Agent Architecture

```
[Patient Intake & Vital Signs]
               │
               ▼
┌──────────────────────────────┐
│   1. Intake & Scoring Node   │ ➔ Age-stratified thresholds, Shock Index, MEWS, MAP
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   2. ML & NLP Fusion Node    │ ➔ XGBoost (13 tabular features) + 5-tier Clinical NLP
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   3. Safety Governance Node  │ ➔ 18 Hard-Coded Red-Flag Rules + Asymmetric Loss Penalty
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   4. RAG Explainer Node      │ ➔ ESI Handbook v4 & AHA Protocol-Grounded Clinical Rationale
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   5. Decision Cockpit Node   │ ➔ Department Routing, SHAP Feature Importance, Audit Log
└──────────────────────────────┘
```

---

## 🖥️ Platform Modules & Routes

1. **Dashboard Overview (`/`)**: High-level clinical performance metrics, 3 objective pillars (01 Cleaned, 02 Restructured, 03 Created), 5-stage timeline visualizer, real-world patient care scenarios, and emergency infrastructure showcase.
2. **Clinician Sign In (`/login`)**: High-fidelity 2-column authentication portal with live ECG waveform, 1-click demo login, and JWT credential validation.
3. **Triage Cockpit (`/triage`)**: Real-time queue selection, live multi-agent execution, ESI gauge, red-flag override cards, and 1-click **Confirm & Route**.
4. **AI Pipeline Inspector (`/pipeline`)**: Interactive LangGraph StateGraph visualizer with code inspection for all 5 compiled agents.
5. **Waiting Room Monitor (`/monitor`)**: Live queue with ESI wait-time threshold bars, deterioration breach alerts, and mass casualty surge mode toggle.
6. **Governance Audit Trail (`/audit`)**: Immutable clinical decision logs, physician override justifications, AI-clinician agreement rate metrics, and JSON export.
7. **Clinical Benchmarks (`/analytics`)**: SOTA comparison table, 5-class confusion matrix, and RAG vs generic LLM hallucination analysis on 1,200 Indian patients.

---

## 💻 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Authentication**: PyJWT (RFC 7519 `HS256`), PBKDF2-HMAC-SHA256 password hashing
- **ML / Scoring**: XGBoost, Scikit-Learn, NumPy, Pandas
- **Multi-Agent Orchestration**: LangGraph StateGraph pipeline
- **Safety Engine**: 18 clinical override rules + Asymmetric Loss Adjuster (20x under-triage penalty)
- **Monitoring & Audit**: Real-time Waiting Room queue monitor & persistent audit logger

### Frontend
- **Framework**: Next.js 14 App Router, React, Strict TypeScript
- **UI & Styling**: Tailwind CSS, Framer Motion, Lucide Icons, Clean Light Medical Theme with Royal Purple accents
- **State & Auth**: React Context API (`AuthContext`), persistent `localStorage` session handling

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
Access the web dashboard at: `http://localhost:3000`  
Login Portal at: `http://localhost:3000/login`

---

## 🛡️ Clinical Safety & Governance
- **18 Hard-Coded Safety Rules**: Overrides machine predictions automatically for life-threatening presentations (critical hypotension, severe hypoxemia, extreme tachycardia, acute stroke symptoms, traumatic hemorrhage, etc.).
- **Asymmetric Loss Function**: Penalizes dangerous under-triage 20x higher than safe over-triage.
- **Clinician Override & Audit Log**: Every recommendation can be manually overridden with mandatory rationale logging for HIPAA and Digital Personal Data Act compliance.

---

## 📄 License
MIT License — Accenture Innovation Challenge 2026.
