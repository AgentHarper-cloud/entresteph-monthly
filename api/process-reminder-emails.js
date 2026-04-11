import nodemailer from 'nodemailer';

const TURSO_URL   = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

const SMTP = {
  host: 'mail.privateemail.com',
  port: 587,
  secure: false,
  auth: { user: 'steph@entresteph.com', pass: process.env.SMTP_PASS },
};

const INTAKE_URL    = 'https://forms.gle/We52Wkdsy7ZLMCAY8';
const MONTHLY_URL   = 'https://buy.stripe.com/dRm4gz5115AMdi13vcfQI05';
const PDF_URL       = 'https://drive.google.com/file/d/14uP6cE3JhAsDiYFj3WZAqfTPKflfHsnR/view';
const TRIAL_URL     = 'https://trial.entresteph.com';
const TRIAL_STRIPE  = 'https://buy.stripe.com/cNi28rbppd3e4Lv5DkfQI03';
const AFFILIATE_URL = 'https://aimonetizationslive.com/?am_id=stephanie9937';

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

// ── Training Email 2 — Day 2 check-in ───────────────────────────────────────

async function sendTrainingEmail2(email, name) {
  const fn = firstName(name); const greeting = fn ? `Hey ${fn},` : 'Hey,';
  await send(email, 'Did you open it yet?',
    [greeting,'',
     "Just checking in… did you get a chance to open the guide?",'',
     "I know how it goes. You buy something, life happens, and it sits in your inbox untouched for two weeks. I've done it too.",'',
     "So here's your nudge.",'',
     "Open it today and just read Steps 1 and 2. That's it. Don't overthink it, don't try to implement everything at once. Just read those two sections and see what lands.",'',
     "Then reply and tell me — what's your biggest content struggle right now? Is it finding time to create? Knowing what to say? Staying consistent?",'',
     "I ask because I want to make sure the next few emails I send you are actually useful for where you are.",'',
     '— Steph'].join('\n'),
    wrap(p(greeting)+p("Just checking in… did you get a chance to open the guide?")+p("I know how it goes. You buy something, life happens, and it sits in your inbox untouched for two weeks. I've done it too.")+p("So here's your nudge.")+p("Open it today and just read Steps 1 and 2. That's it. Don't overthink it, don't try to implement everything at once. Just read those two sections and see what lands.")+p("Then reply and tell me — what's your biggest content struggle right now? Is it finding time to create? Knowing what to say? Staying consistent?")+p("I ask because I want to make sure the next few emails I send you are actually useful for where you are.")+p('— Steph'))
  );
}

// ── Training Email 3 — Day 4 hook tip ────────────────────────────────────────

async function sendTrainingEmail3(email, name) {
  const fn = firstName(name); const greeting = fn ? `Hey ${fn},` : 'Hey,';
  await send(email, 'The hook trick most people miss',
    [greeting,'',
     "Step 2 of the guide covers multiplying your hooks, but I want to give you something that's not in the guide.",'',
     "Most people record their hook variations one at a time, on different days, in different outfits. That's actually working against you.",'',
     "Here's what works better:",'',
     "Record all your hook variations in one sitting, in the same outfit, back to back. Sounds obvious, but the reason it works is that your energy is consistent across all of them. Same lighting, same background, same vibe. When you batch them this way the content looks intentional instead of scattered.",'',
     "Then take your single best-performing hook and post it with three different captions over three days. Watch which caption drives the most saves and comments. That tells you exactly how your audience wants to be spoken to — and that insight shapes everything you create after that.",'',
     "One filming session. Three posts. Real data.",'',
     "Try it this week and reply to let me know what you find.",'',
     '— Steph','',
     `P.S. If you'd rather skip the filming entirely and just have the content show up in your Google Doc ready to post, that's exactly what my 7-day trial is. Grab a spot here: ${TRIAL_URL}`].join('\n'),
    wrap(p(greeting)+p("Step 2 of the guide covers multiplying your hooks, but I want to give you something that's not in the guide.")+p("Most people record their hook variations one at a time, on different days, in different outfits. That's actually working against you.")+p("<strong>Here's what works better:</strong>")+p("Record all your hook variations in one sitting, in the same outfit, back to back. Sounds obvious, but the reason it works is that your energy is consistent across all of them. Same lighting, same background, same vibe. When you batch them this way the content looks intentional instead of scattered.")+p("Then take your single best-performing hook and post it with three different captions over three days. Watch which caption drives the most saves and comments. That tells you exactly how your audience wants to be spoken to — and that insight shapes everything you create after that.")+p("One filming session. Three posts. Real data.")+p("Try it this week and reply to let me know what you find.")+p('— Steph')+`<p style="font-size:14px;line-height:1.6;color:#666;">P.S. If you'd rather skip the filming entirely and just have the content show up in your Google Doc ready to post, that's exactly what my 7-day trial is. <a href="${TRIAL_URL}" style="color:#C8230F;">Grab a spot here.</a></p>`)
  );
}

