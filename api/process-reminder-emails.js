import nodemailer from 'nodemailer';

const TURSO_URL   = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

const SMTP = {
  host: 'mail.privateemail.com',
  port: 587,
  secure: false,
  auth: { user: 'steph@entresteph.com', pass: process.env.SMTP_PASS },
};

const INTAKE_URL  = 'https://forms.gle/We52Wkdsy7ZLMCAY8';
const MONTHLY_URL = 'https://buy.stripe.com/dRm4gz5115AMdi13vcfQI05';

const DAY = 24 * 60 * 60;

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

function getRows(result) {
  return result?.results?.[0]?.response?.result?.rows ?? [];
}

function firstName(name) {
  return (name || '').split(' ')[0] || '';
}

// ── send helper ──────────────────────────────────────────────────────────────

async function send(email, subject, text, html) {
  const transporter = nodemailer.createTransport(SMTP);
  await transporter.sendMail({
    from: '"Steph | Entre_Steph" <steph@entresteph.com>',
    to: email,
    subject,
    text,
    html,
  });
}

function wrap(body) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">${body}</div>`;
}

function p(t) {
  return `<p style="font-size:16px;line-height:1.6;">${t}</p>`;
}

function btn(url, label) {
  return `<p style="text-align:center;margin:32px 0;"><a href="${url}" style="background:#C8230F;color:#ffffff;font-size:16px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;display:inline-block;">${label} &rarr;</a></p>`;
}

// ── Email: 48h intake form reminder (all products) ───────────────────────────

async function sendIntakeReminder(email) {
  const subject = 'Quick reminder — I still need your intake form';
  const text = [
    'Hey,', '',
    "Just checking in. I haven't received your intake form yet, so I wanted to make sure you saw it.", '',
    "I can't start on your content until I have it — and I want to get yours done as quickly as possible.", '',
    'It takes 5 minutes:', INTAKE_URL, '',
    "If you already submitted it, you can ignore this — I'll be in touch once your content is ready.", '',
    '— Steph',
  ].join('\n');
  const html = wrap(
    p('Hey,') +
    p("Just checking in. I haven't received your intake form yet, so I wanted to make sure you saw it.") +
    p("I can't start on your content until I have it — and I want to get yours done as quickly as possible.") +
    btn(INTAKE_URL, 'Fill Out Your Intake Form') +
    p("If you already submitted it, you can ignore this — I'll be in touch once your content is ready.") +
    p('— Steph')
  );
  await send(email, subject, text, html);
}

// ── Email: Day 6 upgrade offer (trial buyers) ────────────────────────────────

async function sendTrialUpgradeEmail(email, name) {
  const fn = firstName(name);
  const greeting = fn ? `Hey ${fn},` : 'Hey,';
  const subject = 'Your trial content + a quick question';
  const text = [
    greeting, '',
    "You should have your trial content in your inbox by now — 14 reel scripts, 7 carousel concepts, and captions ready to go.", '',
    "I wanted to check in. Did everything look good? Any tweaks you need before you start posting?", '',
    "I also wanted to give you a heads up before your trial wraps up. If you want to keep the content coming, you can upgrade to the full Content Machine this week and your $45 goes straight toward it.", '',
    "You'd only pay $54 more to get a full 30 days — 60 reel scripts, 30 carousel concepts, and all your captions, scheduled and ready to post every single day.", '',
    "That's $99 total for a month of content you don't have to think about.", '',
    "If you're ready to keep going, grab your upgrade here:", 'https://upgrade.entresteph.com', '',
    "If the trial was enough for now, no worries at all. I hope it gave you a solid head start.", '',
    "Either way, reply and let me know how the content is landing. I love hearing what's working.", '',
    '— Steph',
  ].join('\n');
  const html = wrap(
    p(greeting) +
    p("You should have your trial content in your inbox by now — 14 reel scripts, 7 carousel concepts, and captions ready to go.") +
    p("I wanted to check in. Did everything look good? Any tweaks you need before you start posting?") +
    p("I also wanted to give you a heads up before your trial wraps up. If you want to keep the content coming, you can upgrade to the full Content Machine this week and your $45 goes straight toward it.") +
    p("You'd only pay $54 more to get a full 30 days — 60 reel scripts, 30 carousel concepts, and all your captions, scheduled and ready to post every single day.") +
    p("That's $99 total for a month of content you don't have to think about.") +
    btn('https://upgrade.entresteph.com', 'Upgrade Now — $54') +
    p("If the trial was enough for now, no worries at all. I hope it gave you a solid head start.") +
    p("Either way, reply and let me know how the content is landing. I love hearing what's working.") +
    p('— Steph')
  );
  await send(email, subject, text, html);
}

// ── Email 3: Halfway check-in (upgrade buyers, Day 15) ───────────────────────

