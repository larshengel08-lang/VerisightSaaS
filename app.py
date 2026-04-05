"""
Verisight — AI-powered Exit Analysis & Retention Intelligence Platform
MVP v1.1 | Survey-Format + Validated Scoring Edition
"""

import re
import json
import os
import time
import csv
import io
from datetime import datetime

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from openai import OpenAI, AuthenticationError, RateLimitError, APIConnectionError

# ─── Configuration ────────────────────────────────────────────────────────────

try:
    OPENAI_API_KEY = st.secrets.get("OPENAI_API_KEY", os.getenv("OPENAI_API_KEY", "sk-placeholder-key"))
except Exception:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-placeholder-key")

# Role-based replacement cost multipliers (SHRM / Josh Bersin Institute)
ROLE_MULTIPLIERS = {
    "Uitvoerend / Operationeel":    0.50,
    "Professioneel / Specialist":   1.00,
    "Senior Professional / Expert": 1.50,
    "Management":                   2.00,
    "Senior Management / Director": 2.50,
    "C-Level / Directie":           3.00,
}

# Empirical weights based on Gallup State of the Workplace 2023
SCAN_WEIGHTS = {
    "management":   2.5,
    "culture":      1.5,
    "growth":       1.5,
    "workload":     1.0,
    "compensation": 1.0,
}

# ─── Survey Definitions ───────────────────────────────────────────────────────

# Gevalideerde BPNS-schaal (Deci & Ryan, 2001) — 3 items per dimensie
# Tuple: (key, stelling, is_reversed)
SDT_ITEMS = {
    "autonomy": [
        ("auto_1", "Ik had voldoende zeggenschap over mijn eigen werkwijze.", False),
        ("auto_2", "Ik kon zelfstandig beslissingen nemen in mijn rol.", False),
        ("auto_3", "Ik ervoer druk om te werken zoals anderen dat wilden.", True),
    ],
    "connection": [
        ("conn_1", "Ik voelde me echt onderdeel van het team.", False),
        ("conn_2", "Collega's gaven oprecht om mijn welzijn.", False),
        ("conn_3", "Ik voelde me een buitenstaander op het werk.", True),
    ],
    "competence": [
        ("comp_1", "Er waren voldoende mogelijkheden om mij te ontwikkelen.", False),
        ("comp_2", "Mijn werk sloot goed aan op mijn capaciteiten.", False),
        ("comp_3", "Ik had regelmatig het gevoel tekort te schieten.", True),
    ],
}

SDT_META = {
    "autonomy":   ("🗽", "Autonomie",   "#4299e1"),
    "connection": ("🤝", "Verbinding",  "#48bb78"),
    "competence": ("🎯", "Competentie", "#ed8936"),
}

ORG_FACTORS = [
    ("org_management",   "👔 Kwaliteit leidinggevende"),
    ("org_culture",      "🌍 Bedrijfscultuur"),
    ("org_growth",       "📈 Groeimogelijkheden"),
    ("org_workload",     "⚖️ Werkdruk & balans"),
    ("org_compensation", "💰 Salaris & arbeidsvoorwaarden"),
    ("org_collab",       "🤝 Samenwerking collega's"),
    ("org_clarity",      "🎯 Duidelijkheid over rol"),
    ("org_pride",        "⭐ Trots op organisatie"),
]

LIKERT_LABELS = {
    1: "1 — Helemaal oneens",
    2: "2 — Oneens",
    3: "3 — Neutraal",
    4: "4 — Eens",
    5: "5 — Helemaal eens",
}

EXIT_CATEGORIES = [
    "Loopbaanstap (extern)",
    "Onvrede over management",
    "Onvrede over bedrijfscultuur",
    "Salaris / arbeidsvoorwaarden",
    "Onvoldoende groeimogelijkheden",
    "Werkdruk / burn-out",
    "Persoonlijke omstandigheden",
    "Pensioen",
    "Ondernemen / ZZP",
    "Anders",
]

STAY_OPTIONS = [
    "Ja, zeker",
    "Waarschijnlijk wel",
    "Misschien",
    "Waarschijnlijk niet",
    "Nee, zeker niet",
]

DEPARTMENTS = [
    "Sales", "Engineering", "Marketing", "HR", "Finance",
    "Operations", "Product", "Customer Success", "Overige",
]


# ─── Core Logic ───────────────────────────────────────────────────────────────

def anonymize_text(text: str) -> str:
    """Strip PII from open text before LLM transmission."""
    text = re.sub(r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b',
                  '[E-MAIL]', text)
    text = re.sub(r'(\+31|0031|06)[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}',
                  '[TELEFOON]', text)
    text = re.sub(r'\b(\+?\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}\b',
                  '[TELEFOON]', text)
    text = re.sub(
        r'\b(de heer|mevrouw|dhr\.|mevr\.)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?\b',
        '[NAAM]', text, flags=re.IGNORECASE,
    )
    return text