// ── Training Email 4 — Day 6 ManyChat ────────────────────────────────────────

async function sendTrainingEmail4(email, name) {
  const fn = firstName(name); const greeting = fn ? `Hey ${fn},` : 'Hey,';
  await send(email, 'The one setup that changes everything',
    [greeting,'',
     "Step 7 of the guide covers ManyChat and I want to make sure you don't skip it.",'',
     "Most people do. It looks technical at first glance and they move on. But this is honestly the setup that makes your content work while you're not watching.",'',
     "Here's the simplest way to get started today:",'',
     "Go to manychat.com and connect your Instagram. It's free. Create one flow with one keyword — I'd start with the word SYSTEM or GUIDE. Write a DM that goes out automatically when someone comments that word. In the DM, send them your lead magnet link.",'',
     "Then go post something on Instagram with this CTA at the end:",'',
     '"Comment SYSTEM below and I\'ll DM you the free guide."','',
     "That's it. Every person who comments gets your lead magnet automatically. You get more engagement, the algorithm pushes your content further, and you're building your list without doing anything extra.",'',
     "Set it up once. Let it run forever.",'',
     "Reply and let me know if you hit any snags — I'm happy to walk you through it.",'',
     '— Steph','',
     `P.S. If setting all of this up feels like too much right now, I get it. That's exactly why the done-for-you trial exists. I handle the content side so you can focus on everything else: ${TRIAL_URL}`].join('\n'),
    wrap(p(greeting)+p("Step 7 of the guide covers ManyChat and I want to make sure you don't skip it.")+p("Most people do. It looks technical at first glance and they move on. But this is honestly the setup that makes your content work while you're not watching.")+p("<strong>Here's the simplest way to get started today:</strong>")+p("Go to manychat.com and connect your Instagram. It's free. Create one flow with one keyword — I'd start with the word SYSTEM or GUIDE. Write a DM that goes out automatically when someone comments that word. In the DM, send them your lead magnet link.")+p('Then go post something on Instagram with this CTA at the end:')+p('<em>"Comment SYSTEM below and I\'ll DM you the free guide."</em>')+p("That's it. Every person who comments gets your lead magnet automatically. You get more engagement, the algorithm pushes your content further, and you're building your list without doing anything extra.")+p("Set it up once. Let it run forever.")+p("Reply and let me know if you hit any snags — I'm happy to walk you through it.")+p('— Steph')+`<p style="font-size:14px;line-height:1.6;color:#666;">P.S. If setting all of this up feels like too much right now, I get it. That's exactly why the done-for-you trial exists. I handle the content side so you can focus on everything else: <a href="${TRIAL_URL}" style="color:#C8230F;">${TRIAL_URL}</a></p>`)
  );
}

// ── Training Email 5 — Day 8 content pillars ─────────────────────────────────

