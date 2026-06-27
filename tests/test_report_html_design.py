"""Design-overhaul tests — structuur en CSS-klassen."""
from backend.report_css import build_css


def test_br_kernzin_class_present():
    css = build_css("exit")
    assert ".br-kernzin" in css


def test_fbar_label_class_present():
    css = build_css("retention")
    assert ".fbar-label" in css


def test_mgmt_anchor_class_present():
    css = build_css("onboarding")
    assert ".mgmt-anchor" in css
