import Stripe from 'stripe';
import nodemailer from 'nodemailer';

// Vercel: disable body parsing so we can verify Stripe signature on raw body
export const config = { api: { bodyParser: false } };

const TURSO_URL   = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;
const STRIPE_KEY  = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const SMTP = {
  host: 'mail.privateemail.com',
  port: 587,
  secure: false,
  auth: { user: 'steph@entresteph.com', pass: process.env.SMTP_PASS },
};

const INTAKE_URL = 'https://forms.gle/We52Wkdsy7ZLMCAY8';

// ── helpers ──────────────────────────────────────────────────────────────────

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

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function sendDeliveryEmail(email, firstName) {
  const transporter = nodemailer.createTransport(SMTP);
  const greeting = firstName ? `Hey ${firstName},` : 'Hey,';

  await transporter.sendMail({
    from: '"Steph | Entre_Steph" <steph@entresteph.com>',
    to: email,
    subject: "You're in — here's what happens next",
    text: [
      greeting,
      '',
      "Payment confirmed. Welcome to the Content Machine.",
      '',
      "Before I can start building your content, I need a few details about your brand. It takes about 5 minutes and the more you give me, the better your content will be.",
      '',
      'Fill out your intake form here:',
      INTAKE_URL,
      '',
      "Once I have your form, I'll get started and have everything delivered within 5 business days.",
      '',
      "If you have any questions in the meantime, just reply to this email.",
      '',
      '— Steph',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <p style="font-size:16px;line-height:1.6;">${greeting}</p>
        <p style="font-size:16px;line-height:1.6;">Payment confirmed. Welcome to the Content Machine.</p>
        <p style="font-size:16px;line-height:1.6;">Before I can start building your content, I need a few details about your brand. It takes about 5 minutes — the more you give me, the better your content will be.</p>
        <p style="text-align:center;margin:32px 0;">
          <a href="${INTAKE_URL}" style="background:#C8230F;color:#ffffff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;display:inline-block;">Fill Out Your Intake Form →</a>
        </p>
        <p style="font-size:16px;line-height:1.6;">Once I have your form, I'll get started and have everything delivered within 5 business days.</p>
        <p style="font-size:16px;line-height:1.6;">If you have any questions in the meantime, just reply to this email.</p>
        <p style="font-size:16px;line-height:1.6;">— Steph</p>
      </div>
    `,
  });
}

// ── handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const stripe = new Stripe(STRIPE_KEY);
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;
  const email   = session.customer_details?.email;
  const rawName = session.customer_details?.name || '';
  const firstName = rawName.split(' ')[0] || '';
  const sessionId = session.id;
  const paidAt  = Math.floor(Date.now() / 1000);

  // Identify product by amount (trial=$45=4500, upgrade=$54=5400, monthly=$99=9900)
  const amount = session.amount_total;
  const product =
    amount === 4500 ? '7-Day Trial' :
    amount === 5400 ? 'Content Machine Upgrade' :
    amount === 9900 ? 'Monthly Content Machine' :
    'Entre_Steph Purchase';

  if (!email) {
    console.error('No email in session:', session.id);
    return res.status(200).json({ received: true });
  }

  // Store buyer in Turso (ignore duplicate sessions)
  await tursoQuery(
    'INSERT OR IGNORE INTO entresteph_buyers (email, name, product, stripe_session_id, paid_at, delivery_sent) VALUES (?, ?, ?, ?, ?, 0)',
    [
      { type: 'text', value: email },
      { type: 'text', value: rawName },
      { type: 'text', value: product },
      { type: 'text', value: sessionId },
      { type: 'integer', value: String(paidAt) },
    ]
  );

  // Send delivery email
  try {
    await sendDeliveryEmail(email, firstName);
    await tursoQuery(
      'UPDATE entresteph_buyers SET delivery_sent = 1 WHERE stripe_session_id = ?',
      [{ type: 'text', value: sessionId }]
    );
    console.log(`Delivery email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send delivery email:', err.message);
  }

  res.status(200).json({ received: true });
}
