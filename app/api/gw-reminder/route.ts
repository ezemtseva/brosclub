import { Resend } from 'resend'
import prisma from '../../../lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

const recipients = [
  'Vpolibin@gmail.com',
  'Mhamzin@gmail.com',
  'loguinov.yury@gmail.com',
]

export async function GET() {
  // Find the next upcoming gameweek (first match not yet started)
  const now = new Date()
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  // Find the first upcoming match within the next 25 hours
  const match = await prisma.plMatch.findFirst({
    where: {
      season: '2025/26',
      status: { notIn: ['FINISHED', 'POSTPONED'] },
      kickoff: { lte: in25h },
    },
    orderBy: { kickoff: 'asc' },
  })

  if (!match) {
    return Response.json({ skipped: true, reason: 'No match within 25h' })
  }

  // Check if we already sent a reminder for this gameweek
  const alreadySent = await prisma.plGwReminder.findUnique({
    where: { gameweek: match.gameweek },
  })

  if (alreadySent) {
    return Response.json({ skipped: true, reason: `Reminder for GW${match.gameweek} already sent` })
  }

  const gwDate = match.kickoff.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })

  const result = await resend.emails.send({
    from: 'Bearos Club <noreply@sundaybrosclub.com>',
    to: recipients,
    subject: `⚽ Gameweek ${match.gameweek} starts tomorrow — place your bets!`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h2 style="margin: 0 0 8px;">Gameweek ${match.gameweek} starts tomorrow 🐻</h2>
        <p style="color: #666; margin: 0 0 24px; font-size: 14px;">First match: ${gwDate} (Moscow time)</p>
        <p style="margin: 0 0 12px;">Don't forget to:</p>
        <ul style="margin: 0 0 24px; padding-left: 20px; line-height: 1.8;">
          <li>Place your <strong>Bets Cup</strong> predictions for GW${match.gameweek}</li>
          <li>Update your <strong>Fantasy Premier League</strong> squad</li>
        </ul>
        <a href="https://sundaybrosclub.com/bets" style="display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
          Place bets →
        </a>
      </div>
    `,
  })

  if (result.error) {
    console.error('[Bearos] GW reminder failed:', result.error)
    return Response.json({ error: result.error }, { status: 500 })
  }

  // Mark as sent so we don't send again
  await prisma.plGwReminder.create({ data: { gameweek: match.gameweek } })

  console.log(`[Bearos] GW${match.gameweek} reminder sent:`, result.data?.id)
  return Response.json({ success: true, gameweek: match.gameweek })
}
