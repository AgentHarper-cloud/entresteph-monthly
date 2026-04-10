import Stripe from 'stripe';
import nodemailer from 'nodemailer';

export const config = { api: { bodyParser: false } };

const TURSO_URL      = process.env.TURSO_URL;
const TURSO_TOKEN    = process.env.TURSO_TOKEN;
const STRIPE_KEY     = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const SMTP = {
  host: 'mail.privateemail.com',
  port: 587,
  secure: false,
  auth: { user: 'steph@entresteph.com', pass: process.env.SMTP_PASS },
};

const INTAKE_URL  = 'https://forms.gle/We52Wkdsy7ZLMCAY8';
const MONTHLY_URL = 'https://buy.stripe.com/dRm4gz5115AMdi13vcfQI05';

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
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function firstName(name) {
  return (name || '').split(' ')[0] || '';
}

// ── Email: trial + monthly delivery ─────────────────────────────────────────

async function sendDeliveryEmail(email, name) {
  const transporter = nodemailer.createTransport(SMTP);
  const fn = firstName(name);
  const greeting = fn ? `Hey ${fn},` : 'Hey,';

  await transporter.sendMail({
    from: '"Steph | Entre_Steph" <steph@entresteph.com>',
    to: email,
    subject: "You're in — here's what happens next",
    text: [
      greeting, '',
      'Payment confirmed. Welcome to the Content Machine.', '',
      "Before I can start building your content, I need a few details about your brand. It takes about 5 minutes and the more you give me, the better your content will be.", '',
      'Fill out your intake form here:', INTAKE_URL, '',
      "Once I have your form, I'll get started and have everything delivered within 5 business days.", '',
      'If you have any questions in the meantime, just reply to this email.', '',
      '— Steph',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <p style="font-size:16px;line-height:1.6;">${greeting}</p>
        <p style="font-size:16px;line-height:1.6;">Payment confirmed. Welcome to the Content Machine.</p>
        <p style="font-size:16px;line-height:1.6;">Before I can start building your content, I need a few details about your brand. It takes about 5 minutes — the more you give me, the better your content will be.</p>
        <p style="text-align:center;margin:32px 0;">
          <a href="${INTAKE_URL}" style="background:#C8230F;color:#ffffff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;display:inline-block;">Fill Out Your Intake Form &rarr;</a>
        </p>
        <p style="font-size:16px;line-height:1.6;">Once I have your form, I'll get started and have everything delivered within 5 business days.</p>
        <p style="font-size:16px;line-height:1.6;">If you have any questions in the meantime, just reply to this email.</p>
        <p style="font-size:16px;line-height:1.6;">— Steph</p>
      </div>`,
  });
}

// ── Email 1: upgrade confirmation ────────────────────────────────────────────

async function sendUpgradeConfirmationEmail(email, name) {
  const transporter = nodemailer.createTransport(SMTP);
  const fn = firstName(name);
  const greeting = fn ? `Hey ${fn},` : 'Hey,';

  await transporter.sendMail({
    from: '"Steph | Entre_Steph" <steph@entresteph.com>',
    to: email,
    subject: "You're in — here's what happens next",
    text: [
      greeting, '',
      "Your upgrade is confirmed and I'm already working on your full month of content.", '',
      "Here's what you're getting: 60 reel scripts, 30 carousel concepts, and captions for everything — 90 pieces of content total, scheduled and ready to post every single day for 30 days.", '',
      "Before I finalize everything, take 2 minutes to refresh your content brief. If anything has changed since your trial — new offer, new audience, new direction — update it here so your content stays on point:", '',
      INTAKE_URL, '',
      "Here's what happens next:", '',
      "Your full month of content will be delivered to you within 48 hours in a Google Doc. I'll send you a separate email with the link as soon as it's ready.", '',
      'If you have any questions in the meantime, just reply to this email.', '',
      '— Steph',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <p style="font-size:16px;line-height:1.6;">${greeting}</p>
        <p style="font-size:16px;line-height:1.6;">Your upgrade is confirmed and I'm already working on your full month of content.</p>
        <p style="font-size:16px;line-height:1.6;">Here's what you're getting: 60 reel scripts, 30 carousel concepts, and captions for everything — 90 pieces of content total, scheduled and ready to post every single day for 30 days.</p>
        <p style="font-size:16px;line-height:1.6;">Before I finalize everything, take 2 minutes to refresh your content brief. If anything has changed since your trial — new offer, new audience, new direction — update it here so your content stays on point:</p>
        <p style="text-align:center;margin:32px 0;">
          <a href="${INTAKE_URL}" style="background:#C8230F;color:#ffffff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;display:inline-block;">Refresh Your Content Brief &rarr;</a>
        </p>
        <p style="font-size:16px;line-height:1.6;"><strong>Here's what happens next:</strong></p>
        <p style="font-size:16px;line-height:1.6;">Your full month of content will be delivered to you within 48 hours in a Google Doc. I'll send you a separate email with the link as soon as it's ready.</p>
        <p style="font-size:16px;line-height:1.6;">If you have any questions in the meantime, just reply to this email.</p>
        <p style="font-size:16px;line-height:1.6;">— Steph</p>
      </div>`,
  });
}

// ── handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const rawBody = await getRawBody(req);
  const sig     = req.headers['stripe-signature'];

  let event;
  try {
    const stripe = new Stripe(STRIPE_KEY);
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session   = event.data.object;
  const email     = session.customer_details?.email;
  const rawName   = session.customer_details?.name || '';
  const sessionId = session.id;
  const paidAt    = Math.floor(Date.now() / 1000);
  const amount    = session.amount_total;

  // Identify product by amount
  const product =
    amount === 4500 ? '7-Day Trial' :
    amount === 5400 ? 'Content Machine Upgrade' :
    amount === 9900 ? 'Monthly Content Machine' :
    'Entre_Steph Purchase';

  if (!email) {
    console.error('No email in session:', session.id);
    return res.status(200).json({ received: true });
  }

  // Store buyer (ignore duplicate sessions)
  await tursoQuery(
    'INSERT OR IGNORE INTO entresteph_buyers (email, name, product, stripe_session_id, paid_at, delivery_sent) VALUES (?, ?, ?, ?, ?, 0)',
    [
      { type: 'text',    value: email },
      { type: 'text',    value: rawName },
      { type: 'text',    value: product },
      { type: 'text',    value: sessionId },
      { type: 'integer', value: String(paidAt) },
    ]
  );

  // Send the right email based on product
  try {
    if (product === 'Content Machine Upgrade') {
      await sendUpgradeConfirmationEmail(email, rawName);
    } else {
      await sendDeliveryEmail(email, rawName);
    }

    await tursoQuery(
      'UPDATE entresteph_buyers SET delivery_sent = 1 WHERE stripe_session_id = ?',
      [{ type: 'text', value: sessionId }]
    );
    console.log(`Delivery email sent to ${email} (${product})`);
  } catch (err) {
    console.error('Failed to send delivery email:', err.message);
  }

  res.status(200).json({ received: true });
}
