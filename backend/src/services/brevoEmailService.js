const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_NAME = 'Vijaya Siri';

function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    throw new Error('Brevo API key is not configured');
  }
  if (!senderEmail) {
    throw new Error('Brevo sender email is not configured');
  }

  return { apiKey, senderEmail };
}

function buildOTPEmailHTML(fullName, otp) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#e8722a;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Vijaya Siri</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:600;">Verify Your Email</h2>
              <p style="margin:0 0 8px;color:#555;font-size:15px;line-height:1.5;">Hi ${fullName},</p>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.5;">Use the following OTP to complete your registration:</p>
              <div style="background-color:#f8f8f8;border:2px dashed #e8722a;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
                <span style="font-size:32px;font-weight:700;color:#e8722a;letter-spacing:8px;">${otp}</span>
              </div>
              <p style="margin:0 0 8px;color:#888;font-size:13px;line-height:1.5;">This OTP is valid for <strong>2 minutes</strong>.</p>
              <p style="margin:0;color:#888;font-size:13px;line-height:1.5;">If you did not request this, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f8f8;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;color:#aaa;font-size:12px;">&copy; ${new Date().getFullYear()} Vijaya Siri. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendOTPEmail(email, otp, fullName) {
  const { apiKey, senderEmail } = getBrevoConfig();

  const payload = {
    sender: { name: SENDER_NAME, email: senderEmail },
    to: [{ email }],
    subject: `Your Verification Code - ${otp}`,
    htmlContent: buildOTPEmailHTML(fullName, otp),
  };

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error('Brevo API error:', response.status, errorBody);
    throw new Error('Failed to send verification email. Please try again.');
  }

  return true;
}

export { sendOTPEmail };
