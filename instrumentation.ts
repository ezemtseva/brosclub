export async function register() {
  // Only run on the server, not during Next.js edge runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { Resend } = await import('resend')

    const resend = new Resend(process.env.RESEND_API_KEY)

    const recipients = [
      'Vpolibin@gmail.com',
      'Mhamzin@gmail.com',
      'loguinov.yury@gmail.com',
    ]

    const deployedAt = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow',
    })

    const result = await resend.emails.send({
      from: 'Bearos Club <onboarding@resend.dev>',
      to: recipients,
      subject: '🐻 Bearos Club has been updated',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
          <h2 style="margin: 0 0 8px;">Bearos Club updated 🐻</h2>
          <p style="color: #666; margin: 0 0 24px; font-size: 14px;">${deployedAt} (Moscow time)</p>
          <p style="margin: 0 0 24px;">Fresh data is live. Check the latest standings:</p>
          <a href="https://bearos.club" style="display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Open Bearos Club →
          </a>
        </div>
      `,
    })

    if (result.error) {
      console.error('[Bearos] Deploy notification failed:', result.error)
    } else {
      console.log('[Bearos] Deploy notification sent:', result.data?.id)
    }
  }
}
