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

export async function sendVerificationRequest(params: SendVerificationRequestParams) {
    const { identifier: email, url, provider } = params;

    const baseUrl = process.env.NEXTAUTH_URL || new URL(url).origin;

    // Magic link expiration time from provider config (default 1 day if not set)
    const maxAge = provider.maxAge ?? 24 * 60 * 60; // seconds
    const expiresInMinutes = Math.floor(maxAge / 60);

    const html = `
<!DOCTYPE html>
<html lang="en" style="padding:0;margin:0;">
<head>
<meta charset="UTF-8" />
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Sign in</title>

<style>
  :root {
    color-scheme: light dark;
    supported-color-schemes: light dark;
  }

  body {
    margin: 0;
    padding: 0;
    background: #f6f6f6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #222;
  }

  .container {
    max-width: 480px;
    margin: 30px auto;
    background: #ffffff;
    padding: 32px;
    border-radius: 12px;
    border: 1px solid #e5e5e5;
  }

  h1 {
    font-size: 20px;
    margin-bottom: 16px;
    font-weight: 600;
  }

  .button {
    display: inline-block;
    padding: 14px 22px;
    background: #4f46e5;
    color: white !important;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin: 20px 0;
  }

  .footer {
    margin-top: 24px;
    font-size: 12px;
    color: #666;
    text-align: center;
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    body {
      background: #0f0f0f !important;
      color: #eee !important;
    }
    .container {
      background: #1a1a1a !important;
      border-color: #333 !important;
    }
    p, a, h1 {
      color: #eee !important;
    }
    .button {
      background: #6366f1 !important;
      color: white !important;
    }
    .footer {
      color: #aaa !important;
    }
  }
</style>
</head>

<body>
  <div class="container">
    <h1>Sign in to ${baseUrl}</h1>
    <p>Hello,</p>
    <p>Click the button below to sign in:</p>

    <p style="text-align:center;">
      <a href="${url}" class="button">Sign In</a>
    </p>

    <p>This link will expire in <strong>${expiresInMinutes} minutes</strong>.</p>

    <p>If you did not request this, you can safely ignore this email.</p>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${baseUrl}</p>
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