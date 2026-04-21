import { success } from "zod";
import { prisma } from "../../lib/prisma.js";
import { generateIp } from "../../utils/checkCompletion.js";

export const getAgentStats = async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { userId: req.user.id },
    });

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found",
      });
    }

    const totalListings = await prisma.listing.count({
      where: {
        agentId: agent.id,
      },
    });

    const getStatForType = async (type) => {
        const total = await prisma.listing.count({
            where: { agentId: agent.id, listingType: type },
        });
        return total;
    } 

    return res.status(200).json({
        success: true,
        message: "Fetched stats successfully",
        stats: {
            totalListings,
            forSale: getStatForType("FOR_SALE") || 0,
            forRent: getStatForType("FOR_RENT") || 0,
        } 
    })
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to get agents",
    });
  }
};


// Admin Actions
export const getAllAgents = async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({});

    if (!agents || agents.length === 0) {
      return res.status(404).json({
        message: "No agents found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Fetched all agents successfully",
      agents,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to get agents",
    });
  }
};

export const getAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        listings: true,
        company: true,
      },
    });

    if (!agent) {
      return res.status(404).json({
        message: "No agent found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched agent successfully",
      agent,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to get agent",
    });
  }
};

export const updateAgentStatus = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.query;

    const validStatus = ["ACTIVE", "SUSPENDED", "DEACTIVATED"];

    if (!validStatus.includes(status.toUppercase())) {
      return res.status(400).json({
        message: "Invalid status input",
      });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return res.status(404).json({
        message: "No agent found",
      });
    }

    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        status,
      },
    });

    const ip = generateIp(req);

    await prisma.adminAuditLog.create({
      data: {
        adminId: req.user.id,
        entityId: agent.id,
        entityType: "AGENT",
        targetUserId: agent.userId,
        action: "UPDATE",
        notes: `${status === "ACTIVE" ? "ACTIVATED" : status} agent with id ${agent.id}`,
        ipHash: crypto.createHash("sha256").update(ip).digest("hex") || "",
        userAgent: req.headers["user-agent"],
      },
    });

    return res.status(200).json({
      success: true,
      message: `Agent ${status === "ACTIVE" ? "ACTIVATED" : status} successfully`,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to update agent status",
    });
  }
};