def compute_sdt_scores(responses: dict) -> dict:
    """
    Compute SDT sub-scores from Likert-5 items (BPNS-schaal).
    Reverse-coded items are inverted (6 - raw).
    Output scaled 1–10 via linear mapping.
    """
    scores = {}
    for dim, items in SDT_ITEMS.items():
        values = []
        for key, _, is_reversed in items:
            raw = responses.get(key, 3)
            values.append(6 - raw if is_reversed else raw)
        avg = sum(values) / len(values)          # 1.0 – 5.0
        scores[dim] = round((avg - 1) / 4 * 9 + 1, 1)  # → 1.0 – 10.0
    return scores


def compute_org_scores(responses: dict) -> dict:
    """Scale org-factor Likert-5 responses linearly to 1–10."""
    return {
        key: round((responses.get(key, 3) - 1) / 4 * 9 + 1, 1)
        for key, _ in ORG_FACTORS
    }


def compute_preventability(category: str, stay_answer: str, sdt_scores: dict) -> dict:
    """
    Rule-based preventability combining exit category, stated stay-intent
    and SDT context. Returns score + confidence.
    """
    NON_PREVENTABLE = {"Persoonlijke omstandigheden", "Pensioen"}
    MIXED = {"Loopbaanstap (extern)", "Ondernemen / ZZP", "Anders"}

    stay_idx  = STAY_OPTIONS.index(stay_answer) if stay_answer in STAY_OPTIONS else 2
    avg_sdt   = sum(sdt_scores.values()) / 3

    if category in NON_PREVENTABLE:
        return {"score": "Niet-Redbaar", "confidence": 92}

    if category in MIXED:
        if stay_idx <= 1 and avg_sdt < 5.5:
            return {"score": "Redbaar", "confidence": 63}
        return {"score": "Niet-Redbaar", "confidence": 65}

    # All other categories are internal — definitively preventable
    confidence = min(95, 70 + (2 - stay_idx) * 8)
    return {"score": "Redbaar", "confidence": int(confidence)}


def compute_weighted_risk(org_scores: dict) -> tuple:
    """
    Weighted retention risk (0–100%).
    Management carries 2.5× weight per Gallup 2023.
    Workload is inverted: high score = low risk.
    """
    workload_inv = 11 - org_scores.get("org_workload", 5)
    weighted_sum = (
        org_scores.get("org_management",   5) * SCAN_WEIGHTS["management"]   +
        org_scores.get("org_culture",       5) * SCAN_WEIGHTS["culture"]      +
        org_scores.get("org_growth",        5) * SCAN_WEIGHTS["growth"]       +
        workload_inv                            * SCAN_WEIGHTS["workload"]     +
        org_scores.get("org_compensation",  5) * SCAN_WEIGHTS["compensation"]
    )
    total_w = sum(SCAN_WEIGHTS.values())
    risk    = max(0, min(100, int((10 - weighted_sum / total_w) * 10)))
    if risk >= 70:
        return risk, "HOOG",   "red"
    if risk >= 40:
        return risk, "MEDIUM", "orange"
    return risk, "LAAG", "green"


def call_llm_qualitative(text: str, sdt: dict, org: dict, api_key: str) -> dict:
    """
    OpenAI call ONLY for open-text enrichment.
    Includes exponential backoff (max 3 attempts).
    Passes pre-computed scores so LLM enriches — never re-scores.
    """
    client = OpenAI(api_key=api_key)

    low_org = sorted(
        [(label.split(" ", 1)[1], org.get(key, 5)) for key, label in ORG_FACTORS],
        key=lambda x: x[1],
    )[:3]
    low_ctx = ", ".join(f"{l} ({v:.1f}/10)" for l, v in low_org)

    prompt = f"""
Je bent een expert HR-analist. Analyseer UITSLUITEND de onderstaande open tekst.
De gestructureerde survey heeft al deze scores berekend (NIET opnieuw berekenen):
SDT — Autonomie {sdt['autonomy']}/10 | Verbinding {sdt['connection']}/10 | Competentie {sdt['competence']}/10
Laagst scorende factoren: {low_ctx}

Retourneer ALLEEN dit JSON-object:
{{
  "qualitative_summary": "<2 zinnen: kernboodschap van de open tekst>",
  "nuances": ["<nuance 1 die de survey verrijkt of nuanceert>", "<nuance 2>"],
  "recommendations": ["<concrete HR-actie 1>", "<HR-actie 2>", "<HR-actie 3>"],
  "sdt_alignment": "<één zin: bevestigt of nuanceert de tekst de survey-scores?>"
}}

SDT-ankerindicatoren:
Autonomie laag (1-4): micromanagement, geen inspraak, regels blokkeren, controlecultuur
Autonomie hoog (7-10): eigen regie, vertrouwen, zelfstandigheid, eigenaarschap
Verbinding laag (1-4): isolatie, buitengesloten, onveilig, conflicten
Verbinding hoog (7-10): teamspirit, steun, collegialiteit, erbij horen
Competentie laag (1-4): stilstand, onderwaardering, geen uitdaging, falen-gevoel
Competentie hoog (7-10): groei, erkenning, leren, excelleren

Open tekst (geanonimiseerd):
{text}
"""
    for attempt in range(3):
        try:
            resp = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            return json.loads(resp.choices[0].message.content)
        except RateLimitError:
            if attempt < 2:
                time.sleep(2 ** attempt)   # 1 s → 2 s → raise
            else:
                raise


