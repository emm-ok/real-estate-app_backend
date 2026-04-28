import { prisma } from "../lib/prisma.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied, Admin only!",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify admin",
    });
  }
};

export const requireUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    })
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "USER") {
      return res.status(403).json({
        message: "Access denied, User only!",
      });
    }

    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Failed to verify user",
    });
  }
};

export const requireAgent = async (req, res, next) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { userId: req.user.id },
      include: { user: true}
    })

    if (!agent) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (agent.user.role !== "AGENT") {
      return res.status(403).json({
        message: "Access denied, Agent only!",
      });
    }

    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Failed to verify agent",
    });
  }
};

export const requireCompanyAdmin = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        message: "Company ID is required",
      });
    }

    const companyAdmin = await prisma.companyMember.findFirst({
      where: {
        userId: req.user.id,
        companyId,
        role: "ADMIN",
      },
    });
    if (!companyAdmin) {
      return res.status(404).json({
        message: "Company Admin not found",
      });
    }

    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Failed to verify company admin",
    });
  }
};

export const requireCompanyMember = async (req, res, next) => {
  try{
    const { companyId } = req.params;

  const member = await prisma.companyMember.findFirst({
    where: {
      userId: req.user.id,
      companyId,
    },
  });

  if (!member) {
    return res.status(404).json({
      message: "Member not found",
    });
  }

  next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Failed to verify company member",
    });
  }
};
