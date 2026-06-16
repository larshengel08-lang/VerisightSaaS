export function voortgangHtml({
  organizationName,
  campaignName,
  totalCompleted,
  totalInvited,
  responsePct,
  dashboardUrl,
}: {
  organizationName: string
  campaignName: string
  totalCompleted: number
  totalInvited: number
  responsePct: number
  dashboardUrl: string
}): string {
  const encouragement =
    responsePct >= 60
      ? 'De respons loopt goed. Overweeg om de scan binnenkort te sluiten.'
      : 'Een reminder sturen kan de respons nog verhogen.'

  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;color:#162238;max-width:560px;margin:40px auto;padding:0 20px">
  <p style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#78818a">Loep · Voortgangsupdate</p>
  <h1 style="font-size:22px;font-weight:700;margin:16px 0 8px">${escHtml(campaignName)}</h1>
  <p style="color:#4e5d6f;line-height:1.7">${escHtml(organizationName)}</p>

  <div style="background:#fbf7f2;border:1px solid #d9cebf;padding:20px 24px;margin:20px 0">
    <p style="font-size:32px;font-weight:700;margin:0 0 4px">${responsePct}%</p>
    <p style="color:#78818a;font-size:14px;margin:0">${totalCompleted} van ${totalInvited} ingevuld</p>
  </div>

  <p style="color:#4e5d6f;line-height:1.7">${escHtml(encouragement)}</p>

  <a href="${escHtml(dashboardUrl)}"
     style="display:inline-block;margin:16px 0;background:#162238;color:#fff;padding:12px 20px;
            text-decoration:none;font-weight:600;font-size:14px">
    Bekijk dashboard →
  </a>
  <hr style="border:none;border-top:1px solid #e8ddd0;margin:24px 0">
  <p style="font-size:12px;color:#97a0ab">Loep · hallo@verisight.nl</p>
</body>
</html>`
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
