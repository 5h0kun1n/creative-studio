/**
 * Netlify event-triggered function: fires on every verified form submission.
 * Sends two emails via Resend:
 *   1. Lead notification to the business owner
 *   2. Auto-reply to the customer
 *
 * Required env vars (set in Netlify dashboard → Site configuration → Environment variables):
 *   RESEND_API_KEY  — from resend.com dashboard
 *   NOTIFY_EMAIL    — where lead alerts go (default: info@creativstudio.co)
 *   FROM_EMAIL      — verified sender in Resend (e.g. quotes@creativstudio.co)
 */

exports.handler = async function (event) {
  const payload = JSON.parse(event.body).payload;
  const data = payload.data || {};
  const formName = payload.form_name || 'unknown';

  if (formName !== 'quote') {
    return { statusCode: 200, body: 'Not a quote form — skipped.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return { statusCode: 500, body: 'Missing API key' };
  }

  const notifyEmail = process.env.NOTIFY_EMAIL || 'info@creativstudio.co';
  const fromEmail = process.env.FROM_EMAIL || 'Creative Studio <onboarding@resend.dev>';

  const name = data.name || 'No name';
  const phone = data.phone || 'No phone';
  const email = data.email || '';
  const city = data.city || '';
  const service = data.service || '';
  const timeline = data.timeline || '';
  const message = data.message || '';
  const utmSource = data.utm_source || '';
  const utmMedium = data.utm_medium || '';
  const utmCampaign = data.utm_campaign || '';

  const serviceLabels = {
    vehicle_wraps: 'Vehicle Wraps',
    custom_signs: 'Custom Signs',
    vinyl_lettering: 'Vinyl Lettering / Decals',
    '3d_lettering': '3D Lettering',
    storefront_window: 'Storefront / Window Graphics',
    banners: 'Banners & Displays',
    fleet_branding: 'Fleet Branding',
    promo_products: 'Promotional Products',
    company_store: 'Company Store Setup',
    other: 'Other',
  };
  const serviceDisplay = serviceLabels[service] || service;

  const timelineLabels = {
    asap: 'ASAP / Rush',
    '1_week': 'Within 1 week',
    '2_weeks': 'Within 2 weeks',
    '1_month': 'Within a month',
    exploring: 'No rush / just exploring',
  };
  const timelineDisplay = timelineLabels[timeline] || timeline;

  // ── Email 1: Notification to business owner ──

  const ownerHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0D0D0D; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #A3E635; margin: 0; font-size: 20px;">New Quote Request</h1>
        <p style="color: #9CA3AF; margin: 8px 0 0; font-size: 14px;">From creativstudio.co/quote</p>
      </div>
      <div style="background: #141414; padding: 32px; border: 1px solid #1f1f1f; border-top: none;">
        <table style="width: 100%; border-collapse: collapse; color: #F5F5F5; font-size: 15px;">
          <tr><td style="padding: 10px 0; color: #9CA3AF; width: 120px; vertical-align: top;">Name</td><td style="padding: 10px 0; font-weight: 600;">${name}</td></tr>
          <tr><td style="padding: 10px 0; color: #9CA3AF; vertical-align: top;">Phone</td><td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #A3E635; text-decoration: none;">${phone}</a></td></tr>
          <tr><td style="padding: 10px 0; color: #9CA3AF; vertical-align: top;">Email</td><td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #A3E635; text-decoration: none;">${email}</a></td></tr>
          <tr><td style="padding: 10px 0; color: #9CA3AF; vertical-align: top;">City</td><td style="padding: 10px 0;">${city}</td></tr>
          <tr><td style="padding: 10px 0; color: #9CA3AF; vertical-align: top;">Service</td><td style="padding: 10px 0; font-weight: 600;">${serviceDisplay}</td></tr>
          ${timeline ? `<tr><td style="padding: 10px 0; color: #9CA3AF; vertical-align: top;">Timeline</td><td style="padding: 10px 0;">${timelineDisplay}</td></tr>` : ''}
          ${message ? `<tr><td style="padding: 10px 0; color: #9CA3AF; vertical-align: top;">Message</td><td style="padding: 10px 0;">${message}</td></tr>` : ''}
        </table>
        ${utmSource ? `
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1f1f1f;">
          <p style="color: #4A4A4A; font-size: 12px; margin: 0;">Source: ${utmSource} / ${utmMedium} / ${utmCampaign}</p>
        </div>` : ''}
      </div>
      <div style="background: #0D0D0D; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #1f1f1f; border-top: none;">
        <p style="color: #4A4A4A; font-size: 12px; margin: 0; text-align: center;">Creative Studio &middot; 658 Griffith Rd, Ste 119, Charlotte NC 28217</p>
      </div>
    </div>`;

  // ── Email 2: Auto-reply to customer ──

  const customerHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0D0D0D; padding: 24px 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #F5F5F5; margin: 0; font-size: 22px;">We got your request!</h1>
      </div>
      <div style="background: #141414; padding: 32px; border: 1px solid #1f1f1f; border-top: none; color: #F5F5F5; font-size: 15px; line-height: 1.7;">
        <p style="margin: 0 0 16px;">Hi ${name.split(' ')[0]},</p>
        <p style="margin: 0 0 16px;">Thanks for reaching out to Creative Studio! We received your quote request for <strong style="color: #A3E635;">${serviceDisplay}</strong> and our team is reviewing it now.</p>
        <p style="margin: 0 0 24px;">We typically respond within a few hours during business hours. If you need something faster, give us a call:</p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="tel:+17043120219" style="display: inline-block; background: #A3E635; color: #000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">(704) 312-0219</a>
        </div>
        <p style="margin: 0; color: #9CA3AF; font-size: 14px;">— The Creative Studio Team</p>
      </div>
      <div style="background: #0D0D0D; padding: 16px 32px; border-radius: 0 0 12px 12px; border: 1px solid #1f1f1f; border-top: none;">
        <p style="color: #4A4A4A; font-size: 12px; margin: 0; text-align: center;">Creative Studio &middot; 658 Griffith Rd, Ste 119, Charlotte NC 28217</p>
      </div>
    </div>`;

  // ── Send both emails ──

  const results = await Promise.allSettled([
    sendEmail(apiKey, {
      from: fromEmail,
      to: [notifyEmail],
      subject: `Quote Request: ${serviceDisplay} — ${name}`,
      html: ownerHtml,
      reply_to: email,
    }),
    email
      ? sendEmail(apiKey, {
          from: fromEmail,
          to: [email],
          subject: 'We got your quote request — Creative Studio',
          html: customerHtml,
        })
      : Promise.resolve({ ok: true }),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`Email ${i} failed:`, r.reason);
  });

  return { statusCode: 200, body: 'Emails sent.' };
};

async function sendEmail(apiKey, payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API ${res.status}: ${text}`);
  }
  return res.json();
}
