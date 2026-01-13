import nodemailer from "nodemailer";

interface SendVerificationRequestParams {
  identifier: string;
  url: string;
  provider: {
    from?: string;
    maxAge?: number;
  };
  baseUrl?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT ?? 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(options: nodemailer.SendMailOptions) {
  return transporter.sendMail(options);
}

export async function sendVerificationRequest(
  params: SendVerificationRequestParams
) {
  const { identifier: email, url, provider } = params;

  const baseUrl = process.env.NEXTAUTH_URL || new URL(url).origin;

  // Magic link expiration time from provider config (default 1 day if not set)
  const maxAge = provider.maxAge ?? 24 * 60 * 60; // seconds
  const expiresInMinutes = Math.floor(maxAge / 60);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Sign in to ${baseUrl}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Poppins:wght@600&display=swap');

    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }

    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #f9fafb;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #111827;
    }

    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f9fafb;
      padding-bottom: 40px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
    }

    .header {
      padding: 40px 0 20px 0;
      text-align: center;
      background-color: #0f172a; /* Slate 900 */
    }

    .header h1 {
      margin: 0;
      color: #ffffff;
      font-family: 'Poppins', sans-serif;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.025em;
    }

    .content {
      padding: 40px;
      text-align: left;
      line-height: 1.6;
    }

    .content p {
      margin: 0 0 20px 0;
      font-size: 16px;
      color: #374151; /* Gray 700 */
    }

    .content p.greeting {
      font-weight: 600;
      font-size: 18px;
      color: #111827;
    }

    .button-container {
      padding: 20px 0;
      text-align: center;
    }

    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #0f172a;
      color: #ffffff !important;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: background-color 0.2s;
    }

    .expiry-note {
      font-size: 14px;
      color: #6b7280; /* Gray 500 */
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #f3f4f6;
    }

    .footer {
      padding: 30px;
      text-align: center;
    }

    .footer p {
      margin: 0;
      font-size: 14px;
      color: #9ca3af;
    }

    /* Dark Mode Styles */
    @media (prefers-color-scheme: dark) {
      body, .wrapper {
        background-color: #0a0a0a !important;
        color: #f9fafb !important;
      }
      .container {
        background-color: #111827 !important;
        border-color: #1f2937 !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4) !important;
      }
      .header {
        background-color: #020617 !important;
      }
      .content p {
        color: #d1d5db !important;
      }
      .content p.greeting {
        color: #f9fafb !important;
      }
      .button {
        background-color: #f9fafb !important;
        color: #0f172a !important;
      }
      .expiry-note {
        color: #9ca3af !important;
        border-top-color: #1f2937 !important;
      }
      .footer p {
        color: #6b7280 !important;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div style="height: 40px;"></div>
    <div class="container">
      <div class="header">
        <h1>Welcome Back</h1>
      </div>
      <div class="content">
        <p class="greeting">Hello,</p>
        <p>You requested a secure link to sign in to <strong>${baseUrl}</strong>. Use the button below to complete the process.</p>
        <div class="button-container">
          <a href="${url}" class="button">Sign In to Your Account</a>
        </div>
        <p class="expiry-note">
          This link will expire in <strong>${expiresInMinutes} minutes</strong> for security reasons.<br>
          If you did not request this email, you can safely ignore it.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${baseUrl}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  const text = `Sign in to ${baseUrl}\n${url}\n\nThis link expires in ${expiresInMinutes} minutes.\nIf you did not request this, ignore this email.`;

  await sendMail({
    to: email,
    from: provider.from ?? process.env.EMAIL_FROM ?? "noreply@example.com",
    subject: `Sign in to ${baseUrl}`,
    html,
    text,
  });
}
