import nodemailer from 'nodemailer';

const TURSO_URL   = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

const SMTP = {
  host: 'mail.privateemail.com',
  port: 587,
  secure: false,
  auth: { user: 'steph@entresteph.com', pass: process.env.SMTP_PASS },
};

const INTAKE_URL = 'https://forms.gle/We52Wkdsy7ZLMCAY8';

async function tursoQuery(sql, args = []) {
  const res = await fetch(TURSO_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args } },
        { type: 'close' },
      ],
    }),
  });
  return res.json();
}

async function sendReminderEmail(email) {
  const transporter = nodemailer.createTransport(SMTP);

  await transporter.sendMail({
    from: '"Steph | Entre_Steph" <steph@entresteph.com>',
    to: email,
    subject: "Quick reminder — I still need your intake form",
    text: [
      'Hey,',
      '',
      "Just checking in. I haven't received your intake form yet, so I wanted to make sure you saw it.",
      '',
      "I can't start on your content until I have it — and I want to get yours done as quickly as possible.",
      '',
      'It takes 5 minutes:',
      INTAKE_URL,
      '',
      "If you already submitted it, you can ignore this — I'll be in touch once your content is ready.",
      '',
      '— Steph',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <p style="font-size:16px;line-height:1.6;">Hey,</p>
        <p style="font-size:16px;line-height:1.6;">Just checking in. I haven't received your intake form yet, so I wanted to make sure you saw it.</p>
        <p style="font-size:16px;line-height:1.6;">I can't start on your content until I have it — and I want to get yours done as quickly as possible.</p>
        <p style="text-align:center;margin:32px 0;">
          <a href="${INTAKE_URL}" style="background:#C8230F;color:#ffffff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;display:inline-block;">Fill Out Your Intake Form →</a>
        </p>
        <p style="font-size:16px;line-height:1.6;">It takes about 5 minutes.</p>
        <p style="font-size:16px;line-height:1.6;">If you already submitted it, you can ignore this — I'll be in touch once your content is ready.</p>
        <p style="font-size:16px;line-height:1.6;">— Steph</p>
      </div>
    `,
  });
}

export default async function handler(req, res) {
  const cutoff = Math.floor(Date.now() / 1000) - (48 * 60 * 60); // 48h ago

  // Find buyers who paid 48h+ ago and haven't gotten a reminder yet
  const result = await tursoQuery(
    'SELECT id, email FROM entresteph_buyers WHERE paid_at <= ? AND reminder_sent = 0 AND delivery_sent = 1',
    [{ type: 'integer', value: String(cutoff) }]
  );

  const rows = result?.results?.[0]?.response?.result?.rows ?? [];

  if (rows.length === 0) {
    console.log('No reminders to send.');
    return res.status(200).json({ sent: 0 });
  }

  let sent = 0;
  for (const row of rows) {
    const id    = row[0]?.value;
    const email = row[1]?.value;
    if (!email) continue;

    try {
      await sendReminderEmail(email);
      await tursoQuery(
        'UPDATE entresteph_buyers SET reminder_sent = 1 WHERE id = ?',
        [{ type: 'integer', value: String(id) }]
      );
      sent++;
      console.log(`Reminder sent to ${email}`);
    } catch (err) {
      console.error(`Failed to send reminder to ${email}:`, err.message);
    }
  }

  res.status(200).json({ sent });
}
