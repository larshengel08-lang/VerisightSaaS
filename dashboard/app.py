"""
RetentionPulse — Operator Dashboard
======================================
Streamlit app voor HR-operators en platformbeheerders.

Start met:  streamlit run dashboard/app.py --server.port 8501

Leest rechtstreeks uit SQLite (of PostgreSQL via DATABASE_URL env var).
De FastAPI-backend hoeft NIET tegelijk te draaien voor het dashboard.
"""

from __future__ import annotations

import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Backend importeerbaar maken vanuit projectroot
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from sqlalchemy.orm import Session

from backend.database import SessionLocal, init_db
from backend.models import Campaign, Organization, Respondent, SurveyResponse
from backend.scoring import (
    EXIT_REASON_LABELS_NL,
    FACTOR_LABELS_NL,
    ORG_FACTOR_KEYS,
    ROLE_MULTIPLIERS,
    detect_patterns,
    get_recommendations,
)

# ---------------------------------------------------------------------------
# Paginaconfiguratie
# ---------------------------------------------------------------------------

st.set_page_config(
    page_title="RetentionPulse Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------------
# DB-sessie (gecached per sessie)
# ---------------------------------------------------------------------------


@st.cache_resource
def get_db() -> Session:
    init_db()
    return SessionLocal()


db = get_db()

# ---------------------------------------------------------------------------
# Stijl
# ---------------------------------------------------------------------------

st.markdown(
    """
<style>
  [data-testid="metric-container"] {
    background: #F8FAFF;
    border: 1px solid #DBEAFE;
    border-radius: 10px;
    padding: 16px 20px;
  }
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
  }
  .badge-high   { background: #FEE2E2; color: #991B1B; }
  .badge-medium { background: #FEF9C3; color: #92400E; }
  .badge-low    { background: #DCFCE7; color: #166534; }
  h2 { color: #1D4ED8 !important; }

  /* Survey-link box */
  .link-box {
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 8px;
    padding: 10px 14px;
    font-family: monospace;
    font-size: 13px;
    margin-bottom: 6px;
    word-break: break-all;
  }
</style>
""",
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8000")


def _refresh():
    """Ververs de pagina na een DB-wijziging."""
    st.rerun()


def _survey_url(token: str) -> str:
    return f"{API_BASE}/survey/{token}"


# ---------------------------------------------------------------------------
# Sidebar — organisatie- en campaigneselector
# ---------------------------------------------------------------------------

with st.sidebar:
    st.markdown("## 🔵 RetentionPulse")
    st.markdown("**Operator Dashboard**")
    st.divider()

    orgs = db.query(Organization).filter(Organization.is_active.is_(True)).all()

    if not orgs:
        st.warning(
            "Geen organisaties gevonden.  \n"
            "Gebruik de tab **⚙️ Beheer** → *Nieuwe organisatie* om te beginnen."
        )
        # Toon toch de rest van de sidebar zodat Beheer-tab bereikbaar is
        selected_org = None
        selected_campaign = None
    else:
        org_options = {o.name: o for o in orgs}
        selected_org_name = st.selectbox("Organisatie", list(org_options.keys()))
        selected_org: Organization = org_options[selected_org_name]
        st.caption(f"API-sleutel: `{selected_org.api_key[:8]}…`")
        st.divider()

        campaigns = (
            db.query(Campaign)
            .filter(Campaign.organization_id == selected_org.id)
            .order_by(Campaign.created_at.desc())
            .all()
        )

        if not campaigns:
            st.info("Geen campaigns voor deze organisatie.  \nMaak er een aan in **⚙️ Beheer**.")
            selected_campaign = None
        else:
            camp_options = {f"{c.name} ({c.scan_type})": c for c in campaigns}
            selected_camp_name = st.selectbox("Campaign", list(camp_options.keys()))
            selected_campaign: Campaign = camp_options[selected_camp_name]

    st.divider()
    st.caption("RetentionPulse v2.0  |  © 2025")

# ---------------------------------------------------------------------------
# Tabs
# ---------------------------------------------------------------------------

tab_overview, tab_factors, tab_sdt, tab_respondents, tab_recs, tab_beheer = st.tabs(
    [
        "📈 Overzicht",
        "🏢 Organisatiefactoren",
        "🧠 SDT",
        "👥 Respondenten",
        "💡 Aanbevelingen",
        "⚙️ Beheer",
    ]
)

# ===========================================================================
# TAB BEHEER  ── alles wat nodig is om het platform te bedienen
# ===========================================================================

with tab_beheer:
    st.header("⚙️ Beheer")

    col_left, col_right = st.columns(2, gap="large")

    # ── LINKER KOLOM: Organisatie + Campaign aanmaken ───────────────────────
    with col_left:

        # ── Nieuwe organisatie ──────────────────────────────────────────────
        st.subheader("Nieuwe organisatie")
        with st.form("form_new_org", clear_on_submit=True):
            org_name  = st.text_input("Naam organisatie *", placeholder="Acme BV")
            org_slug  = st.text_input(
                "Slug * (alleen kleine letters, cijfers, koppelstreep)",
                placeholder="acme-bv",
            )
            org_email = st.text_input("Contacte-mail *", placeholder="hr@acme.nl")
            submitted_org = st.form_submit_button("➕ Organisatie aanmaken", type="primary")

        if submitted_org:
            errors = []
            if not org_name:
                errors.append("Naam is verplicht.")
            if not org_slug or not org_slug.replace("-", "").replace("_", "").isalnum():
                errors.append("Ongeldige slug (alleen a-z, 0-9, -).")
            if not org_email or "@" not in org_email:
                errors.append("Ongeldige e-mail.")
            existing = db.query(Organization).filter(Organization.slug == org_slug).first()
            if existing:
                errors.append(f"Slug '{org_slug}' is al in gebruik.")
            if errors:
                for e in errors:
                    st.error(e)
            else:
                new_org = Organization(
                    id=str(uuid.uuid4()),
                    name=org_name,
                    slug=org_slug,
                    contact_email=org_email,
                )
                db.add(new_org)
                db.commit()
                st.success(f"✅ Organisatie **{org_name}** aangemaakt.")
                _refresh()

        st.divider()

        # ── Nieuwe campaign ─────────────────────────────────────────────────
        st.subheader("Nieuwe campaign")

        if not orgs:
            st.info("Maak eerst een organisatie aan.")
        else:
            with st.form("form_new_campaign", clear_on_submit=True):
                camp_org = st.selectbox(
                    "Organisatie",
                    options=[o.id for o in orgs],
                    format_func=lambda oid: next(o.name for o in orgs if o.id == oid),
                )
                camp_name = st.text_input("Naam campaign *", placeholder="ExitScan Q2 2025")
                camp_type = st.selectbox("Type scan", ["exit", "retention"])
                camp_modules = st.multiselect(
                    "Modules (leeg = alle 6)",
                    options=ORG_FACTOR_KEYS,
                    format_func=lambda k: FACTOR_LABELS_NL.get(k, k),
                )
                submitted_camp = st.form_submit_button("➕ Campaign aanmaken", type="primary")

            if submitted_camp:
                if not camp_name:
                    st.error("Naam is verplicht.")
                else:
                    new_camp = Campaign(
                        id=str(uuid.uuid4()),
                        organization_id=camp_org,
                        name=camp_name,
                        scan_type=camp_type,
                        enabled_modules=camp_modules if camp_modules else None,
                    )
                    db.add(new_camp)
                    db.commit()
                    st.success(f"✅ Campaign **{camp_name}** aangemaakt.")
                    _refresh()

    # ── RECHTER KOLOM: Respondenten toevoegen + links ───────────────────────
    with col_right:

        st.subheader("Respondenten toevoegen")

        all_campaigns = db.query(Campaign).all()
        if not all_campaigns:
            st.info("Maak eerst een campaign aan.")
        else:
            with st.form("form_add_respondents", clear_on_submit=True):
                resp_camp = st.selectbox(
                    "Campaign",
                    options=[c.id for c in all_campaigns],
                    format_func=lambda cid: next(
                        f"{c.name} ({c.scan_type})" for c in all_campaigns if c.id == cid
                    ),
                )
                resp_n = st.number_input("Aantal uitnodigingen", min_value=1, max_value=200, value=5)
                resp_dept = st.text_input("Afdeling (optioneel)", placeholder="Operations")
                resp_role = st.selectbox(
                    "Functieniveau (optioneel)",
                    options=["", *ROLE_MULTIPLIERS.keys()],
                    format_func=lambda k: {
                        "": "— niet opgegeven —",
                        "uitvoerend": "Uitvoerend",
                        "specialist": "Specialist",
                        "senior": "Senior specialist",
                        "manager": "Manager",
                        "director": "Director",
                        "c_level": "C-level",
                    }.get(k, k),
                )
                resp_salary = st.number_input(
                    "Bruto jaarsalaris € (optioneel, voor vervangingskosten)",
                    min_value=0,
                    max_value=500_000,
                    value=0,
                    step=1000,
                )
                submitted_resp = st.form_submit_button("➕ Respondenten aanmaken", type="primary")

            if submitted_resp:
                new_respondents = [
                    Respondent(
                        id=str(uuid.uuid4()),
                        campaign_id=resp_camp,
                        department=resp_dept or None,
                        role_level=resp_role or None,
                        annual_salary_eur=float(resp_salary) if resp_salary > 0 else None,
                    )
                    for _ in range(int(resp_n))
                ]
                db.add_all(new_respondents)
                db.commit()
                st.success(f"✅ {int(resp_n)} respondenten aangemaakt.")
                _refresh()

        st.divider()

        # ── Survey-links ────────────────────────────────────────────────────
        st.subheader("📋 Survey-links kopiëren")

        if not all_campaigns:
            st.info("Geen campaigns beschikbaar.")
        else:
            link_camp_id = st.selectbox(
                "Campaign voor links",
                options=[c.id for c in all_campaigns],
                format_func=lambda cid: next(
                    f"{c.name} ({c.scan_type})" for c in all_campaigns if c.id == cid
                ),
                key="link_camp_select",
            )
            link_camp = next(c for c in all_campaigns if c.id == link_camp_id)
            pending = [r for r in link_camp.respondents if not r.completed]
            done    = [r for r in link_camp.respondents if r.completed]

            st.caption(
                f"**{len(pending)}** openstaand  ·  **{len(done)}** ingevuld  ·  "
                f"**{len(link_camp.respondents)}** totaal"
            )

            show_done = st.checkbox("Toon ook ingevulde links", value=False)
            to_show = link_camp.respondents if show_done else pending

            if not to_show:
                st.info("Geen (openstaande) respondenten in deze campaign.")
            else:
                # Bulk-tekst voor copy-paste in e-mailclient
                all_links = "\n".join(_survey_url(r.token) for r in to_show)
                st.text_area(
                    f"Alle {'openstaande ' if not show_done else ''}links (kopieer voor e-mail)",
                    value=all_links,
                    height=min(200, 40 + len(to_show) * 22),
                )

                # Per respondent in tabel
                rows = []
                for r in to_show:
                    rows.append({
                        "Status":      "✅ Ingevuld" if r.completed else "⏳ Open",
                        "Afdeling":    r.department or "–",
                        "Niveau":      r.role_level or "–",
                        "Survey-URL":  _survey_url(r.token),
                    })
                st.dataframe(pd.DataFrame(rows), hide_index=True, use_container_width=True)

# ===========================================================================
# Veiligheidsstop: rest van tabs vereist een geselecteerde campaign
# ===========================================================================

if selected_campaign is None:
    for tab in [tab_overview, tab_factors, tab_sdt, tab_respondents, tab_recs]:
        with tab:
            st.info("Selecteer of maak een campaign aan via **⚙️ Beheer**.")
    st.stop()

# ---------------------------------------------------------------------------
# Laad campagnedata
# ---------------------------------------------------------------------------

respondents: list[Respondent] = selected_campaign.respondents
completed   = [r for r in respondents if r.completed]
responses: list[SurveyResponse] = [r.response for r in completed if r.response is not None]

n_invited   = len(respondents)
n_completed = len(completed)
completion  = round(n_completed / n_invited * 100, 1) if n_invited > 0 else 0.0

risk_scores = [r.risk_score for r in responses if r.risk_score is not None]
avg_risk    = round(sum(risk_scores) / len(risk_scores), 2) if risk_scores else None

band_counts = {"HOOG": 0, "MIDDEN": 0, "LAAG": 0}
for r in responses:
    if r.risk_band in band_counts:
        band_counts[r.risk_band] += 1

# Patroonrapport
pattern_input = [
    {
        "org_scores":       resp.org_scores,
        "sdt_scores":       resp.sdt_scores,
        "risk_score":       resp.risk_score,
        "preventability":   resp.preventability,
        "exit_reason_code": resp.exit_reason_code,
        "department":       resp.respondent.department,
        "role_level":       resp.respondent.role_level,
    }
    for resp in responses
]
pattern = detect_patterns(pattern_input) if pattern_input else None

# ===========================================================================
# HOOFD-HEADER
# ===========================================================================

col_title, col_pdf = st.columns([3, 1])
with col_title:
    st.title(f"📊 {selected_campaign.name}")
with col_pdf:
    st.markdown("<div style='padding-top:18px'>", unsafe_allow_html=True)
    if st.button("⬇️ Download PDF-rapport", type="primary", use_container_width=True):
        try:
            from backend.report import generate_campaign_report
            pdf_bytes = generate_campaign_report(selected_campaign.id, db)
            filename  = f"RetentionPulse_{selected_campaign.name.replace(' ', '_')}.pdf"
            st.download_button(
                label="📄 Klik om op te slaan",
                data=pdf_bytes,
                file_name=filename,
                mime="application/pdf",
                use_container_width=True,
            )
        except Exception as e:
            st.error(f"PDF-generatie mislukt: {e}")
    st.markdown("</div>", unsafe_allow_html=True)

col_type, col_status, col_created = st.columns(3)
with col_type:
    st.markdown(f"**Type:** {'ExitScan' if selected_campaign.scan_type == 'exit' else 'RetentieScan'}")
with col_status:
    st.markdown(f"**Status:** {'🟢 Actief' if selected_campaign.is_active else '🔴 Gesloten'}")
with col_created:
    st.markdown(f"**Aangemaakt:** {selected_campaign.created_at.strftime('%d-%m-%Y')}")

st.divider()

# ===========================================================================
# KPI-RIJEN
# ===========================================================================

kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)
with kpi1:
    st.metric("Uitnodigingen", n_invited)
with kpi2:
    st.metric("Ingevuld", n_completed)
with kpi3:
    st.metric("Respons", f"{completion}%")
with kpi4:
    st.metric("Gem. risicoscore", f"{avg_risk:.1f} / 10" if avg_risk else "–")
with kpi5:
    avoidable = (
        pattern.get("avoidable_rate_pct")
        if pattern and pattern.get("sufficient_data")
        else None
    )
    st.metric("Vermijdbaar verloop", f"{avoidable}%" if avoidable is not None else "–")

st.divider()

# Waarschuwing bij onvoldoende data
if not responses:
    for tab in [tab_overview, tab_factors, tab_sdt, tab_recs]:
        with tab:
            st.info("📭 Nog geen ingevulde surveys in deze campaign.")

if pattern and not pattern.get("sufficient_data"):
    st.warning(
        f"⚠️ {pattern.get('message', '')}  "
        "Analyses en aanbevelingen zijn beschikbaar zodra er voldoende responses zijn."
    )

# ===========================================================================
# TAB 1 — OVERZICHT
# ===========================================================================

with tab_overview:
    if not responses:
        st.stop()

    st.subheader("Risicodistributie")
    col_pie, col_hist = st.columns(2)

    with col_pie:
        fig_pie = go.Figure(
            go.Pie(
                labels=["Hoog risico", "Midden risico", "Laag risico"],
                values=[band_counts["HOOG"], band_counts["MIDDEN"], band_counts["LAAG"]],
                marker_colors=["#DC2626", "#F59E0B", "#16A34A"],
                hole=0.45,
                textinfo="label+percent",
            )
        )
        fig_pie.update_layout(showlegend=False, margin=dict(t=20, b=20, l=0, r=0), height=280)
        st.plotly_chart(fig_pie, use_container_width=True)

    with col_hist:
        if risk_scores:
            fig_hist = px.histogram(
                x=risk_scores,
                nbins=10,
                range_x=[1, 10],
                labels={"x": "Risicoscore", "y": "Aantal"},
                color_discrete_sequence=["#2563EB"],
            )
            fig_hist.update_layout(margin=dict(t=20, b=20, l=0, r=0), height=280, bargap=0.1)
            if avg_risk:
                fig_hist.add_vline(
                    x=avg_risk, line_dash="dash", line_color="#6B7280",
                    annotation_text=f"Gem. {avg_risk:.1f}",
                )
            st.plotly_chart(fig_hist, use_container_width=True)

    # Vertrekreden (alleen exit)
    if selected_campaign.scan_type == "exit" and pattern and pattern.get("sufficient_data"):
        col_r, col_p = st.columns(2)

        with col_r:
            st.subheader("Top vertrekreden")
            top_reasons = pattern.get("top_exit_reasons", [])
            if top_reasons:
                fig_bar = px.bar(
                    x=[r["count"] for r in top_reasons],
                    y=[r["label"] for r in top_reasons],
                    orientation="h",
                    labels={"x": "Aantal", "y": ""},
                    color_discrete_sequence=["#2563EB"],
                )
                fig_bar.update_layout(margin=dict(t=10, b=10), height=220)
                st.plotly_chart(fig_bar, use_container_width=True)

        with col_p:
            st.subheader("Vermijdbaarheid")
            prev = pattern.get("preventability_counts", {})
            if any(prev.values()):
                fig_prev = go.Figure(
                    go.Pie(
                        labels=["Redbaar", "Mogelijk redbaar", "Niet redbaar"],
                        values=[
                            prev.get("REDBAAR", 0),
                            prev.get("MOGELIJK_REDBAAR", 0),
                            prev.get("NIET_REDBAAR", 0),
                        ],
                        marker_colors=["#16A34A", "#F59E0B", "#6B7280"],
                        hole=0.45,
                        textinfo="label+percent",
                    )
                )
                fig_prev.update_layout(
                    showlegend=False, margin=dict(t=20, b=20, l=0, r=0), height=220
                )
                st.plotly_chart(fig_prev, use_container_width=True)

# ===========================================================================
# TAB 2 — ORGANISATIEFACTOREN
# ===========================================================================

with tab_factors:
    if not responses:
        st.stop()

    st.subheader("Gemiddelde scores per factor (1–10)")

    if pattern and pattern.get("sufficient_data"):
        factor_avgs = pattern.get("factor_averages", {})
        top_risks   = pattern.get("top_risk_factors", [])

        factors_for_radar = [f for f in ORG_FACTOR_KEYS if f in factor_avgs]
        radar_labels = [FACTOR_LABELS_NL.get(f, f) for f in factors_for_radar]
        radar_values = [factor_avgs[f] for f in factors_for_radar]

        col_radar, col_bar = st.columns(2)

        with col_radar:
            if len(radar_values) >= 3:
                fig_radar = go.Figure(
                    go.Scatterpolar(
                        r=radar_values + [radar_values[0]],
                        theta=radar_labels + [radar_labels[0]],
                        fill="toself",
                        line_color="#2563EB",
                        fillcolor="rgba(37,99,235,0.15)",
                    )
                )
                fig_radar.update_layout(
                    polar=dict(radialaxis=dict(visible=True, range=[1, 10])),
                    showlegend=False,
                    margin=dict(t=40, b=40, l=40, r=40),
                    height=360,
                )
                st.plotly_chart(fig_radar, use_container_width=True)

        with col_bar:
            if top_risks:
                risk_df = pd.DataFrame(top_risks, columns=["factor", "risk_score"])
                risk_df["label"] = risk_df["factor"].map(lambda f: FACTOR_LABELS_NL.get(f, f))
                risk_df = risk_df.sort_values("risk_score", ascending=True)

                fig_risk = px.bar(
                    risk_df,
                    x="risk_score",
                    y="label",
                    orientation="h",
                    labels={"risk_score": "Risicowaarde (1–10)", "label": ""},
                    color="risk_score",
                    color_continuous_scale=["#16A34A", "#F59E0B", "#DC2626"],
                    range_color=[1, 10],
                )
                fig_risk.update_layout(
                    coloraxis_showscale=False,
                    margin=dict(t=10, b=10),
                    height=360,
                )
                fig_risk.add_vline(
                    x=7.0, line_dash="dash", line_color="#DC2626",
                    annotation_text="Drempel HOOG",
                )
                st.plotly_chart(fig_risk, use_container_width=True)

        # Afdeling-uitsplitsing
        dept_risks = pattern.get("department_avg_risk", {})
        if dept_risks:
            st.subheader("Risico per afdeling")
            dept_df = (
                pd.DataFrame(
                    [{"Afdeling": k, "Gem. risicoscore": v} for k, v in dept_risks.items()]
                )
                .sort_values("Gem. risicoscore", ascending=False)
            )
            st.dataframe(dept_df, hide_index=True, use_container_width=True)

    else:
        st.info("Minimaal 5 responses nodig voor organisatierapportage.")

# ===========================================================================
# TAB 3 — SDT BASISBEHOEFTEN
# ===========================================================================

with tab_sdt:
    if not responses:
        st.stop()

    st.subheader("SDT Basisbehoeften (Van den Broeck et al., 2010)")

    if pattern and pattern.get("sufficient_data"):
        factor_avgs = pattern.get("factor_averages", {})
        sdt_dims    = ["autonomy", "competence", "relatedness"]
        sdt_labels  = [FACTOR_LABELS_NL.get(d, d) for d in sdt_dims]
        sdt_values  = [factor_avgs.get(d, 5.5) for d in sdt_dims]

        col_a, col_b, col_c = st.columns(3)
        for col, dim, label, val in zip([col_a, col_b, col_c], sdt_dims, sdt_labels, sdt_values):
            with col:
                delta = val - 5.5
                st.metric(
                    label,
                    f"{val:.1f} / 10",
                    delta=f"{delta:+.1f} vs. middelpunt",
                    delta_color="inverse" if val < 5.5 else "normal",
                )

        # Gauges
        fig_gauges = go.Figure()
        for i, (dim, label, val) in enumerate(zip(sdt_dims, sdt_labels, sdt_values)):
            fig_gauges.add_trace(
                go.Indicator(
                    mode="gauge+number",
                    value=val,
                    title={"text": label, "font": {"size": 13}},
                    gauge={
                        "axis":  {"range": [1, 10]},
                        "bar":   {"color": "#2563EB"},
                        "steps": [
                            {"range": [1, 4.5], "color": "#FEE2E2"},
                            {"range": [4.5, 7], "color": "#FEF9C3"},
                            {"range": [7, 10],  "color": "#DCFCE7"},
                        ],
                        "threshold": {
                            "line":  {"color": "#374151", "width": 2},
                            "value": 5.5,
                        },
                    },
                    domain={"row": 0, "column": i},
                )
            )
        fig_gauges.update_layout(
            grid={"rows": 1, "columns": 3, "pattern": "independent"},
            height=240,
            margin=dict(t=40, b=10, l=20, r=20),
        )
        st.plotly_chart(fig_gauges, use_container_width=True)

    else:
        st.info("Minimaal 5 responses nodig voor SDT-rapportage.")

# ===========================================================================
# TAB 4 — RESPONDENTEN
# ===========================================================================

with tab_respondents:
    st.subheader("Respondentoverzicht")

    rows = []
    for r in respondents:
        row = {
            "Token":       r.token[:8] + "…",
            "Afdeling":    r.department or "–",
            "Niveau":      r.role_level or "–",
            "Status":      "✅ Ingevuld" if r.completed else "⏳ Open",
            "Datum":       r.completed_at.strftime("%d-%m-%Y %H:%M") if r.completed_at else "–",
        }
        if r.response:
            row["Risicoscore"] = f"{r.response.risk_score:.1f}" if r.response.risk_score else "–"
            row["Risicoband"]  = r.response.risk_band or "–"
            if selected_campaign.scan_type == "exit":
                row["Vermijdbaar"] = r.response.preventability or "–"
        rows.append(row)

    st.dataframe(pd.DataFrame(rows), hide_index=True, use_container_width=True)

    # Openstaande links
    pending = [r for r in respondents if not r.completed]
    if pending:
        st.subheader(f"📧 Openstaande survey-links ({len(pending)})")
        all_links = "\n".join(_survey_url(r.token) for r in pending)
        st.text_area("Kopieer voor e-mailuitnodiging", value=all_links, height=min(200, 40 + len(pending) * 22))

# ===========================================================================
# TAB 5 — AANBEVELINGEN
# ===========================================================================

with tab_recs:
    st.subheader("💡 Prioritaire aanbevelingen")

    if not responses:
        st.stop()

    if pattern and pattern.get("sufficient_data"):
        top_risks = pattern.get("top_risk_factors", [])
        if not top_risks:
            st.info("Geen risicovolle factoren gevonden.")
        else:
            factor_risks_dict = {f: score for f, score in top_risks}
            recs = get_recommendations(factor_risks_dict)

            for factor, score in top_risks:
                label = FACTOR_LABELS_NL.get(factor, factor)
                if score >= 7.0:
                    badge    = '<span class="badge badge-high">URGENT</span>'
                    expanded = True
                elif score >= 4.5:
                    badge    = '<span class="badge badge-medium">AANDACHT</span>'
                    expanded = False
                else:
                    badge    = '<span class="badge badge-low">OK</span>'
                    expanded = False

                with st.expander(f"{label}  —  risico {score:.1f} / 10", expanded=expanded):
                    st.markdown(badge, unsafe_allow_html=True)
                    for rec in recs.get(factor, []):
                        st.markdown(f"- {rec}")
    else:
        st.info("Minimaal 5 responses nodig voor aanbevelingen.")
