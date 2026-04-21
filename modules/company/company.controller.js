import { prisma } from "../../lib/prisma.js";

export const getAllCompanies = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    const offset = (page - 1) * limit;

    const companies = await prisma.company.findMany({
      take: offset,
      where: {
        status,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!companies || companies.length === 0) {
      return res.status(404).json({
        message: "No companies found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched companies successfully",
      companies,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to get companies",
    });
  }
};

export const getMyCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      where: { ownerId: req.user.id, status: "ACTIVE" },
    });

    if (!companies || companies.length === 0) {
      return res.status(404).json({
        message: "No companies found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched companies successfully",
      companies,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to get companies",
    });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        message: "Company Id required",
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        agents: true,
        members: true,
        listings: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched Company successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to get company",
    });
  }
};

export const getCompanyAgents = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        message: "Company Id required",
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        agents: true,
        members: true,
        listings: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const agents = await prisma.agent.findMany({
      where: { companyId: company.id },
    });

    return res.status(200).json({
      success: true,
      message: "Fetched all company agents successfully",
      agents,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to get company agents",
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { email, website } = req.body;

    if (!companyId) {
      return res.status(400).json({
        message: "Company Id required",
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    await prisma.company.update({
      where: { id: company.id },
      data: {
        email,
        website,
      },
    });

    return res.statu(200).json({
      success: true,
      message: "Updated company details successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to update company",
    });
  }
};

export const updateCompanyLogo = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        message: "Company Id required",
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No Logo file provided",
      });
    }

    await prisma.companyLogo.upsert({
      where: { companyId: company.id },
      create: {
        companyId: company.id,
        url: req.file.path,
        publicId: req.file.filename,
      },
      update: {
        companyId: company.id,
        url: req.file.path,
        publicId: req.file.filename,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Updated company logo successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to update company logo",
    });
  }
};

// export const getCompanyStats = async(req, res) => {}

export const getCompanyListings = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        message: "Company Id required",
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const listings = await prisma.listing.findMany({
      where: { companyId: company.id },
    });

    return res.status(200).json({
      success: true,
      message: "Fetched company listings successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to Fetch company listings",
    });
  }
};

export const updateCompanyStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.query;

    if (!companyId) {
      return res.status(400).json({
        message: "Company Id required",
      });
    }
    const validStatus = ["ACTIVE", "DEACTIVATED", "SUSPENDED"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    await prisma.company.update({
      where: { id: company.id },
      data: {
        status,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to Fetch company listings",
    });
  }
};
