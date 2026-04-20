export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.user.role !== "ADMIN") {
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
    if (!req.user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.user.role !== "USER") {
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
    if (!req.user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.user.role !== "AGENT") {
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
