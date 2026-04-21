import { success } from "zod";
import { prisma } from "../../lib/prisma.js";
import cloudinary from "../../config/cloudinary.js";
// import { listingData } from "../../lib/listingData.js"

export const createListing = async (req, res) => {
  const agent = await prisma.agent.findUnique({
    where: { userId: req.user.id },
  })

  if(!agent){
    return res.status(404).json({
      message: "Agent not found"
    })
  }
  
  try {
    const listing = await prisma.listing.create({
      data: {
        agentId: req.user.id,
        title: "Untitled Listing",
        slug: `draft-${Date.now()}`,
        price: 0,
        type: "COMMERCIAL",
        listingType: "FOR_RENT",
        status: "DRAFT",
        history: {
          create: [
            {
              action: "DRAFTED",
              performedById: req.user.id,
              note: "New Listing Drafted",
            },
          ],
        },
      },
      include: {
        history: true,
        media: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "New Listing Drafted successfully",
      listing,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to create listing",
    });
  }
};

export const getAllListings = async (req, res) => {
  try {
    const listing = await prisma.listing.findMany({
      where: { agentId: req.user.id },
    });

    if (listing.length === 0) {
      return res.status(404).json({
        message: "No listings found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Listings retrieved successfully",
      listing,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to get listing",
    });
  }
};

export const getListing = async (req, res) => {
  try {
    const { listing } = req;

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Listing retrieved successfully",
      listing,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to get listing",
    });
  }
};

export const updateListing = async (req, res) => {
  const listingData = req.body;
  const { listing } = req;

  if (!listing) {
    return res.status(404).json({
      message: `Invalid or no listing found for id ${listing.id}`,
    });
  }

  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data: listingData,
  });

  await prisma.listingHistory.create({
    data: {
      listingId: listing.id,
      action: "UPDATED",
      performedById: req.user.id,
      note: `Updated listing of id ${listing.id}`,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Draft Listing updated successfully",
  });
};

export const uploadListingMedia = async (req, res) => {
  try {
    const { listing } = req;

    if (!listing) {
      return res.status(404).json({
        message: `Invalid or no listing found for id ${listing.id}`,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const mediaData = req.files.map((file) => {
      if (
        !file.mimetype.startsWith("image") &&
        !file.mimetype.startsWith("video")
      ) {
        return res.status(400).json({
          message: "Invalid file type",
        });
      }

      return {
        listingId: listing.id,
        url: file.path,
        publicId: file.filename,
        type: file.mimetype.startsWith("video") ? "VIDEO" : "IMAGE",
      };
    });
    console.log(mediaData);

    const media = await prisma.$transaction(async (tx) => {
      const createdMedia = await tx.media.createMany({
        data: mediaData,
      });

      await tx.listingHistory.create({
        data: {
          listingId: listing.id,
          action: "UPLOADED_MEDIA",
          performedById: req.user.id,
          note: `Uploaded media type ${mediaData.type}`,
        },
      });

      return createdMedia;
    });

    return res.status(200).json({
      success: true,
      message: "Media uploaded successfully",
      media,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to upload media",
    });
  }
};

export const deleteListingMedias = async (req, res) => {
  try {
    const { listing } = req;

    const medias = await prisma.media.findMany({
      where: { listingId: listing.id },
    });

    if (!medias || medias.length === 0) {
      return res.status(404).json({
        message: `Media not found`,
      });
    }
    const deletionResults = await Promise.all(
      medias.map((media) =>
        cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.type === "VIDEO" ? "video" : "image",
        }),
      ),
    );

    const failedDeletes = deletionResults.filter(
      (res) => res.result !== "ok" && res.result !== "not found",
    );

    if (failedDeletes.length > 0) {
      return res.status(500).json({
        message: "Some files failed to delete from cloudinary",
        failedDeletes,
      });
    }

    await prisma.media.deleteMany({
      where: { listingId: listing.id },
    });

    await Promise.all(
      medias.map((media) =>
        prisma.listingHistory.create({
          data: {
            listingId: media.listingId,
            action: "DELETED_MEDIA",
            performedById: req.user.id,
            note: `Deleted listing media of id ${media.id}`,
          },
        }),
      ),
    );

    return res.status(200).json({
      success: true,
      message: "Medias deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to delete medias",
    });
  }
};

export const deleteListingMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { listing } = req;

    const media = await prisma.media.findFirst({
      where: { id: mediaId, listingId: listing.id },
    });

    if (!media) {
      return res.status(404).json({
        message: "Media not found",
      });
    }

    const result = await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type === "VIDEO" ? "video" : "image",
    });

    if (result !== "ok" || result !== "not found") {
      throw new Error("Cloudinary deletion failed");
    }

    await prisma.media.delete({
      where: { id: media.id },
    });

    await prisma.listingHistory.create({
      data: {
        listingId: media.listingId,
        action: "DELETED_MEDIA",
        performedById: req.user.id,
        note: `Deleted listing media of id ${media.id}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to delete media",
    });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const { listing } = req;

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    await prisma.listing.delete({
      where: { id: listing.id },
    });

    await prisma.listingHistory.create({
      data: {
        listingId: listing.id,
        action: "ARCHIVED",
        performedById: req.user.id,
        note: `Deleted listing of id ${listing.id}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to delete listing",
    });
  }
};

export const uploadListing = async (req, res) => {
  try {
    const { listing } = req;

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        status: "ACTIVE",
      },
    });

    await prisma.listingHistory.create({
      data: {
        listingId: listing.id,
        action: "SUBMITTED",
        performedById: req.user.id,
        note: `Activated listing of id ${listing.id}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Activated listing successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Failed to activate listing",
    });
  }
};
