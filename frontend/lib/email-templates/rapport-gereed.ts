export function rapportGereedHtml({
  organizationName,
  campaignName,
  dashboardUrl,
  calendlyUrl,
}: {
  organizationName: string
  campaignName: string
  dashboardUrl: string
  calendlyUrl: string | null
}): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;color:#162238;max-width:560px;margin:40px auto;padding:0 20px">
  <p style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#78818a">Loep</p>
  <h1 style="font-size:24px;font-weight:700;margin:16px 0 8px">Je rapport is beschikbaar</h1>
  <p style="color:#4e5d6f;line-height:1.7">
    Het managementrapport voor <strong>${escHtml(campaignName)}</strong> (${escHtml(organizationName)})
    staat klaar in je dashboard.
  </p>
  <a href="${escHtml(dashboardUrl)}"
     style="display:inline-block;margin:24px 0 16px;background:#b9571f;color:#fff;padding:14px 24px;
            text-decoration:none;font-weight:600;font-size:15px">
    Bekijk rapport →
  </a>
  ${calendlyUrl ? `
  <p style="color:#4e5d6f;line-height:1.7;margin-top:8px">
    Klaar voor de managementbespreking? Kies een moment dat uitkomt:
  </p>
  <a href="${escHtml(calendlyUrl)}"
     style="display:inline-block;margin:8px 0 24px;border:1px solid #d9cebf;color:#162238;
            padding:12px 20px;text-decoration:none;font-weight:600;font-size:14px">
    Plan de managementbespreking
  </a>
  ` : ''}
  <hr style="border:none;border-top:1px solid #e8ddd0;margin:24px 0">
  <p style="font-size:12px;color:#97a0ab">
    Loep · hallo@getloep.nl<br>
    Je ontvangt dit bericht omdat je HR-beheerder bent van ${escHtml(organizationName)}.
  </p>
</body>
</html>`
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
