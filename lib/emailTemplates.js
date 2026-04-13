export const VERIFY_EMAIL = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" style="background:#ffffff; margin:20px; border-radius:10px; overflow:hidden;">
          
          <!-- Header Image -->
          <tr>
            <td>
              <img src="https://via.placeholder.com/600x200" width="100%" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px;">
              <h2>Verify Your Email</h2>
              <p>Thanks for signing up! Please confirm your email address by using this token</p>

              <p
                 style="display:inline-block; padding:12px 20px; background:#4CAF50; color:#fff; text-decoration:none; border-radius:5px;">
                {{token}}
              </p>

              <p style="margin-top:20px;">If you didn’t create an account, you can ignore this email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px; text-align:center; font-size:12px; color:#888;">
              © 2026 Your Company
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const VERIFY_EMAIL_SUCCESS = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Email Verified</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f4; font-family: Arial;">
  <table width="100%">
    <tr>
      <td align="center">
        <table width="600" style="background:#fff; margin:20px; border-radius:10px;">
          
          <tr>
            <td align="center">
              <img src="https://via.placeholder.com/150?text=Success" />
            </td>
          </tr>

          <tr>
            <td style="padding:30px; text-align:center;">
              <h2>🎉 Email Verified Successfully!</h2>
              <p>Welcome to our platform. Your account is now active.</p>

              <a href="{{LOGIN_URL}}" 
                 style="padding:12px 20px; background:#007BFF; color:#fff; text-decoration:none; border-radius:5px;">
                Get Started
              </a>
            </td>
          </tr>

          <tr>
            <td style="text-align:center; font-size:12px; color:#888;">
              Let’s build something amazing 🚀
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

export const PASSWORD_RESET_EMAIL = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f4; font-family: Arial;">
  <table width="100%">
    <tr>
      <td align="center">
        <table width="600" style="background:#fff; margin:20px; border-radius:10px;">
          
          <tr>
            <td>
              <img src="https://via.placeholder.com/600x200?text=Reset+Password" width="100%" />
            </td>
          </tr>

          <tr>
            <td style="padding:30px;">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password.</p>

              <a href="{{RESET_URL}}" 
                 style="display:inline-block; padding:12px 20px; background:#e63946; color:#fff; text-decoration:none; border-radius:5px;">
                Reset Password
              </a>

              <p style="margin-top:20px;">
                This link will expire in 10 minutes.
              </p>

              <p>If you didn’t request this, ignore this email.</p>
            </td>
          </tr>

          <tr>
            <td style="text-align:center; font-size:12px; color:#888;">
              Stay secure 🔐
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

export const PASSWORD_RESET_SUCCESS = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset Successful</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f4; font-family: Arial;">
  <table width="100%">
    <tr>
      <td align="center">
        <table width="600" style="background:#fff; margin:20px; border-radius:10px;">
          
          <tr>
            <td align="center">
              <img src="https://via.placeholder.com/150?text=Done" />
            </td>
          </tr>

          <tr>
            <td style="padding:30px; text-align:center;">
              <h2>Password Updated Successfully</h2>
              <p>Your password has been changed. You can now log in with your new password.</p>

              <a href="{{LOGIN_URL}}" 
                 style="padding:12px 20px; background:#28a745; color:#fff; text-decoration:none; border-radius:5px;">
                Login Now
              </a>

              <p style="margin-top:20px; font-size:14px;">
                If you didn’t perform this action, contact support immediately.
              </p>
            </td>
          </tr>

          <tr>
            <td style="text-align:center; font-size:12px; color:#888;">
              Security matters 🔐
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`