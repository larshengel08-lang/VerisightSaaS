export function rapportGereedHtml({
  organizationName,
  campaignName,
  dashboardUrl,
}: {
  organizationName: string
  campaignName: string
  dashboardUrl: string
}): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;color:#162238;max-width:560px;margin:40px auto;padding:0 20px">
  <p style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#78818a">Loep</p>
  <h1 style="font-size:24px;font-weight:700;margin:16px 0 8px">Je rapport staat klaar</h1>
  <p style="color:#4e5d6f;line-height:1.7">
    Het rapport voor <strong>${escHtml(campaignName)}</strong> (${escHtml(organizationName)}) staat
    klaar in je dashboard. Begin op pagina twee: daar staat waar het gesprek begint.
  </p>
  <a href="${escHtml(dashboardUrl)}"
     style="display:inline-block;margin:24px 0 16px;background:#b9571f;color:#fff;padding:14px 24px;
            text-decoration:none;font-weight:600;font-size:15px">
    Open je dashboard
  </a>
  <hr style="border:none;border-top:1px solid #e8ddd0;margin:24px 0">
  <p style="font-size:12px;color:#97a0ab">
    Loep · hallo@getloep.nl<br>
    Je ontvangt dit bericht omdat je de eigenaar bent van de Loep-omgeving van ${escHtml(organizationName)}.
  </p>
</body>
</html>`
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
