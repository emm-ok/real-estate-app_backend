import { prisma } from "../../lib/prisma.js";
import {env} from "../../config/env.js"
import { updateUserSchema } from "../auth/auth.validation.js";

export const userSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  companyMembership: true,
  bookmarks: true,
  reviews: true,
};
export const userUpdateSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  companyMembership: true,
  bookmarks: true,
  reviews: true,
};

export const fetchUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userSelect,
    });
    
    if (!user || user.status !== "ACTIVE") {
      return res.status(404).json({
        success: false,
        message: "Unable to fetch user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    // TODO: Add ZOd Validation

    const allowedFields = [
      "name",
      "phone",
      "bio",
      "address",
      "city",
      "state",
      "country",
    ];
    const updates = {};

    const parsed = updateUserSchema.safeParse(req.body);

    
    if(!parsed.success){
      return res.status(400).json(parsed.error.format())
    }
    const { name, phone, bio, address, city, state, country } = parsed.data;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] = parsed.data[field];
      }
    }

    if (req.file) {
      updates.image = req.file.path;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided",
      });
    }

    const updatedUser = await prisma.user.updateMany({
      where: {
        id: req.user.id,
        status: "ACTIVE",
      },
      data: { ...updates, updatedAt: new Date() },
    });

    console.log("User", updateUser)

    if (updateUser.count === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Updated user successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await prisma.user.updateMany({
      where: {
        id: req.user.id,
        status: "ACTIVE",
      },
      data: {
        status: "DEACTIVATED",
        deletedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return res.status(400).json({
        success: false,
        message: "User already deactivated",
      });
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};
