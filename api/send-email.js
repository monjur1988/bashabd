// ================================================================
//  BashaBD — Email Notification API
//  File location in your project: api/send-email.js
//
//  This is a Vercel Serverless Function.
//  It runs on the server (not in the browser) so your
//  Resend API key stays secret and safe.
//
//  HOW TO SET UP (5 minutes):
//  1. Go to https://resend.com → Sign up free
//  2. Click "API Keys" → "Create API Key" → copy it
//  3. In Vercel Dashboard → your project → Settings → Environment Variables
//     Add: RESEND_API_KEY = re_xxxxxxxxxxxxxxxxx
//  4. Copy this file to your project at: api/send-email.js
//  5. Redeploy on Vercel — done!
// ================================================================

export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Email service not configured" });
  }

  const { type, data } = req.body;

  // Build the email based on notification type
  let emailPayload;

  switch (type) {

    // ── OWNER: Tenant sent a message ─────────────────────────
    case "owner_new_message":
      emailPayload = {
        from: "BashaBD <onboarding@resend.dev>",
        to: data.ownerEmail,
        subject: `💬 New message about "${data.propertyTitle}" — BashaBD`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.1)">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1a6b3c,#0a3d22);padding:28px 32px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900">🏠 Basha<span style="color:#F5C842">BD</span></h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">Bangladesh's #1 Property Portal</p>
            </div>

            <!-- Body -->
            <div style="padding:32px">
              <div style="background:#f0faf4;border:1px solid #c3e6d0;border-radius:10px;padding:16px;margin-bottom:24px">
                <p style="margin:0;font-size:15px;font-weight:700;color:#1a6b3c">📩 You have a new message!</p>
              </div>

              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;width:35%">From</td>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px">${data.senderName}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px">Phone</td>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px">${data.senderPhone}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px">Property</td>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px">${data.propertyTitle}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px">Subject</td>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px">${data.subject}</td></tr>
                ${data.prefDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px">Preferred Visit</td>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px">📅 ${data.prefDate} · ${data.prefTime}</td></tr>` : ""}
              </table>

              <div style="background:#f8f9fa;border-radius:10px;padding:16px;margin-bottom:24px">
                <p style="margin:0 0 8px;font-size:12px;color:#666;font-weight:700;letter-spacing:0.5px">MESSAGE</p>
                <p style="margin:0;font-size:14px;color:#333;line-height:1.7">${data.body}</p>
              </div>

              <div style="text-align:center;margin-bottom:24px">
                <a href="tel:${data.senderPhone}" style="display:inline-block;background:#1a6b3c;color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-weight:700;font-size:15px;margin-right:10px">
                  📞 Call ${data.senderName}
                </a>
                <a href="https://bashabd-omega.vercel.app" style="display:inline-block;background:#fff;color:#1a6b3c;text-decoration:none;padding:13px 32px;border-radius:10px;font-weight:700;font-size:15px;border:2px solid #1a6b3c">
                  View on BashaBD →
                </a>
              </div>

              <p style="font-size:12px;color:#999;text-align:center;margin:0">
                Reply directly to the tenant or log in to manage your listings at
                <a href="https://bashabd-omega.vercel.app" style="color:#1a6b3c">bashabd-omega.vercel.app</a>
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#0f1f16;padding:20px 32px;text-align:center">
              <p style="color:#4d7a5f;font-size:12px;margin:0">© 2026 BashaBD Limited · Bangladesh's #1 Property Portal</p>
              <p style="color:#2d5040;font-size:11px;margin:6px 0 0">You received this because you are a registered property owner on BashaBD.</p>
            </div>
          </div>
        `,
      };
      break;

    // ── OWNER: Tenant booked an inspection ───────────────────
    case "owner_inspection_booked":
      emailPayload = {
        from: "BashaBD <onboarding@resend.dev>",
        to: data.ownerEmail,
        subject: `📅 Inspection Booked — "${data.propertyTitle}" — BashaBD`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.1)">
            <div style="background:linear-gradient(135deg,#C8102E,#a00d24);padding:28px 32px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900">🏠 Basha<span style="color:#F5C842">BD</span></h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">Inspection Booking Alert</p>
            </div>
            <div style="padding:32px">
              <div style="background:#fdf1f3;border:1px solid #f5d0d6;border-radius:10px;padding:16px;margin-bottom:24px">
                <p style="margin:0;font-size:15px;font-weight:700;color:#C8102E">📅 A tenant wants to inspect your property!</p>
              </div>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;width:35%">Tenant</td>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px">${data.tenantName}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px">Phone</td>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px">${data.tenantPhone}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px">Property</td>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px">${data.propertyTitle}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px">📅 Time Slot</td>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:13px;color:#C8102E">${data.slot}</td></tr>
                <tr><td style="padding:10px 0;color:#666;font-size:13px">Status</td>
                    <td style="padding:10px 0;font-weight:700;font-size:13px">⏳ Awaiting your confirmation</td></tr>
              </table>
              <div style="text-align:center;margin-bottom:20px">
                <a href="tel:${data.tenantPhone}" style="display:inline-block;background:#C8102E;color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-weight:700;font-size:15px;margin-right:10px">
                  📞 Confirm with Tenant
                </a>
              </div>
              <p style="font-size:12px;color:#999;text-align:center;margin:0">
                Log in to manage bookings at <a href="https://bashabd-omega.vercel.app" style="color:#C8102E">bashabd-omega.vercel.app</a>
              </p>
            </div>
            <div style="background:#0f1f16;padding:20px 32px;text-align:center">
              <p style="color:#4d7a5f;font-size:12px;margin:0">© 2026 BashaBD Limited · Bangladesh's #1 Property Portal</p>
            </div>
          </div>
        `,
      };
      break;

    // ── TENANT: Message sent confirmation ────────────────────
    case "tenant_message_sent":
      emailPayload = {
        from: "BashaBD <onboarding@resend.dev>",
        to: data.tenantEmail,
        subject: `✅ Your message was sent — BashaBD`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.1)">
            <div style="background:linear-gradient(135deg,#1a6b3c,#0a3d22);padding:28px 32px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900">🏠 Basha<span style="color:#F5C842">BD</span></h1>
            </div>
            <div style="padding:32px">
              <div style="background:#f0faf4;border:1px solid #c3e6d0;border-radius:10px;padding:16px;margin-bottom:24px">
                <p style="margin:0;font-size:15px;font-weight:700;color:#1a6b3c">✅ Your message was sent successfully!</p>
              </div>
              <p style="font-size:14px;color:#555;line-height:1.7">Hi <strong>${data.tenantName}</strong>,</p>
              <p style="font-size:14px;color:#555;line-height:1.7">Your message about <strong>"${data.propertyTitle}"</strong> has been delivered to the owner/agent. They typically respond within <strong>24 hours</strong>.</p>
              <div style="background:#f8f9fa;border-radius:10px;padding:16px;margin:20px 0">
                <p style="margin:0 0 8px;font-size:12px;color:#666;font-weight:700">AGENT / OWNER CONTACT</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#333">${data.agentName}</p>
                <p style="margin:4px 0 0;font-size:14px;color:#1a6b3c;font-weight:700">${data.agentPhone}</p>
              </div>
              <p style="font-size:13px;color:#999;text-align:center">
                You can also call the agent directly if urgent.<br/>
                <a href="https://bashabd-omega.vercel.app" style="color:#1a6b3c">Continue browsing on BashaBD →</a>
              </p>
            </div>
            <div style="background:#0f1f16;padding:20px 32px;text-align:center">
              <p style="color:#4d7a5f;font-size:12px;margin:0">© 2026 BashaBD Limited</p>
            </div>
          </div>
        `,
      };
      break;

    // ── TENANT: Inspection booked confirmation ───────────────
    case "tenant_inspection_confirmed":
      emailPayload = {
        from: "BashaBD <onboarding@resend.dev>",
        to: data.tenantEmail,
        subject: `📅 Inspection Booked — "${data.propertyTitle}" — BashaBD`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.1)">
            <div style="background:linear-gradient(135deg,#C8102E,#a00d24);padding:28px 32px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900">🏠 Basha<span style="color:#F5C842">BD</span></h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">Inspection Confirmation</p>
            </div>
            <div style="padding:32px">
              <div style="background:#fdf1f3;border:1px solid #f5d0d6;border-radius:10px;padding:16px;margin-bottom:24px">
                <p style="margin:0;font-size:15px;font-weight:700;color:#C8102E">🎉 Your inspection has been booked!</p>
              </div>
              <p style="font-size:14px;color:#555;line-height:1.7">Hi <strong>${data.tenantName}</strong>, your inspection is confirmed. Here are the details:</p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0">
                <tr><td style="padding:12px;background:#f8f9fa;border-radius:8px 8px 0 0;color:#666;font-size:13px;width:40%">🏠 Property</td>
                    <td style="padding:12px;background:#f8f9fa;font-weight:700;font-size:13px">${data.propertyTitle}</td></tr>
                <tr><td style="padding:12px;border-bottom:1px solid #eee;color:#666;font-size:13px">📅 Date & Time</td>
                    <td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;font-size:13px;color:#C8102E">${data.slot}</td></tr>
                <tr><td style="padding:12px;border-bottom:1px solid #eee;color:#666;font-size:13px">📍 Location</td>
                    <td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;font-size:13px">${data.location}</td></tr>
                <tr><td style="padding:12px;border-bottom:1px solid #eee;color:#666;font-size:13px">👤 Agent</td>
                    <td style="padding:12px;border-bottom:1px solid #eee;font-weight:700;font-size:13px">${data.agentName}</td></tr>
                <tr><td style="padding:12px;color:#666;font-size:13px">📞 Agent Phone</td>
                    <td style="padding:12px;font-weight:700;font-size:13px;color:#1a6b3c">${data.agentPhone}</td></tr>
              </table>
              <div style="background:#f0faf4;border-radius:10px;padding:14px;margin-bottom:20px">
                <p style="margin:0;font-size:13px;color:#1a6b3c;font-weight:600">💡 Tips for your inspection:</p>
                <ul style="margin:8px 0 0;padding-left:18px;font-size:13px;color:#555;line-height:1.8">
                  <li>Check water pressure, electricity and gas connections</li>
                  <li>Ask for the Khatian & Porcha documents</li>
                  <li>Note any repairs needed before moving in</li>
                  <li>Ask about included utilities and house rules</li>
                </ul>
              </div>
              <p style="font-size:13px;color:#999;text-align:center">
                <a href="https://bashabd-omega.vercel.app" style="color:#C8102E">View on BashaBD →</a>
              </p>
            </div>
            <div style="background:#0f1f16;padding:20px 32px;text-align:center">
              <p style="color:#4d7a5f;font-size:12px;margin:0">© 2026 BashaBD Limited · Bangladesh's #1 Property Portal</p>
            </div>
          </div>
        `,
      };
      break;

    // ── WELCOME: New user registered ─────────────────────────
    case "welcome":
      emailPayload = {
        from: "BashaBD <onboarding@resend.dev>",
        to: data.email,
        subject: `🏠 Welcome to BashaBD — Bangladesh's #1 Property Portal`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.1)">
            <div style="background:linear-gradient(135deg,#C8102E,#a00d24);padding:32px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900">🏠 Basha<span style="color:#F5C842">BD</span></h1>
              <p style="color:rgba(255,255,255,0.85);margin:10px 0 0;font-size:16px">Welcome to Bangladesh's #1 Property Portal</p>
            </div>
            <div style="padding:36px">
              <h2 style="font-size:20px;color:#111;margin:0 0 12px">আস্সালামু আলাইকুম, ${data.name}! 🎉</h2>
              <p style="font-size:14px;color:#555;line-height:1.8;margin-bottom:20px">
                Your BashaBD account is ready. You are registered as a <strong>${data.role === "owner" ? "🏠 Property Owner" : data.role === "agent" ? "👔 Agent" : "🔍 Tenant / Buyer"}</strong>.
              </p>
              ${data.role === "owner" ? `
              <div style="background:#f0faf4;border:1px solid #c3e6d0;border-radius:10px;padding:16px;margin-bottom:20px">
                <p style="margin:0 0 10px;font-weight:700;color:#1a6b3c;font-size:14px">As a Property Owner you can:</p>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#555;line-height:2">
                  <li>List unlimited properties for free</li>
                  <li>Receive direct messages from tenants</li>
                  <li>Set inspection times for your properties</li>
                  <li>Track views, saves & enquiries per property</li>
                </ul>
              </div>` : `
              <div style="background:#fdf1f3;border:1px solid #f5d0d6;border-radius:10px;padding:16px;margin-bottom:20px">
                <p style="margin:0 0 10px;font-weight:700;color:#C8102E;font-size:14px">As a Tenant you can:</p>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#555;line-height:2">
                  <li>Save your favourite properties</li>
                  <li>Message owners directly</li>
                  <li>Book property inspections online</li>
                  <li>Get notified when new matching properties are listed</li>
                </ul>
              </div>`}
              <div style="text-align:center;margin:28px 0">
                <a href="https://bashabd-omega.vercel.app" style="display:inline-block;background:#C8102E;color:#fff;text-decoration:none;padding:14px 40px;border-radius:12px;font-weight:800;font-size:16px">
                  Start Exploring BashaBD →
                </a>
              </div>
            </div>
            <div style="background:#0f1f16;padding:24px 32px;text-align:center">
              <p style="color:#fff;font-size:14px;font-weight:700;margin:0 0 6px">🏠 Basha<span style="color:#F5C842">BD</span></p>
              <p style="color:#4d7a5f;font-size:12px;margin:0">© 2026 BashaBD Limited · Bangladesh's #1 Property Portal</p>
            </div>
          </div>
        `,
      };
      break;

    default:
      return res.status(400).json({ error: "Unknown email type" });
  }

  // ── SEND via Resend API ───────────────────────────────────
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      return res.status(500).json({ error: result.message || "Failed to send email" });
    }

    return res.status(200).json({ success: true, id: result.id });

  } catch (err) {
    console.error("Email send error:", err);
    return res.status(500).json({ error: "Email service error" });
  }
}