def export_csv(analyses: list) -> str:
    """Serialize all stored analyses to a UTF-8 CSV string."""
    buf = io.StringIO()
    fields = [
        "datum", "id", "afdeling", "functieniveau", "dienstverband",
        "salaris", "replacement_cost", "exit_categorie", "kan_blijven",
        "sdt_autonomie", "sdt_verbinding", "sdt_competentie",
        "org_management", "org_cultuur", "org_groei", "org_werkdruk",
        "org_compensatie", "org_samenwerking", "org_duidelijkheid", "org_trots",
        "preventability", "preventability_confidence", "risicoscore",
    ]
    w = csv.DictWriter(buf, fieldnames=fields, extrasaction="ignore")
    w.writeheader()
    for a in analyses:
        w.writerow({
            "datum":                     a.get("datum", ""),
            "id":                        a.get("id", ""),
            "afdeling":                  a.get("department", ""),
            "functieniveau":             a.get("role_level", ""),
            "dienstverband":             a.get("tenure", ""),
            "salaris":                   a.get("salary", ""),
            "replacement_cost":          a.get("replacement_cost", ""),
            "exit_categorie":            a.get("exit_category", ""),
            "kan_blijven":               a.get("stay_answer", ""),
            "sdt_autonomie":             a.get("sdt", {}).get("autonomy", ""),
            "sdt_verbinding":            a.get("sdt", {}).get("connection", ""),
            "sdt_competentie":           a.get("sdt", {}).get("competence", ""),
            "org_management":            a.get("org", {}).get("org_management", ""),
            "org_cultuur":               a.get("org", {}).get("org_culture", ""),
            "org_groei":                 a.get("org", {}).get("org_growth", ""),
            "org_werkdruk":              a.get("org", {}).get("org_workload", ""),
            "org_compensatie":           a.get("org", {}).get("org_compensation", ""),
            "org_samenwerking":          a.get("org", {}).get("org_collab", ""),
            "org_duidelijkheid":         a.get("org", {}).get("org_clarity", ""),
            "org_trots":                 a.get("org", {}).get("org_pride", ""),
            "preventability":            a.get("preventability", {}).get("score", ""),
            "preventability_confidence": a.get("preventability", {}).get("confidence", ""),
            "risicoscore":               a.get("risk_score", ""),
        })
    return buf.getvalue()


# ─── Streamlit App ────────────────────────────────────────────────────────────

