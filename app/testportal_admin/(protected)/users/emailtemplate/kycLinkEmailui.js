export function generateKycEmailTemplate(params) {
  const KycEmailTemplate = `   
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Template</title>
  </head>
  <body>
    <div
      class="container"
      style="
        width: 100%;
        margin: 0;
        background-color: #27ae601a;
        font-family: 'Montserrat', sans-serif;
        box-sizing: border-box;
        padding: 1rem;
        max-width: 600px;
        margin: auto;
      "
    >
      <div
        class="logo"
        style="
          width: 100%;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            gap: 0.9rem;
            font-size: 1.3rem;
            font-weight: 800;
          "
        >
          S K I L L <span style="color: #27ae60"> M E D H A</span>
        </div>
      </div>

      <div
        class="title"
        style="
          margin-top: 4rem;
          text-align: center;
          font-weight: 700;
          font-size: 1.725rem;
          line-height: 2.31rem;
          color: #27ae60;
          margin: 1.125rem 0;
        "
      >
        KYC Verification Request for Your
        <span style="color: #27ae60">Skill Medha</span> Account
      </div>

      <div
        class="message"
        style="
          font-weight: 700;
          font-size: 1.2rem;
          line-height: 2.32rem;
          color: #000000ff;
          margin: 1rem 0;
        "
      >
        Dear ${params.userName},<br />Please Open the link to verify your kyc
      </div>

      <div>
        <div style="width: 100%; text-align: center">
          <a
            href="${params.url}"
            style="
              margin: 0;
              text-align: center;
              background-color: #27ae60;
              color: white;
              text-decoration: none;
              font-weight: 600;
              padding: 0.6rem 2rem;
              border-radius: 8px;
              box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
                rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
            "
            >KYC LINK</a
          >
        </div>
      </div>

      <div
        class="info-text"
        style="
          font-weight: 700;
          font-size: 1rem;
          line-height: 1.52rem;
          color: #000000ff;
          margin-top: 1.25rem;
        "
      >
        Thank you,<br />
        <span style="color: #27ae60">Skill Medha</span> Support Team
      </div>

      <div
        class="footer"
        style="
          display: flex;
          align-items: center;
          gap: 0.9rem;
          font-size: 1.3rem;
          font-weight: 800;
          text-align: center;
          justify-content: center;
          margin-top: 1rem;
        "
      >
        S K I L L <span style="color: #27ae60"> M E D H A</span>
      </div>
    </div>
  </body>
</html>
    `;
  return KycEmailTemplate;
}

// ✅ UNIFIED EMAIL TEMPLATE GENERATOR
export const generateKYCEmailHTML = (email, name, kycLink) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KYC Verification - Skill Medha</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #27ae60 0%, #1a7d7f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <div style="background-color: rgba(255,255,255,0.2); display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 3px;">
                  SKILL <span style="font-weight: 300;">MEDHA</span>
                </h1>
              </div>
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; letter-spacing: 1px;">
                Empowering Your Future
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-bottom: 30px;">
                    <div style="display: inline-block; background-color: #f0f9fa; padding: 20px; border-radius: 50%; margin-bottom: 20px;">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#27ae60"/>
                      </svg>
                    </div>
                    <h2 style="margin: 0 0 10px; color: #27ae60; font-size: 28px; font-weight: 700;">
                      KYC Verification Required
                    </h2>
                    <p style="margin: 0; color: #999; font-size: 14px; letter-spacing: 0.5px;">
                      COMPLETE YOUR IDENTITY VERIFICATION
                    </p>
                  </td>
                </tr>
              </table>
              
              <div style="background: linear-gradient(to right, #f8f9fa, #ffffff, #f8f9fa); height: 1px; margin: 30px 0;"></div>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello <strong style="color: #27ae60;">${name || email}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.8;">
                To ensure the security of your account and complete your registration on <strong>Skill Medha</strong>, we need to verify your identity. This quick verification process helps us maintain a safe and trusted learning environment.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 25px 0;">
                    <a href="${kycLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #1a7d7f 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; padding: 18px 50px; border-radius: 50px; box-shadow: 0 6px 20px rgba(37, 163, 166, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                      ✓ Verify My Identity
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Info Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 35px 0; background: linear-gradient(135deg, #f0f9fa 0%, #e6f7f8 100%); border-left: 5px solid #27ae60; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px;">
                    <p style="margin: 0 0 15px; color: #27ae60; font-size: 15px; font-weight: 700;">
                      <span style="font-size: 20px; margin-right: 10px;">⚡</span> Quick Tips for Successful Verification:
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #27ae60; margin-right: 10px;">✔</span>
                          <span style="color: #555555; font-size: 14px; line-height: 1.6;">Keep your identity documents ready (Aadhaar/PAN/Passport)</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #27ae60; margin-right: 10px;">✔</span>
                          <span style="color: #555555; font-size: 14px; line-height: 1.6;">Ensure good lighting for clear photo verification</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #27ae60; margin-right: 10px;">✔</span>
                          <span style="color: #555555; font-size: 14px; line-height: 1.6;">The entire process takes only 2-3 minutes</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fff9e6; border-radius: 8px; border: 1px solid #ffe9a0;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #d48806; font-size: 13px; font-weight: 600;">
                      🔒 SECURITY NOTICE
                    </p>
                    <p style="margin: 0; color: #8c6e00; font-size: 12px; line-height: 1.6;">
                      This verification link will expire in <strong>30 days</strong> for your security.<br/>
                      Never share this link with anyone else.
                    </p>
                  </td>
                </tr>
              </table>
              
              <div style="background: linear-gradient(to right, #f8f9fa, #ffffff, #f8f9fa); height: 1px; margin: 35px 0;"></div>
              
              <p style="margin: 0 0 10px; color: #888888; font-size: 13px; line-height: 1.5; text-align: center;">
                Having trouble with the button? Copy and paste this link:
              </p>
              <p style="margin: 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px; color: #27ae60; font-size: 11px; word-break: break-all; text-align: center; font-family: 'Courier New', monospace;">
                ${kycLink}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(to bottom, #ffffff, #f8f9fa); border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 15px; font-weight: 600;">
                Need Assistance?
              </p>
              <p style="margin: 0 0 25px; color: #666666; font-size: 14px; line-height: 1.6;">
                Our support team is here to help you<br/>
                <a href="mailto:support@skillmedha.com" style="color: #27ae60; text-decoration: none; font-weight: 600;">support@skillmedha.com</a>
              </p>
              
              <div style="background: linear-gradient(to right, #e0e0e0, transparent, #e0e0e0); height: 1px; margin: 30px 0;"></div>
              
              <div style="background-color: rgba(37, 163, 166, 0.1); display: inline-block; padding: 15px 30px; border-radius: 50px; margin-bottom: 20px;">
                <p style="margin: 0; color: #27ae60; font-size: 20px; font-weight: 700; letter-spacing: 2px;">
                  SKILL <span style="font-weight: 300;">MEDHA</span>
                </p>
              </div>
              
              <p style="margin: 0 0 15px; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Skill Medha. All rights reserved.
              </p>
              
              <p style="margin: 0; color: #bbbbbb; font-size: 11px; line-height: 1.5;">
                You're receiving this email because you registered on Skill Medha.<br/>
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
