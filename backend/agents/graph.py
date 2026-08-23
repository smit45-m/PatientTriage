"""PatientTriage.ai — LangGraph Multi-Agent Orchestration Workflow

Orchestrates 5 specialized clinical AI agents using LangGraph StateGraph:
1. IntakeAgent: Vitals validation, derived score calculation (Shock Index, MEWS, MAP)
2. MLAgent: Dual-stream tabular XGBoost + Clinical NLP late fusion
3. SafetyAgent: 5-layer safety governance, 18 red-flag rules, confidence gating
4. RAGAgent: Guideline-grounded clinical explainer (ESI v4, AHA, ASA, Sepsis) + LLM synthesis
5. CockpitAgent: Routing determination, action item assembly, and immutable audit logging
"""
from typing import TypedDict, Dict, Any, List, Optional
from langgraph.graph import StateGraph, START, END

from agents.intake_agent import intake_agent
from agents.ml_agent import ml_agent
from agents.safety_agent import safety_agent
from agents.rag_agent import rag_agent
from agents.cockpit_agent import cockpit_agent


class TriageState(TypedDict, total=False):
    patient: Dict[str, Any]
    age_group: str
    derived_scores: Dict[str, Any]
    vital_flags: List[str]
    missing_data: List[str]
    thresholds: Dict[str, Any]
    ml_score: Dict[str, Any]
    nlp_extraction: Dict[str, Any]
    fused_prediction: Dict[str, Any]
    safety_overrides: List[Dict[str, Any]]
    confidence_flag: str
    confidence_result: Dict[str, Any]
    action_type: str
    adjusted_prediction: Dict[str, Any]
    rag_rationale: str
    retrieved_guidelines: Dict[str, Any]
    recommendations: List[str]
    final_esi: int
    final_confidence: float
    shap_values: Dict[str, float]
    routing: str
    audit_entry: Dict[str, Any]


def node_intake(state: TriageState) -> Dict[str, Any]:
    return intake_agent(state)


def node_ml_nlp(state: TriageState) -> Dict[str, Any]:
    return ml_agent(state)


def node_safety(state: TriageState) -> Dict[str, Any]:
    return safety_agent(state)


def node_rag(state: TriageState) -> Dict[str, Any]:
    return rag_agent(state)


def node_cockpit(state: TriageState) -> Dict[str, Any]:
    return cockpit_agent(state)


# Build and compile LangGraph StateGraph
builder = StateGraph(TriageState)

builder.add_node("intake_agent", node_intake)
builder.add_node("ml_nlp_agent", node_ml_nlp)
builder.add_node("safety_agent", node_safety)
builder.add_node("rag_agent", node_rag)
builder.add_node("cockpit_agent", node_cockpit)

# Graph execution flow
builder.add_edge(START, "intake_agent")
builder.add_edge("intake_agent", "ml_nlp_agent")
builder.add_edge("ml_nlp_agent", "safety_agent")
builder.add_edge("safety_agent", "rag_agent")
builder.add_edge("rag_agent", "cockpit_agent")
builder.add_edge("cockpit_agent", END)

# Compile LangGraph app
triage_graph = builder.compile()


def run_triage(patient: dict) -> dict:
    """Runs the full multi-agent triage pipeline via compiled LangGraph workflow."""
    initial_state = {"patient": patient}
    final_state = triage_graph.invoke(initial_state)
    return final_state
