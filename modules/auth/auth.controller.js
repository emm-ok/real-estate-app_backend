import { env } from "../../config/env.js";
import { generateToken } from "../../constants/token.js";
import { prisma } from "../../lib/prisma.js";
import { generatePasswordResetToken } from "../../utils/passwordResetToken.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import bcrypt from "bcrypt";

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

    const verificationToken = (Math.floor(100000 + Math.random() * 900000)).toString();

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: new Date(Date.now() + 86400000) // 24 hours or 1 day
      },
    });

    generateToken(user.id, res);

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
    return res.status(400).json({
      success: false,
      message: error.message,
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
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const fetchUser = async(req, res) => {
  try{
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { 
        bookmarks: true, 
        reviews: true, 
        companyMembership: true 
      }
    })

    if(!user){
      return res.status(400).json({
        success: false,
        message: "Unable to fetch user"
      })
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfuly",
      data: {
        user: {
          ...user, password: undefined
        }
      },
    })

  } catch(error){
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
// export const resetPassword = async(req, res) => {
//   const { rawToken, hashedToken } =  generatePasswordResetToken();

//     const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    
//     user.passwordResetToken = hashedToken;
//     user.passwordResetExpiresAt = new Date() + 15 * 60 * 1000; // 15 minutes
// }