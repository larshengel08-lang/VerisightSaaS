export function welkomHtml({
  organizationName,
  dashboardUrl,
}: {
  organizationName: string
  dashboardUrl: string
}): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;color:#162238;max-width:560px;margin:40px auto;padding:0 20px">
  <p style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#78818a">Loep</p>
  <h1 style="font-size:24px;font-weight:700;margin:16px 0 8px">Welkom bij Loep</h1>
  <p style="color:#4e5d6f;line-height:1.7">
    Je account voor <strong>${escHtml(organizationName)}</strong> staat klaar.
    Dit zijn de drie stappen om van start te gaan:
  </p>
  <ol style="color:#4e5d6f;line-height:2;padding-left:20px">
    <li><strong>Activeer je account</strong> — klik op de activatielink in de andere mail die je zojuist hebt ontvangen.</li>
    <li><strong>Bekijk het dashboard</strong> — zodra de scan van start gaat, volg je hier de respons.</li>
    <li><strong>Download het rapport</strong> — na afloop staat het managementrapport direct klaar.</li>
  </ol>
  <a href="${escHtml(dashboardUrl)}"
     style="display:inline-block;margin:24px 0;background:#b9571f;color:#fff;padding:14px 24px;
            text-decoration:none;font-weight:600;font-size:15px">
    Ga naar het dashboard →
  </a>
  <p style="color:#4e5d6f;line-height:1.7">
    Vragen? Stuur een bericht via <a href="mailto:hallo@getloep.nl" style="color:#b9571f">hallo@getloep.nl</a>.
  </p>
  <hr style="border:none;border-top:1px solid #e8ddd0;margin:24px 0">
  <p style="font-size:12px;color:#97a0ab">Loep · hallo@getloep.nl</p>
</body>
</html>`
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