async function sendUpgradeEmail3(email, name) {
  const fn = firstName(name);
  const greeting = fn ? `Hey ${fn},` : 'Hey,';
  const subject = "Halfway through — how's it going?";
  const text = [
    greeting, '',
    "You're halfway through your month of content and I wanted to check in.", '',
    "How's it landing? Are you getting engagement, questions, new followers? Any topics that are hitting harder than others?", '',
    "If anything needs adjusting for the second half of your month — different angles, different hooks, anything — just reply and let me know. I can swap things out before you get there.", '',
    "This is your content system. It should feel like you.", '',
    '— Steph',
  ].join('\n');
  const html = wrap(
    p(greeting) +
    p("You're halfway through your month of content and I wanted to check in.") +
    p("How's it landing? Are you getting engagement, questions, new followers? Any topics that are hitting harder than others?") +
    p("If anything needs adjusting for the second half of your month — different angles, different hooks, anything — just reply and let me know. I can swap things out before you get there.") +
    p("This is your content system. It should feel like you.") +
    p('— Steph')
  );
  await send(email, subject, text, html);
}

// ── Email 4: Renewal reminder (upgrade buyers, Day 25) ───────────────────────

async function sendUpgradeEmail4(email, name) {
  const fn = firstName(name);
  const greeting = fn ? `Hey ${fn},` : 'Hey,';
  const subject = 'Your Content Machine renews in 5 days';
  const text = [
    greeting, '',
    "Your first month is almost done and I wanted to reach out before it wraps up.", '',
    "If you want to keep your content flowing, your next month kicks off automatically at $99. Nothing you need to do — it just keeps going.", '',
    "Before your next month starts, take 2 minutes to refresh your content brief. If your offer, audience, or focus has shifted, update it here so your next 30 days stays on point:", '',
    INTAKE_URL, '',
    "If you're not already on the recurring plan and want to lock it in, grab your spot here:", MONTHLY_URL, '',
    "Cancel anytime before your renewal date, no questions asked.", '',
    "Either way, reply and let me know how the month went. I love hearing what's working.", '',
    '— Steph',
  ].join('\n');
  const html = wrap(
    p(greeting) +
    p("Your first month is almost done and I wanted to reach out before it wraps up.") +
    p("If you want to keep your content flowing, your next month kicks off automatically at $99. Nothing you need to do — it just keeps going.") +
    p("Before your next month starts, take 2 minutes to refresh your content brief. If your offer, audience, or focus has shifted, update it here so your next 30 days stays on point:") +
    btn(INTAKE_URL, 'Refresh Your Content Brief') +
    p("If you're not already on the recurring plan and want to lock it in, grab your spot here:") +
    btn(MONTHLY_URL, 'Get the Monthly Plan — $99/month') +
    p("Cancel anytime before your renewal date, no questions asked.") +
    p("Either way, reply and let me know how the month went. I love hearing what's working.") +
    p('— Steph')
  );
  await send(email, subject, text, html);
}

// ── Email 5: Final renewal reminder (upgrade buyers, Day 28) ─────────────────

async function sendUpgradeEmail5(email, name) {
  const fn = firstName(name);
  const greeting = fn ? `Hey ${fn},` : 'Hey,';
  const subject = 'Quick heads up before your content renews';
  const text = [
    greeting, '',
    "Just a quick note — your Content Machine renews in a few days.", '',
    "If you're all set and want to keep going, you're good. Your next 30 days of content will be on its way shortly after renewal.", '',
    "If anything has changed and you need to pause or cancel, just reply to this email before your renewal date and I'll take care of it — no hassle, no questions.", '',
    "Looking forward to another month of content with you.", '',
    '— Steph',
  ].join('\n');
  const html = wrap(
    p(greeting) +
    p("Just a quick note — your Content Machine renews in a few days.") +
    p("If you're all set and want to keep going, you're good. Your next 30 days of content will be on its way shortly after renewal.") +
    p("If anything has changed and you need to pause or cancel, just reply to this email before your renewal date and I'll take care of it — no hassle, no questions.") +
    p("Looking forward to another month of content with you.") +
    p('— Steph')
  );
  await send(email, subject, text, html);
}

// ── handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const now = Math.floor(Date.now() / 1000);

  const windows = {
    h48:   now - (2  * DAY),
    d6s:   now - (6  * DAY),
    d6e:   now - (7  * DAY),
    d15s:  now - (15 * DAY),
    d15e:  now - (16 * DAY),
    d25s:  now - (25 * DAY),
    d25e:  now - (26 * DAY),
    d28s:  now - (28 * DAY),
    d28e:  now - (29 * DAY),
  };

  let counts = { reminders: 0, trialUpgrades: 0, email3: 0, email4: 0, email5: 0 };

  // ── 1. 48h intake reminders (all products) ───────────────────────────────
  const r1 = await tursoQuery(
    'SELECT id, email FROM entresteph_buyers WHERE paid_at <= ? AND reminder_sent = 0 AND delivery_sent = 1',
    [{ type: 'integer', value: String(windows.h48) }]
  );
  for (const row of getRows(r1)) {
    const [id, email] = [row[0]?.value, row[1]?.value];
    if (!email) continue;
    try {
      await sendIntakeReminder(email);
      await tursoQuery('UPDATE entresteph_buyers SET reminder_sent = 1 WHERE id = ?',
        [{ type: 'integer', value: String(id) }]);
      counts.reminders++;
    } catch (e) { console.error(`Reminder failed ${email}:`, e.message); }
  }

  // ── 2. Day-6 trial upgrade offer ─────────────────────────────────────────
  const r2 = await tursoQuery(
    'SELECT id, email, name FROM entresteph_buyers WHERE product = ? AND paid_at <= ? AND paid_at > ? AND upgrade_email_sent = 0',
    [
      { type: 'text',    value: '7-Day Trial' },
      { type: 'integer', value: String(windows.d6s) },
      { type: 'integer', value: String(windows.d6e) },
    ]
  );
  for (const row of getRows(r2)) {
    const [id, email, name] = [row[0]?.value, row[1]?.value, row[2]?.value];
    if (!email) continue;
    try {
      await sendTrialUpgradeEmail(email, name);
      await tursoQuery('UPDATE entresteph_buyers SET upgrade_email_sent = 1 WHERE id = ?',
        [{ type: 'integer', value: String(id) }]);
      counts.trialUpgrades++;
    } catch (e) { console.error(`Trial upgrade failed ${email}:`, e.message); }
  }

  // ── 3. Upgrade sequence Email 3 — Day 15 halfway check-in ────────────────
  const r3 = await tursoQuery(
    'SELECT id, email, name FROM entresteph_buyers WHERE product = ? AND paid_at <= ? AND paid_at > ? AND upgrade_seq_email3_sent = 0',
    [
      { type: 'text',    value: 'Content Machine Upgrade' },
      { type: 'integer', value: String(windows.d15s) },
      { type: 'integer', value: String(windows.d15e) },
    ]
  );
  for (const row of getRows(r3)) {
    const [id, email, name] = [row[0]?.value, row[1]?.value, row[2]?.value];
    if (!email) continue;
    try {
      await sendUpgradeEmail3(email, name);
      await tursoQuery('UPDATE entresteph_buyers SET upgrade_seq_email3_sent = 1 WHERE id = ?',
        [{ type: 'integer', value: String(id) }]);
      counts.email3++;
    } catch (e) { console.error(`Email3 failed ${email}:`, e.message); }
  }

  // ── 4. Upgrade sequence Email 4 — Day 25 renewal reminder ────────────────
  const r4 = await tursoQuery(
    'SELECT id, email, name FROM entresteph_buyers WHERE product = ? AND paid_at <= ? AND paid_at > ? AND upgrade_seq_email4_sent = 0',
    [
      { type: 'text',    value: 'Content Machine Upgrade' },
      { type: 'integer', value: String(windows.d25s) },
      { type: 'integer', value: String(windows.d25e) },
    ]
  );
  for (const row of getRows(r4)) {
    const [id, email, name] = [row[0]?.value, row[1]?.value, row[2]?.value];
    if (!email) continue;
    try {
      await sendUpgradeEmail4(email, name);
      await tursoQuery('UPDATE entresteph_buyers SET upgrade_seq_email4_sent = 1 WHERE id = ?',
        [{ type: 'integer', value: String(id) }]);
      counts.email4++;
    } catch (e) { console.error(`Email4 failed ${email}:`, e.message); }
  }

  // ── 5. Upgrade sequence Email 5 — Day 28 final reminder ──────────────────
  const r5 = await tursoQuery(
    'SELECT id, email, name FROM entresteph_buyers WHERE product = ? AND paid_at <= ? AND paid_at > ? AND upgrade_seq_email5_sent = 0',
    [
      { type: 'text',    value: 'Content Machine Upgrade' },
      { type: 'integer', value: String(windows.d28s) },
      { type: 'integer', value: String(windows.d28e) },
    ]
  );
  for (const row of getRows(r5)) {
    const [id, email, name] = [row[0]?.value, row[1]?.value, row[2]?.value];
    if (!email) continue;
    try {
      await sendUpgradeEmail5(email, name);
      await tursoQuery('UPDATE entresteph_buyers SET upgrade_seq_email5_sent = 1 WHERE id = ?',
        [{ type: 'integer', value: String(id) }]);
      counts.email5++;
    } catch (e) { console.error(`Email5 failed ${email}:`, e.message); }
  }

  console.log('Cron complete:', counts);
  res.status(200).json(counts);
}
