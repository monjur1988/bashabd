// ================================================================
//  BashaBD — Email Helper (src/lib/email.js)
//  These functions call our Vercel API to send emails.
//  Import and use these in App.jsx wherever needed.
// ================================================================

const API_URL = "/api/send-email";

async function sendEmail(type, data) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
    const result = await res.json();
    if (!result.success) {
      console.warn("Email not sent:", result.error);
    }
    return result;
  } catch (err) {
    console.error("Email helper error:", err);
    return { success: false };
  }
}

/* ── NOTIFY OWNER: tenant sent a message ─────────────── */
export async function notifyOwnerNewMessage({
  ownerEmail,
  propertyTitle,
  senderName,
  senderPhone,
  senderEmail,
  subject,
  body,
  prefDate,
  prefTime,
}) {
  return sendEmail("owner_new_message", {
    ownerEmail, propertyTitle,
    senderName, senderPhone, senderEmail,
    subject, body, prefDate, prefTime,
  });
}

/* ── NOTIFY OWNER: inspection booked ────────────────── */
export async function notifyOwnerInspectionBooked({
  ownerEmail,
  propertyTitle,
  tenantName,
  tenantPhone,
  slot,
}) {
  return sendEmail("owner_inspection_booked", {
    ownerEmail, propertyTitle,
    tenantName, tenantPhone, slot,
  });
}

/* ── CONFIRM TO TENANT: message sent ─────────────────── */
export async function confirmTenantMessage({
  tenantEmail,
  tenantName,
  propertyTitle,
  agentName,
  agentPhone,
}) {
  if (!tenantEmail) return; // skip if no email provided
  return sendEmail("tenant_message_sent", {
    tenantEmail, tenantName,
    propertyTitle, agentName, agentPhone,
  });
}

/* ── CONFIRM TO TENANT: inspection booked ────────────── */
export async function confirmTenantInspection({
  tenantEmail,
  tenantName,
  propertyTitle,
  slot,
  location,
  agentName,
  agentPhone,
}) {
  if (!tenantEmail) return;
  return sendEmail("tenant_inspection_confirmed", {
    tenantEmail, tenantName,
    propertyTitle, slot, location,
    agentName, agentPhone,
  });
}

/* ── WELCOME EMAIL: new user registered ──────────────── */
export async function sendWelcomeEmail({ email, name, role }) {
  if (!email) return;
  return sendEmail("welcome", { email, name, role });
}
