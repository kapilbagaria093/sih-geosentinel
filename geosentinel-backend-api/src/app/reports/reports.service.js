import crypto from "crypto";
import fs from "fs/promises";

import { eq } from "drizzle-orm";

import cloudinary from "../../config/cloudinary.js";

import { db } from "../../db/index.js";

import {
  report,
  reportMedia,
} from "../../db/schema.js";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

function getMediaKind(mimeType) {
  if (ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return "image";
  }

  if (ALLOWED_VIDEO_TYPES.has(mimeType)) {
    return "video";
  }

  return null;
}

function uploadToCloudinary(
  filePath,
  resourceType,
  publicId,
) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: resourceType,

        public_id: publicId,

        folder: "geosentinel/reports",

        chunk_size: 20 * 1024 * 1024,
      },

      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );
  });
}

export async function createReport({
  userId,
  severity,
  description,
  latitude,
  longitude,
  altitude,
  address,
  reportedAt,
  files,
}) {
  const reportId = crypto.randomUUID();

  const uploadedAssets = [];

  try {
    /*
     * Upload media to Cloudinary
     */
    for (const file of files) {
      const kind = getMediaKind(file.mimetype);

      if (!kind) {
        throw new Error(
          `Unsupported media type: ${file.mimetype}`,
        );
      }

      const publicId =
        `geosentinel/reports/${reportId}/${crypto.randomUUID()}`;

      const result =
        await uploadToCloudinary(
          file.path,
          kind === "video"
            ? "video"
            : "image",
          publicId,
        );

      uploadedAssets.push({
        id: crypto.randomUUID(),

        reportId,

        kind,

        fileName: file.originalname,

        mimeType: file.mimetype,

        publicId: result.public_id,

        resourceType: result.resource_type,

        secureUrl: result.secure_url,

        fileSize: result.bytes,
      });
    }

    /*
     * Insert report
     */
    const insertedReports = await db
      .insert(report)
      .values({
        id: reportId,

        userId,

        severity,

        description,

        latitude,

        longitude,

        altitude,

        address,

        reportedAt,
      })
      .returning();

    const createdReport =
      insertedReports[0];

    /*
     * Insert media metadata
     */
    if (uploadedAssets.length > 0) {
      await db
        .insert(reportMedia)
        .values(uploadedAssets);
    }

    return {
      ...createdReport,

      media: uploadedAssets,
    };
  } catch (error) {
    /*
     * If DB insertion fails after
     * Cloudinary upload, clean up Cloudinary.
     */
    for (const asset of uploadedAssets) {
      try {
        await cloudinary.uploader.destroy(
          asset.publicId,
          {
            resource_type:
              asset.resourceType,
          },
        );
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup failed:",
          cleanupError,
        );
      }
    }

    throw error;
  } finally {
    /*
     * Delete temporary files.
     */
    for (const file of files) {
      try {
        await fs.unlink(file.path);
      } catch {
        // Already deleted / doesn't exist.
      }
    }
  }
}

export async function getReportById(reportId) {
  const reports = await db
    .select()
    .from(report)
    .where(eq(report.id, reportId))
    .limit(1);

  if (reports.length === 0) {
    return null;
  }

  const media = await db
    .select()
    .from(reportMedia)
    .where(
      eq(
        reportMedia.reportId,
        reportId,
      ),
    );

  return {
    ...reports[0],
    media,
  };
}