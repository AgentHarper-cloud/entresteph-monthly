import nodemailer from 'nodemailer';

const TURSO_URL   = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

const SMTP = {
  host: 'mail.privateemail.com',
  port: 587,
  secure: false,
  auth: { user: 'steph@entresteph.com', pass: process.env.SMTP_PASS },
};

const INTAKE_URL   = 'https://forms.gle/We52Wkdsy7ZLMCAY8';
const UPGRADE_URL  = 'https://upgrade.entresteph.com';

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

// ── Email: 48h intake form reminder ─────────────────────────────────────────

async function sendReminderEmail(email) {
  const transporter = nodemailer.createTransport(SMTP);
  await transporter.sendMail({
    from: '"Steph | Entre_Steph" <steph@entresteph.com>',
    to: email,
    subject: 'Quick reminder — I still need your intake form',
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
          <a href="${INTAKE_URL}" style="background:#C8230F;color:#ffffff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;display:inline-block;">Fill Out Your Intake Form &rarr;</a>
        </p>
        <p style="font-size:16px;line-height:1.6;">It takes about 5 minutes.</p>
        <p style="font-size:16px;line-height:1.6;">If you already submitted it, you can ignore this — I'll be in touch once your content is ready.</p>
        <p style="font-size:16px;line-height:1.6;">— Steph</p>
      </div>
    `,
  });
}

// ── Email: Day-6 upgrade offer (trial buyers only) ───────────────────────────

async function sendUpgradeEmail(email, name) {
  const transporter = nodemailer.createTransport(SMTP);
  const firstName = (name || '').split(' ')[0];
  const greeting  = firstName ? `Hey ${firstName},` : 'Hey,';

  const text = [
    greeting,
    '',
    "You should have your trial content in your inbox by now — 14 reel scripts, 7 carousel concepts, and captions ready to go.",
    '',
    "I wanted to check in. Did everything look good? Any tweaks you need before you start posting?",
    '',
    "I also wanted to give you a heads up before your trial wraps up. If you want to keep the content coming, you can upgrade to the full Content Machine this week and your $45 goes straight toward it.",
    '',
    "You'd only pay $54 more to get a full 30 days — 60 reel scripts, 30 carousel concepts, and all your captions, scheduled and ready to post every single day.",
    '',
    "That's $99 total for a month of content you don't have to think about.",
    '',
    "If you're ready to keep going, grab your upgrade here:",
    `${UPGRADE_URL}`,
    '',
    "If the trial was enough for now, no worries at all. I hope it gave you a solid head start.",
    '',
    "Either way, reply and let me know how the content is landing. I love hearing what's working.",
    '',
    '— Steph',
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <p style="font-size:16px;line-height:1.6;">${greeting}</p>
      <p style="font-size:16px;line-height:1.6;">You should have your trial content in your inbox by now — 14 reel scripts, 7 carousel concepts, and captions ready to go.</p>
      <p style="font-size:16px;line-height:1.6;">I wanted to check in. Did everything look good? Any tweaks you need before you start posting?</p>
      <p style="font-size:16px;line-height:1.6;">I also wanted to give you a heads up before your trial wraps up. If you want to keep the content coming, you can upgrade to the full Content Machine this week and your $45 goes straight toward it.</p>
      <p style="font-size:16px;line-height:1.6;">You'd only pay $54 more to get a full 30 days — 60 reel scripts, 30 carousel concepts, and all your captions, scheduled and ready to post every single day.</p>
      <p style="font-size:16px;line-height:1.6;">That's $99 total for a month of content you don't have to think about.</p>
      <p style="font-size:16px;line-height:1.6;">If you're ready to keep going, grab your upgrade here:</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${UPGRADE_URL}" style="background:#C8230F;color:#ffffff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;display:inline-block;">Upgrade Now — $54 &rarr;</a>
      </p>
      <p style="font-size:16px;line-height:1.6;">If the trial was enough for now, no worries at all. I hope it gave you a solid head start.</p>
      <p style="font-size:16px;line-height:1.6;">Either way, reply and let me know how the content is landing. I love hearing what's working.</p>
      <p style="font-size:16px;line-height:1.6;">— Steph</p>
    </div>
  `;

  await transporter.sendMail({
    from: '"Steph | Entre_Steph" <steph@entresteph.com>',
    to: email,
    subject: 'Your trial content + a quick question',
    text,
    html,
  });
}

// ── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const now     = Math.floor(Date.now() / 1000);
  const h48ago  = now - (48 * 60 * 60);
  const day6ago = now - (6 * 24 * 60 * 60);
  const day7ago = now - (7 * 24 * 60 * 60);

  let reminders = 0;
  let upgrades  = 0;

  // ── 1. 48h intake form reminders (all products) ──────────────────────────
  const reminderResult = await tursoQuery(
    'SELECT id, email FROM entresteph_buyers WHERE paid_at <= ? AND reminder_sent = 0 AND delivery_sent = 1',
    [{ type: 'integer', value: String(h48ago) }]
  );
  const reminderRows = reminderResult?.results?.[0]?.response?.result?.rows ?? [];

  for (const row of reminderRows) {
    const id    = row[0]?.value;
    const email = row[1]?.value;
    if (!email) continue;
    try {
      await sendReminderEmail(email);
      await tursoQuery(
        'UPDATE entresteph_buyers SET reminder_sent = 1 WHERE id = ?',
        [{ type: 'integer', value: String(id) }]
      );
      reminders++;
      console.log(`Reminder sent to ${email}`);
    } catch (err) {
      console.error(`Reminder failed for ${email}:`, err.message);
    }
  }

  // ── 2. Day-6 upgrade email (trial buyers only) ───────────────────────────
  const upgradeResult = await tursoQuery(
    'SELECT id, email, name FROM entresteph_buyers WHERE product = ? AND paid_at <= ? AND paid_at > ? AND upgrade_email_sent = 0',
    [
      { type: 'text',    value: '7-Day Trial' },
      { type: 'integer', value: String(day6ago) },
      { type: 'integer', value: String(day7ago) },
    ]
  );
  const upgradeRows = upgradeResult?.results?.[0]?.response?.result?.rows ?? [];

  for (const row of upgradeRows) {
    const id    = row[0]?.value;
    const email = row[1]?.value;
    const name  = row[2]?.value || '';
    if (!email) continue;
    try {
      await sendUpgradeEmail(email, name);
      await tursoQuery(
        'UPDATE entresteph_buyers SET upgrade_email_sent = 1 WHERE id = ?',
        [{ type: 'integer', value: String(id) }]
      );
      upgrades++;
      console.log(`Upgrade email sent to ${email}`);
    } catch (err) {
      console.error(`Upgrade email failed for ${email}:`, err.message);
    }
  }

  console.log(`Done — ${reminders} reminders, ${upgrades} upgrade emails`);
  res.status(200).json({ reminders, upgrades });
}