async function sendTrainingEmail5(email, name) {
  const fn = firstName(name); const greeting = fn ? `Hey ${fn},` : 'Hey,';
  await send(email, 'A 5-minute exercise that makes content easy',
    [greeting,'',
     "Step 4 of the guide walks you through building your content pillars. I want to give you a faster way to define yours right now.",'',
     "Open a notes app and answer these three questions:",'',
     "What do I talk about most naturally when someone asks about my business?",'',
     "What does my audience always ask me about or thank me for?",'',
     "What do I wish more people in my space talked about honestly?",'',
     "Your answers are your pillars. Most people have 4-5 themes that show up across all three questions. Write them down, give each one a name, and you've just built the framework for every piece of content you'll create this month.",'',
     "From here, go to Step 4 in the guide and build one reusable caption template for each pillar. You'll have your entire caption library done in one AI session.",'',
     "That's your content foundation. Everything else is just filling it in.",'',
     '— Steph','',
     `P.S. If you've done this exercise and you're thinking "great, now who's going to write the actual content" — that's what the trial is for. Seven days of content built around your pillars, done for you, delivered in 48 hours: ${TRIAL_URL}`].join('\n'),
    wrap(p(greeting)+p("Step 4 of the guide walks you through building your content pillars. I want to give you a faster way to define yours right now.")+p("Open a notes app and answer these three questions:")+`<ul style="font-size:15px;line-height:1.8;padding-left:20px;margin:12px 0;"><li>What do I talk about most naturally when someone asks about my business?</li><li>What does my audience always ask me about or thank me for?</li><li>What do I wish more people in my space talked about honestly?</li></ul>`+p("Your answers are your pillars. Most people have 4–5 themes that show up across all three questions. Write them down, give each one a name, and you've just built the framework for every piece of content you'll create this month.")+p("From here, go to Step 4 in the guide and build one reusable caption template for each pillar. You'll have your entire caption library done in one AI session.")+p("That's your content foundation. Everything else is just filling it in.")+p('— Steph')+`<p style="font-size:14px;line-height:1.6;color:#666;">P.S. If you've done this exercise and you're thinking "great, now who's going to write the actual content" — that's what the trial is for. Seven days of content built around your pillars, done for you, delivered in 48 hours: <a href="${TRIAL_URL}" style="color:#C8230F;">${TRIAL_URL}</a></p>`)
  );
}

// ── Training Email 6 — Day 10 affiliate webinar ───────────────────────────────

async function sendTrainingEmail6(email, name) {
  const fn = firstName(name); const greeting = fn ? `Hey ${fn},` : 'Hey,';
  await send(email, 'What if content was just the beginning?',
    [greeting,'',
     "The guide covers the content side of your business. And if you've been implementing even pieces of it, you're already ahead of most people.",'',
     "But I want to show you something bigger.",'',
     "A few months ago I watched my mentor sit down on a live screen share and build a complete AI-powered business from scratch in 60 minutes. Offer, brand, lead generation system — all of it. While I watched.",'',
     "It completely changed how I think about what's possible.",'',
     "Not just for content. For the whole business.",'',
     "He runs a free live event where he does this on screen — you tell him the niche in the chat and he builds it right there. He shows you the proof of what AI can actually do when you use it the right way.",'',
     `If you've ever thought "I want to build something that runs without me being glued to it" — this is worth an hour of your time.`,'',
     `Watch the free event here: ${AFFILIATE_URL}`,'',
     "Disclosure: This is an affiliate link. If you decide to invest in the full system after the event, I may earn a commission — at no extra cost to you. I only share things I genuinely believe in and have seen work firsthand.",'',
     '— Steph'].join('\n'),
    wrap(p(greeting)+p("The guide covers the content side of your business. And if you've been implementing even pieces of it, you're already ahead of most people.")+p("But I want to show you something bigger.")+p("A few months ago I watched my mentor sit down on a live screen share and build a complete AI-powered business from scratch in 60 minutes. Offer, brand, lead generation system — all of it. While I watched.")+p("It completely changed how I think about what's possible. Not just for content. For the whole business.")+p(`He runs a free live event where he does this on screen — you tell him the niche in the chat and he builds it right there. He shows you the proof of what AI can actually do when you use it the right way.`)+p(`If you've ever thought "I want to build something that runs without me being glued to it" — this is worth an hour of your time.`)+btn(AFFILIATE_URL,'Watch the Free Event')+`<p style="font-size:12px;color:#888;line-height:1.6;font-style:italic;">Disclosure: This is an affiliate link. If you decide to invest in the full system after the event, I may earn a commission — at no extra cost to you. I only share things I genuinely believe in and have seen work firsthand.</p>`+p('— Steph'))
  );
}

