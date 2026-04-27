import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    items: [
      {
        org_id: 'verisight-demo',
        legal_customer_name: 'Verisight Demo Org',
        contract_state: 'signed',
        billing_state: 'active_manual',
        payment_method_confirmed: true,
      },
    ],
  })
}
