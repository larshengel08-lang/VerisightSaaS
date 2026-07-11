"""Spreidingsaggregatie (spec: docs/superpowers/specs/2026-07-11-rapport-spreiding-design.md)."""
from backend.report_distribution import score_distribution, distribution_block


def test_zones_volgen_factor_label_drempels():
    # 4.99 = laag (kwetsbaar), 5.0 = midden (aandacht), 6.5 = hoog (sterk)
    d = score_distribution([4.99, 5.0, 6.49, 6.5])
    assert d["zones"] == (1, 2, 1)


def test_polarisatie_beide_buitenzones_25pct_en_samen_60pct():
    # 4 laag + 4 hoog + 2 midden van 10: 40%/40%, samen 80% -> gepolariseerd
    vals = [2.0] * 4 + [8.0] * 4 + [5.5] * 2
    assert score_distribution(vals)["polarized"] is True


def test_geen_polarisatie_bij_eenzijdig_beeld():
    # 8 laag + 2 hoog: hoog < 25% -> niet gepolariseerd
    vals = [2.0] * 8 + [8.0] * 2
    assert score_distribution(vals)["polarized"] is False


def test_geen_polarisatie_bij_breed_midden():
    # buitenzones samen 40% < 60% -> niet gepolariseerd
    vals = [2.0] * 2 + [8.0] * 2 + [5.5] * 6
    assert score_distribution(vals)["polarized"] is False


def test_lege_input():
    d = score_distribution([])
    assert d["zones"] == (0, 0, 0)
    assert d["polarized"] is False
    assert d["mean"] is None


def test_mean_en_dots():
    d = score_distribution([2.0, 8.0])
    assert d["mean"] == 5.0
    assert d["dots"] == [2.0, 8.0]


def test_block_leeg_onder_n10():
    assert distribution_block([5.0] * 9) == ""


def test_block_bevat_svg_en_aantallen_vanaf_n10():
    html = distribution_block([2.0] * 5 + [8.0] * 5)
    assert "<svg" in html
    assert "Kwetsbaar 5" in html
    assert "Sterk 5" in html
    assert "GEM 5.0" in html


def test_duidingszin_alleen_bij_polarisatie():
    gepolariseerd = distribution_block([2.0] * 5 + [8.0] * 5)
    assert "Verdeeld beeld" in gepolariseerd
    normaal = distribution_block([5.5] * 10)
    assert "Verdeeld beeld" not in normaal


def test_jitter_deterministisch():
    # Zelfde input -> byte-identieke output (geen random; WeasyPrint-stabiel).
    vals = [2.0, 3.0, 5.5, 7.0, 8.0] * 2
    assert distribution_block(vals) == distribution_block(vals)