// ── Training Email 7 — Day 12 final nudge ────────────────────────────────────

async function sendTrainingEmail7(email, name) {
  const fn = firstName(name); const greeting = fn ? `Hey ${fn},` : 'Hey,';
  await send(email, 'Have you posted yet?',
    [greeting,'',
     "Quick check-in — have you posted anything yet using the system?",'',
     "No judgment if you haven't. Life gets busy and sometimes a guide sits on your desktop longer than you planned. It happens to everyone.",'',
     "But here's the thing — the system only works when you work it. Even one post this week using a hook from the guide is a win. That's one more piece of content than you had before, and one more data point that tells you what your audience responds to.",'',
     `If you've been meaning to start but haven't found the time, that's exactly what the 7-day trial is for. You send me your niche, your existing content, and your handles — and I handle everything else. Content ready to post in 48 hours.`,'',
     `Grab a spot here: ${TRIAL_URL}`,'',
     "And I'd love to hear what you thought about the guide — whether it really helped you or if it made you more confused. I want to make sure it's actually helpful and I'll update anything that's confusing.",'',
     "I'm rooting for you. Reply anytime if you have questions.",'',
     '— Steph'].join('\n'),
    wrap(p(greeting)+p("Quick check-in — have you posted anything yet using the system?")+p("No judgment if you haven't. Life gets busy and sometimes a guide sits on your desktop longer than you planned. It happens to everyone.")+p("But here's the thing — the system only works when you work it. Even one post this week using a hook from the guide is a win. That's one more piece of content than you had before, and one more data point that tells you what your audience responds to.")+p(`If you've been meaning to start but haven't found the time, that's exactly what the 7-day trial is for. You send me your niche, your existing content, and your handles — and I handle everything else. Content ready to post in 48 hours.`)+btn(TRIAL_URL,'Grab a Spot in the Trial')+p("And I'd love to hear what you thought about the guide — whether it really helped you or if it made you more confused. I want to make sure it's actually helpful and I'll update anything that's confusing.")+p("I'm rooting for you. Reply anytime if you have questions.")+p('— Steph'))
  );
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

  // ── 6. Training sequence — Emails 2-7 ───────────────────────────────────
  const trainingDays = [
    { col: 'training_email2_sent', startDay: 2,  endDay: 3,  fn: sendTrainingEmail2 },
    { col: 'training_email3_sent', startDay: 4,  endDay: 5,  fn: sendTrainingEmail3 },
    { col: 'training_email4_sent', startDay: 6,  endDay: 7,  fn: sendTrainingEmail4 },
    { col: 'training_email5_sent', startDay: 8,  endDay: 9,  fn: sendTrainingEmail5 },
    { col: 'training_email6_sent', startDay: 10, endDay: 11, fn: sendTrainingEmail6 },
    { col: 'training_email7_sent', startDay: 12, endDay: 13, fn: sendTrainingEmail7 },
  ];

  counts.training = {};
  for (const { col, startDay, endDay, fn } of trainingDays) {
    const startCutoff = now - (startDay * DAY);
    const endCutoff   = now - (endDay   * DAY);
    const rr = await tursoQuery(
      `SELECT id, email, name FROM entresteph_buyers WHERE product = ? AND paid_at <= ? AND paid_at > ? AND ${col} = 0`,
      [
        { type: 'text',    value: '1-Hour Content Machine' },
        { type: 'integer', value: String(startCutoff) },
        { type: 'integer', value: String(endCutoff) },
      ]
    );
    let sent = 0;
    for (const row of getRows(rr)) {
      const [id, email, name] = [row[0]?.value, row[1]?.value, row[2]?.value];
      if (!email) continue;
      try {
        await fn(email, name);
        await tursoQuery(`UPDATE entresteph_buyers SET ${col} = 1 WHERE id = ?`,
          [{ type: 'integer', value: String(id) }]);
        sent++;
        console.log(`Training ${col} sent to ${email}`);
      } catch (e) { console.error(`${col} failed ${email}:`, e.message); }
    }
    counts.training[col] = sent;
  }

  console.log('Cron complete:', counts);
  res.status(200).json(counts);
}
