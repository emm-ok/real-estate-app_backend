import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { generateToken } from "../../utils/token.js";
import { generatePasswordResetToken } from "../../utils/passwordResetToken.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/sendEmail.js";
import {
  PASSWORD_RESET_EMAIL,
  PASSWORD_RESET_SUCCESS,
  VERIFY_EMAIL,
  VERIFY_EMAIL_SUCCESS,
} from "../../lib/emailTemplates.js";

export const register = async (req, res) => {
  try {
    // Parsed data using zod
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(parsed.error.format());
    }

    // Get data from client
    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Verify if user with email already exists
    if (existingUser) {
      return res.status(404).json({
        message: "User already exists with this email !",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: new Date(Date.now() + 86400000), // 24 hours or 1 day
      },
    });

    generateToken(user.id, res);

    await sendEmail({
      subject: "Email Verification",
      html: VERIFY_EMAIL.replace("{{token}}", verificationToken),
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const updatedUser = await prisma.user.updateMany({
      where: {
        email,
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationExpiresAt: { gt: new Date() },
      },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });

    if (updatedUser.count === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    await sendEmail({
      subject: "Email Verification Successful",
      html: VERIFY_EMAIL_SUCCESS.replace(
        "{{LOGIN_URL}}",
        `${env.CLIENT_URL}/sign-in`,
      ),
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify email",
    });
  }
};

export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(parsed.error.format());
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    // Generate JWT Token
    generateToken(user.id, res);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
      },
      message: "User login successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email exists, a reset link has been sent",
      });
    }

    const { rawToken, hashedToken } = generatePasswordResetToken();

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
      },
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}&email=${email}`;

    // ***** Send Email to user *****
    await sendEmail({
      subject: "Request for Password Reset",
      html: PASSWORD_RESET_EMAIL.replace("{{RESET_URL}}", resetUrl),
    });

    return res.status(200).json({
      success: true,
      message: "If this email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset link",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, email } = req.query;

    // const { newPassword } = req.body;
    const parsed = registerSchema.pick("password").safeParse(req.body);

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.updateMany({
      where: {
        email,
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: { gt: new Date() },
      },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    if (updatedUser.count === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Send Password reset success Email
    await sendEmail({
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS.replace(
        "{{LOGIN_URL}}",
        `${env.CLIENT_URL}/sign-in`,
      ),
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};