def main():
    st.set_page_config(
        page_title="Verisight",
        page_icon="🫀",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    st.markdown("""
    <style>
    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

    .rp-header {
        background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%);
        padding: 1.8rem 2rem; border-radius: 14px; color: white; margin-bottom: 1.5rem;
    }
    .rp-header h1 { margin: 0; font-size: 2.2rem; }
    .rp-header p  { margin: 0.3rem 0 0; opacity: 0.85; font-size: 1rem; }

    .dim-header {
        font-weight: 700; font-size: 0.9rem; padding: 0.45rem 0.8rem;
        border-radius: 6px; margin-bottom: 0.6rem; color: white; display: inline-block;
    }

    .loss-alert {
        background: #fff5f5; border: 2px solid #fc8181;
        border-radius: 10px; padding: 1.2rem; text-align: center;
    }
    .loss-alert .la-title  { font-size: 0.85rem; color: #c53030; font-weight: 700; margin: 0; }
    .loss-alert .la-amount { font-size: 2rem; font-weight: 900; color: #c53030; margin: 0.3rem 0; }
    .loss-alert .la-label  { font-size: 0.72rem; color: #718096; margin: 0; }

    .risk-box { border-radius: 12px; padding: 1.8rem 1.5rem; text-align: center; }
    .risk-box .rb-score { font-size: 3rem; font-weight: 900; margin: 0.2rem 0; }
    .risk-box .rb-label { font-size: 1.3rem; font-weight: 700; }

    .section-title { font-size: 1.05rem; font-weight: 700; color: #2d3748; margin-bottom: 0.4rem; }

    .prev-box { border-radius: 10px; padding: 1.1rem; }
    </style>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div class="rp-header">
        <h1>🫀 Verisight</h1>
        <p>AI-powered Exit Analyse &amp; Retentie Intelligence Platform voor HR Business Partners</p>
    </div>
    """, unsafe_allow_html=True)

    # ── Sidebar ──────────────────────────────────────────────────────────────
    with st.sidebar:
        st.header("⚙️ Instellingen")
        sidebar_key = st.text_input(
            "OpenAI API Key", type="password", placeholder="sk-...",
            help="Alleen nodig voor kwalitatieve analyse van de open tekst.",
        )
        active_api_key = sidebar_key if sidebar_key else OPENAI_API_KEY
        if not sidebar_key and OPENAI_API_KEY == "sk-placeholder-key":
            st.warning("Geen API key — open tekst analyse niet beschikbaar.", icon="🔑")
        elif active_api_key != "sk-placeholder-key":
            st.success("API key ingesteld.", icon="✅")

        st.divider()
        st.header("💰 Financiële Parameters")
        salary = st.number_input(
            "Jaarlijks Bruto Salaris (€)",
            min_value=0, max_value=500_000, value=65_000, step=1_000, format="%d",
        )
        role_level_sidebar = st.selectbox(
            "Functieniveau", list(ROLE_MULTIPLIERS.keys()), index=2,
            help="Bepaalt de replacement cost multiplier (SHRM/Bersin Institute).",
        )
        mult_side = ROLE_MULTIPLIERS[role_level_sidebar]
        rc_side   = salary * mult_side

        st.markdown(f"""
        <div class="loss-alert">
            <p class="la-title">🔴 LOSS ALERT</p>
            <p class="la-amount">€{rc_side:,.0f}</p>
            <p class="la-label">Salaris × {mult_side}× &nbsp;·&nbsp; {role_level_sidebar}</p>
        </div>
        """, unsafe_allow_html=True)

        st.divider()
        st.caption("Verisight MVP v1.1 | © 2025")

    # ── Session State ────────────────────────────────────────────────────────
    if "analyses"    not in st.session_state: st.session_state.analyses    = []
    if "last_result" not in st.session_state: st.session_state.last_result = None

    # ── Tabs ─────────────────────────────────────────────────────────────────
    tab1, tab2, tab3 = st.tabs(["📋 Exit Survey", "⚡ Quick Retention Scan", "📈 Dashboard"])


    # ═════════════════════════════════════════════════════════════════════════
    # TAB 1 — EXIT SURVEY
    # ═════════════════════════════════════════════════════════════════════════
    with tab1:
        st.subheader("Exit Interview Survey")
        st.caption("Gestructureerde meting op basis van de gevalideerde BPNS-schaal (Deci & Ryan) en organisatiefactoren.")

        with st.form("exit_survey_form"):

            # ── S1: Context ───────────────────────────────────────────────
            st.markdown("#### 📋 Sectie 1 — Vertrekomstandigheden")
            c1, c2, c3 = st.columns(3)
            with c1:
                emp_id     = st.text_input("Medewerker ID", placeholder="bijv. EMP-2025-047")
                department = st.selectbox("Afdeling", DEPARTMENTS)
            with c2:
                tenure        = st.slider("Dienstverband (jaren)", 0.0, 30.0, 2.0, 0.5)
                exit_category = st.selectbox("Voornaamste reden van vertrek", EXIT_CATEGORIES)
            with c3:
                stay_answer = st.selectbox(
                    "Had je hier onder andere omstandigheden kunnen blijven?",
                    STAY_OPTIONS, index=2,
                )

            st.divider()

            # ── S2: SDT (BPNS) ────────────────────────────────────────────
            st.markdown("#### 🧠 Sectie 2 — Zelfdeterminate Basisbehoeften")
            st.caption("Gebaseerd op de gevalideerde BPNS-schaal · 1 = Helemaal oneens · 5 = Helemaal eens")

            sdt_responses = {}
            dim_cols = st.columns(3)
            for col_idx, (dim, items) in enumerate(SDT_ITEMS.items()):
                icon, label, color = SDT_META[dim]
                with dim_cols[col_idx]:
                    st.markdown(
                        f'<div class="dim-header" style="background:{color};">{icon} {label}</div>',
                        unsafe_allow_html=True,
                    )
                    for item_key, item_text, _ in items:
                        sdt_responses[item_key] = st.select_slider(
                            item_text,
                            options=[1, 2, 3, 4, 5],
                            value=3,
                            format_func=lambda x: LIKERT_LABELS[x],
                            key=item_key,
                        )

            st.divider()

            # ── S3: Org Factors ───────────────────────────────────────────
            st.markdown("#### 🏢 Sectie 3 — Organisatiefactoren")
            st.caption("Beoordeel je werkervaring op de volgende factoren · 1 = Helemaal oneens · 5 = Helemaal eens")

            org_responses = {}
            org_cols = st.columns(2)
            for i, (key, label) in enumerate(ORG_FACTORS):
                with org_cols[i % 2]:
                    org_responses[key] = st.select_slider(
                        label,
                        options=[1, 2, 3, 4, 5],
                        value=3,
                        format_func=lambda x: LIKERT_LABELS[x],
                        key=key,
                    )

            st.divider()

            # ── S4: Open Tekst ────────────────────────────────────────────
            st.markdown("#### 💬 Sectie 4 — Toelichting (optioneel)")
            open_text = st.text_area(
                "Is er iets wat je wilt toevoegen of toelichten?",
                height=130,
                placeholder=(
                    "Vrije toelichting — namen en contactgegevens worden automatisch "
                    "geanonimiseerd vóór AI-analyse. Minimaal 30 tekens voor kwalitatieve verrijking."
                ),
            )

            st.divider()

            # ── S5: Toestemming ───────────────────────────────────────────
            st.markdown("#### ✅ Bevestiging & Toestemming")
            consent = st.checkbox(
                "Ik bevestig dat deze exitdata geanonimiseerd wordt verwerkt, "
                "dat de organisatie toestemming heeft van de medewerker, "
                "en dat eventuele open tekst AI-analyse mag ondergaan."
            )

            submitted = st.form_submit_button(
                "🔍 Verwerk Exit Survey",
                type="primary",
                use_container_width=True,
            )

        # ── Verwerking ────────────────────────────────────────────────────
        if submitted:
            if not consent:
                st.error("Bevestig eerst de toestemmingsverklaring (Sectie 5) om door te gaan.")
            else:
                all_resp  = {**sdt_responses, **org_responses}
                sdt_sc    = compute_sdt_scores(all_resp)
                org_sc    = compute_org_scores(all_resp)
                prev_sc   = compute_preventability(exit_category, stay_answer, sdt_sc)
                risk, rl, rc_color = compute_weighted_risk(org_sc)

                mult = ROLE_MULTIPLIERS[role_level_sidebar]
                replacement_cost = salary * mult

                # LLM — only if open text present AND API key valid
                llm_result = None
                if open_text.strip() and len(open_text.strip()) >= 30:
                    if active_api_key and active_api_key != "sk-placeholder-key":
                        with st.spinner("AI analyseert de open toelichting…"):
                            try:
                                llm_result = call_llm_qualitative(
                                    anonymize_text(open_text.strip()),
                                    sdt_sc, org_sc, active_api_key,
                                )
                            except AuthenticationError:
                                st.warning("Ongeldige API key — kwalitatieve analyse overgeslagen.")
                            except RateLimitError:
                                st.warning("OpenAI quota bereikt — kwalitatieve analyse overgeslagen.")
                            except APIConnectionError:
                                st.warning("Geen verbinding met OpenAI — kwalitatieve analyse overgeslagen.")
                            except Exception as e:
                                st.warning(f"LLM analyse niet beschikbaar: {e}")
                    else:
                        st.info("💡 Voeg een OpenAI API key toe in de sidebar voor kwalitatieve analyse van de open tekst.")

                record = {
                    "datum":            datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "id":               emp_id or f"EMP-{len(st.session_state.analyses) + 1:03d}",
                    "department":       department,
                    "role_level":       role_level_sidebar,
                    "tenure":           tenure,
                    "salary":           salary,
                    "replacement_cost": replacement_cost,
                    "exit_category":    exit_category,
                    "stay_answer":      stay_answer,
                    "sdt":              sdt_sc,
                    "org":              org_sc,
                    "preventability":   prev_sc,
                    "risk_score":       risk,
                    "risk_label":       rl,
                    "llm":              llm_result,
                }
                st.session_state.last_result = record
                st.session_state.analyses.append(record)
                st.success("✅ Survey verwerkt en opgeslagen in het dashboard.")

        # ── Resultaten ────────────────────────────────────────────────────
        res = st.session_state.last_result
        if res:
            st.divider()
            st.markdown("### 📊 Analyseresultaten")

            col_hdr, col_btn = st.columns([4, 1])
            with col_hdr:
                st.caption(f"Medewerker: **{res['id']}** · {res['department']} · {res['tenure']} jaar · {res['datum']}")
            with col_btn:
                if st.button("🔄 Nieuwe analyse"):
                    st.session_state.last_result = None
                    st.rerun()

            # KPI strip
            k1, k2, k3, k4, k5 = st.columns(5)
            for col, label, key, threshold in [
                (k1, "🗽 Autonomie",   "autonomy",   5),
                (k2, "🤝 Verbinding",  "connection",  5),
                (k3, "🎯 Competentie", "competence",  5),
            ]:
                v = res["sdt"][key]
                col.metric(label, f"{v}/10",
                           delta="OK" if v >= threshold else "Aandacht",
                           delta_color="normal" if v >= threshold else "inverse")
            k4.metric("⚠️ Retentierisico",  f"{res['risk_score']}%")
            k5.metric("💸 Replacement Cost", f"€{res['replacement_cost']:,.0f}")

            st.divider()

            # Charts row
            col_a, col_b = st.columns(2)

            with col_a:
                st.markdown('<p class="section-title">🧠 SDT Scores</p>', unsafe_allow_html=True)
                sdt_vals = [res["sdt"]["autonomy"], res["sdt"]["connection"], res["sdt"]["competence"]]
                fig_sdt = go.Figure(go.Bar(
                    x=["Autonomie", "Verbinding", "Competentie"],
                    y=sdt_vals,
                    marker_color=["#4299e1", "#48bb78", "#ed8936"],
                    text=[f"{v}/10" for v in sdt_vals],
                    textposition="outside",
                ))
                fig_sdt.add_hline(y=5, line_dash="dash", line_color="#718096",
                                  annotation_text="Drempelwaarde (5)")
                fig_sdt.update_layout(yaxis=dict(range=[0, 11]), height=290,
                                      showlegend=False, margin=dict(t=30, b=10))
                st.plotly_chart(fig_sdt, width="stretch")

            with col_b:
                st.markdown('<p class="section-title">🏢 Organisatiefactoren</p>', unsafe_allow_html=True)
                org_labels = [lbl.split(" ", 1)[1] for _, lbl in ORG_FACTORS]
                org_vals   = [res["org"].get(k, 5) for k, _ in ORG_FACTORS]
                fig_org = go.Figure(go.Scatterpolar(
                    r=org_vals + [org_vals[0]],
                    theta=org_labels + [org_labels[0]],
                    fill="toself",
                    fillcolor="rgba(66,153,225,0.18)",
                    line=dict(color="#4299e1", width=2),
                ))
                fig_org.update_layout(
                    polar=dict(radialaxis=dict(visible=True, range=[0, 10])),
                    height=290, showlegend=False, margin=dict(t=30, b=10),
                )
                st.plotly_chart(fig_org, width="stretch")

            st.divider()

            # Bottom row: lowest factors · preventability · financial
            col_c, col_d, col_e = st.columns(3)

            with col_c:
                st.markdown('<p class="section-title">📉 Laagst Scorende Factoren</p>',
                            unsafe_allow_html=True)
                sorted_org = sorted(
                    [(lbl.split(" ", 1)[1], res["org"].get(k, 5)) for k, lbl in ORG_FACTORS],
                    key=lambda x: x[1],
                )[:3]
                fig_low = go.Figure(go.Bar(
                    x=[v for _, v in sorted_org],
                    y=[l for l, _ in sorted_org],
                    orientation="h",
                    marker_color=["#e53e3e", "#ed8936", "#ecc94b"],
                    text=[f"{v:.1f}" for _, v in sorted_org],
                    textposition="outside",
                ))
                fig_low.update_layout(xaxis=dict(range=[0, 11]), height=210,
                                      showlegend=False, margin=dict(t=10, b=10, l=150))
                st.plotly_chart(fig_low, width="stretch")

            with col_d:
                st.markdown('<p class="section-title">🎯 Preventability</p>',
                            unsafe_allow_html=True)
                p       = res["preventability"]
                is_red  = p["score"] == "Redbaar"
                p_icon  = "🔴" if is_red else "⚪"
                p_col   = "#c53030" if is_red else "#4a5568"
                p_bg    = "#fff5f5" if is_red else "#f7fafc"
                p_bdr   = "#fc8181" if is_red else "#cbd5e0"
                st.markdown(f"""
                <div style="background:{p_bg};border:2px solid {p_bdr};
                            border-radius:10px;padding:1.1rem;height:190px;">
                    <p style="color:{p_col};font-weight:700;font-size:1.1rem;margin:0;">
                        {p_icon} {p['score']}
                    </p>
                    <p style="color:#4a5568;font-size:0.82rem;margin:0.4rem 0 0;">
                        Zekerheid: <strong>{p['confidence']}%</strong><br><br>
                        Categorie: <em>{res['exit_category']}</em><br>
                        Kan blijven: <em>{res['stay_answer']}</em>
                    </p>
                </div>
                """, unsafe_allow_html=True)

            with col_e:
                st.markdown('<p class="section-title">💸 Financiële Impact</p>',
                            unsafe_allow_html=True)
                mult_res = ROLE_MULTIPLIERS[res["role_level"]]
                st.markdown(f"""
                <div class="loss-alert" style="height:190px;">
                    <p class="la-title">🔴 REPLACEMENT COST</p>
                    <p class="la-amount">€{res['replacement_cost']:,.0f}</p>
                    <p class="la-label">
                        €{res['salary']:,} × {mult_res}×<br>
                        {res['role_level']}<br>
                        {res['department']} · {res['tenure']} jaar
                    </p>
                </div>
                """, unsafe_allow_html=True)

            # LLM enrichment block
            if res.get("llm"):
                st.divider()
                st.markdown("### 💬 Kwalitatieve Verrijking — AI-analyse open tekst")
                llm = res["llm"]
                ql, qr = st.columns(2)
                with ql:
                    st.markdown('<p class="section-title">📝 Samenvatting</p>',
                                unsafe_allow_html=True)
                    st.write(llm.get("qualitative_summary", "—"))
                    st.markdown('<p class="section-title">🔗 SDT Alignment</p>',
                                unsafe_allow_html=True)
                    st.info(llm.get("sdt_alignment", "—"))
                    st.markdown('<p class="section-title">🔍 Nuances</p>',
                                unsafe_allow_html=True)
                    for n in llm.get("nuances", []):
                        st.write(f"• {n}")
                with qr:
                    st.markdown('<p class="section-title">✅ HR Aanbevelingen</p>',
                                unsafe_allow_html=True)
                    for i, rec in enumerate(llm.get("recommendations", []), 1):
                        st.write(f"**{i}.** {rec}")


    # ═════════════════════════════════════════════════════════════════════════
    # TAB 2 — QUICK RETENTION SCAN
    # ═════════════════════════════════════════════════════════════════════════
    with tab2:
        st.subheader("Quick Retention Scan")
        st.caption("Snel risicoprofiel voor actieve medewerkers — geen API-call vereist. "
                   "Gewogen op basis van Gallup State of the Workplace 2023.")

        col_sl, col_res = st.columns([1, 1])

        with col_sl:
            st.markdown("**Beoordeel de huidige situatie (1 = Slecht · 10 = Uitstekend)**")
            st.markdown("")

            st.markdown("**👔 Kwaliteit Leidinggevende** `gewicht: 2.5×`")
            sc_mgmt = st.slider("mgmt", 1, 10, 7, key="qs_mgmt",
                                label_visibility="collapsed")

            st.markdown("**🌍 Bedrijfscultuur** `gewicht: 1.5×`")
            sc_cult = st.slider("cult", 1, 10, 7, key="qs_cult",
                                label_visibility="collapsed")

            st.markdown("**📈 Groeimogelijkheden** `gewicht: 1.5×`")
            sc_grow = st.slider("grow", 1, 10, 6, key="qs_grow",
                                label_visibility="collapsed")

            st.markdown("**⚖️ Werkdruk & balans** `gewicht: 1×`")
            sc_work = st.slider("work", 1, 10, 5, key="qs_work",
                                label_visibility="collapsed",
                                help="10 = optimale werkdruk · 1 = extreme overbelasting")

            st.markdown("**💰 Salaris & arbeidsvoorwaarden** `gewicht: 1×`")
            sc_comp = st.slider("comp", 1, 10, 6, key="qs_comp",
                                label_visibility="collapsed")

        with col_res:
            scan_org = {
                "org_management":   sc_mgmt,
                "org_culture":      sc_cult,
                "org_growth":       sc_grow,
                "org_workload":     sc_work,
                "org_compensation": sc_comp,
            }
            risk_s, risk_l, risk_c = compute_weighted_risk(scan_org)
            cm = {"red": ("#fff5f5","#fc8181","#c53030"),
                  "orange": ("#fffaf0","#f6ad55","#c05621"),
                  "green":  ("#f0fff4","#68d391","#276749")}
            bg, bdr, tc = cm[risk_c]

            st.markdown(f"""
            <div class="risk-box" style="background:{bg};border:2px solid {bdr};">
                <p style="color:{tc};font-size:0.9rem;margin:0;">RETENTIE RISICONIVEAU</p>
                <p class="rb-score" style="color:{tc};">{risk_s}%</p>
                <p class="rb-label" style="color:{tc};">RISICO: {risk_l}</p>
                <p style="color:{tc};font-size:0.72rem;margin:0.4rem 0 0;">
                    Gewogen score · management 2.5×
                </p>
            </div>
            """, unsafe_allow_html=True)

            st.markdown("")

            cats_r  = ["Kwaliteit leid.", "Cultuur", "Groei", "Werkdruk", "Compensatie"]
            vals_r  = [sc_mgmt, sc_cult, sc_grow, sc_work, sc_comp]
            fig_r = go.Figure(go.Scatterpolar(
                r=vals_r + [vals_r[0]], theta=cats_r + [cats_r[0]],
                fill="toself", fillcolor="rgba(66,153,225,0.22)",
                line=dict(color="#4299e1", width=2),
            ))
            fig_r.update_layout(
                polar=dict(radialaxis=dict(visible=True, range=[0, 10])),
                height=310, showlegend=False, margin=dict(t=30),
            )
            st.plotly_chart(fig_r, width="stretch")

        st.divider()
        if risk_s >= 70:
            st.error("⚠️ **Hoog risico** — Directe actie vereist. Plan een urgent retentiegesprek. "
                     "Overweeg functieverrijking, meer autonomie of salaris-review.")
        elif risk_s >= 40:
            st.warning("⚡ **Medium risico** — Plan een stay-interview binnen 4 weken. "
                       "Focus op de laagst scorende dimensie(s).")
        else:
            st.success("✅ **Laag risico** — Medewerker lijkt tevreden. "
                       "Blijf monitoren via kwartaalgesprekken.")


    # ═════════════════════════════════════════════════════════════════════════
    # TAB 3 — DASHBOARD
    # ═════════════════════════════════════════════════════════════════════════
    with tab3:
        st.subheader("Retentie Dashboard")

        analyses = st.session_state.analyses

        # Export (always visible when data exists)
        if analyses:
            st.download_button(
                label="⬇️ Exporteer alle analyses (CSV)",
                data=export_csv(analyses),
                file_name=f"Verisight_{datetime.now().strftime('%Y%m%d_%H%M')}.csv",
                mime="text/csv",
            )

        if not analyses:
            st.info("Nog geen analyses beschikbaar. Verwerk eerst een exit survey via Tab 1.")

            # Sample chart
            st.markdown("**Voorbeeld — gemiddelde organisatiefactor scores:**")
            sample_data = [
                ("Kwaliteit leidinggevende", 4.8),
                ("Groeimogelijkheden",        5.1),
                ("Bedrijfscultuur",           6.3),
                ("Werkdruk & balans",         4.2),
                ("Salaris",                   5.5),
                ("Samenwerking",              7.8),
                ("Duidelijkheid over rol",    6.1),
                ("Trots op organisatie",      6.9),
            ]
            sl, sv = zip(*sample_data)
            fig_demo = go.Figure(go.Bar(
                x=list(sv), y=list(sl), orientation="h",
                marker_color=["#e53e3e" if v < 5.5 else "#48bb78" for v in sv],
                text=[str(v) for v in sv], textposition="outside",
            ))
            fig_demo.update_layout(
                title="Gem. Org Factoren — Organisatieoverzicht (Sample)",
                xaxis=dict(range=[0, 11]), height=350,
                showlegend=False, yaxis={"categoryorder": "total ascending"},
                margin=dict(l=180),
            )
            st.plotly_chart(fig_demo, width="stretch")

        else:
            n          = len(analyses)
            total_cost = sum(a["replacement_cost"] for a in analyses)
            redeemable = sum(1 for a in analyses if a["preventability"]["score"] == "Redbaar")
            avg_sdt    = {
                d: round(sum(a["sdt"][d] for a in analyses) / n, 1)
                for d in ["autonomy", "connection", "competence"]
            }
            avg_risk = round(sum(a["risk_score"] for a in analyses) / n, 0)

            # KPIs
            k1, k2, k3, k4, k5 = st.columns(5)
            k1.metric("Exitanalyses",      n)
            k2.metric("Replacement Cost",  f"€{total_cost:,.0f}")
            k3.metric("Voorkoombaar",      f"{redeemable}/{n}")
            k4.metric("Gem. Risico",       f"{avg_risk:.0f}%")
            k5.metric("Gem. Autonomie",    f"{avg_sdt['autonomy']}/10")

            st.divider()
            da, db = st.columns(2)

            with da:
                # Avg org factors bar
                org_avgs = {}
                for key, lbl in ORG_FACTORS:
                    vals = [a["org"].get(key, 5) for a in analyses]
                    org_avgs[lbl.split(" ", 1)[1]] = round(sum(vals) / len(vals), 1)
                sorted_avgs = sorted(org_avgs.items(), key=lambda x: x[1])
                fig_oa = go.Figure(go.Bar(
                    x=[v for _, v in sorted_avgs],
                    y=[l for l, _ in sorted_avgs],
                    orientation="h",
                    marker_color=["#e53e3e" if v < 5.5 else "#48bb78" for _, v in sorted_avgs],
                    text=[f"{v:.1f}" for _, v in sorted_avgs],
                    textposition="outside",
                ))
                fig_oa.update_layout(
                    title="Gemiddelde Org Factoren (laag → hoog)",
                    xaxis=dict(range=[0, 11]), height=360,
                    showlegend=False, margin=dict(l=160, t=50),
                )
                st.plotly_chart(fig_oa, width="stretch")

            with db:
                # SDT averages
                fig_sa = go.Figure(go.Bar(
                    x=["Autonomie", "Verbinding", "Competentie"],
                    y=[avg_sdt["autonomy"], avg_sdt["connection"], avg_sdt["competence"]],
                    marker_color=["#4299e1", "#48bb78", "#ed8936"],
                    text=[f"{v}/10" for v in avg_sdt.values()],
                    textposition="outside",
                ))
                fig_sa.add_hline(y=5, line_dash="dash", line_color="#718096",
                                 annotation_text="Drempelwaarde")
                fig_sa.update_layout(
                    title="Gemiddelde SDT Scores",
                    yaxis=dict(range=[0, 11]), height=360,
                    showlegend=False, margin=dict(t=50),
                )
                st.plotly_chart(fig_sa, width="stretch")

            st.divider()
            dc, dd = st.columns(2)

            with dc:
                # Exit categories pie
                cat_counts = {}
                for a in analyses:
                    c = a["exit_category"]
                    cat_counts[c] = cat_counts.get(c, 0) + 1
                fig_cat = px.pie(
                    values=list(cat_counts.values()),
                    names=list(cat_counts.keys()),
                    title="Verdeling Exit Categorieën",
                    color_discrete_sequence=px.colors.qualitative.Set2,
                )
                fig_cat.update_traces(textposition="inside", textinfo="percent+label")
                fig_cat.update_layout(height=360)
                st.plotly_chart(fig_cat, width="stretch")

            with dd:
                # Replacement cost per dept
                dept_costs = {}
                for a in analyses:
                    d = a["department"]
                    dept_costs[d] = dept_costs.get(d, 0) + a["replacement_cost"]
                fig_dc = px.bar(
                    x=list(dept_costs.keys()),
                    y=list(dept_costs.values()),
                    title="Replacement Cost per Afdeling",
                    color=list(dept_costs.values()),
                    color_continuous_scale="Reds",
                )
                fig_dc.update_layout(height=360, yaxis_title="€",
                                     showlegend=False, coloraxis_showscale=False)
                st.plotly_chart(fig_dc, width="stretch")

            st.divider()

            # Full table
            st.markdown("**Alle Exitanalyses**")
            rows = []
            for a in analyses:
                rows.append({
                    "Datum":       a["datum"],
                    "ID":          a["id"],
                    "Afdeling":    a["department"],
                    "Niveau":      a["role_level"],
                    "Dienst (j)":  a["tenure"],
                    "Categorie":   a["exit_category"],
                    "Autonomie":   a["sdt"]["autonomy"],
                    "Verbinding":  a["sdt"]["connection"],
                    "Competentie": a["sdt"]["competence"],
                    "Risico %":    a["risk_score"],
                    "Preventab.":  a["preventability"]["score"],
                    "Repl. Cost":  f"€{a['replacement_cost']:,.0f}",
                })
            st.dataframe(rows, use_container_width=True)


if __name__ == "__main__":
    main()
