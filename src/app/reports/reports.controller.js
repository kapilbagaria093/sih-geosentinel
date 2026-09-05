import {
  createReport,
  getReportById,
} from "./reports.service.js";

const ALLOWED_SEVERITIES = new Set([
  "minor",
  "road_blocked",
  "major",
]);

function parseNumber(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function isValidDate(value) {
  const date = new Date(value);

  return !Number.isNaN(
    date.getTime(),
  );
}

export async function createReportController(
  req,
  res,
) {
  try {
    const {
      severity,
      description,
      reportedAt,
      latitude,
      longitude,
      altitude,
      address,
    } = req.body;

    /*
     * Severity
     */
    if (!severity) {
      return res.status(400).json({
        success: false,
        message: "Severity is required",
      });
    }

    if (!ALLOWED_SEVERITIES.has(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity",
      });
    }

    /*
     * Description
     */
    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description is too long",
      });
    }

    /*
     * Reported time
     */
    if (
      !reportedAt ||
      !isValidDate(reportedAt)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid reportedAt is required",
      });
    }

    /*
     * Location
     */
    const parsedLatitude =
      parseNumber(latitude);

    const parsedLongitude =
      parseNumber(longitude);

    const parsedAltitude =
      parseNumber(altitude);

    if (
      parsedLatitude === null ||
      parsedLatitude < -90 ||
      parsedLatitude > 90
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude",
      });
    }

    if (
      parsedLongitude === null ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude",
      });
    }

    const files = req.files ?? [];

    const createdReport =
      await createReport({
        userId: req.user.id,

        severity,

        description:
          description.trim(),

        latitude: parsedLatitude,

        longitude: parsedLongitude,

        altitude: parsedAltitude,

        address:
          address?.trim() || null,

        reportedAt:
          new Date(reportedAt),

        files,
      });

    return res.status(201).json({
      success: true,

      message:
        "Report submitted successfully",

      data: {
        id: createdReport.id,

        severity:
          createdReport.severity,

        description:
          createdReport.description,

        location: {
          latitude:
            createdReport.latitude,

          longitude:
            createdReport.longitude,

          altitude:
            createdReport.altitude,

          address:
            createdReport.address,
        },

        reportedAt:
          createdReport.reportedAt,

        createdAt:
          createdReport.createdAt,

        media:
          createdReport.media.map(
            (media) => ({
              id: media.id,

              kind: media.kind,

              fileName:
                media.fileName,

              mimeType:
                media.mimeType,

              url:
                media.secureUrl,
            }),
          ),
      },
    });
  } catch (error) {
    console.error(
      "Create report error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit report",
    });
  }
}

export async function getReportController(
  req,
  res,
) {
  try {
    const { id } = req.params;

    const foundReport =
      await getReportById(id);

    if (!foundReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,

      data: {
        id: foundReport.id,

        severity:
          foundReport.severity,

        description:
          foundReport.description,

        location: {
          latitude:
            foundReport.latitude,

          longitude:
            foundReport.longitude,

          altitude:
            foundReport.altitude,

          address:
            foundReport.address,
        },

        reportedAt:
          foundReport.reportedAt,

        createdAt:
          foundReport.createdAt,

        media:
          foundReport.media.map(
            (media) => ({
              id: media.id,

              kind: media.kind,

              fileName:
                media.fileName,

              mimeType:
                media.mimeType,

              url:
                media.secureUrl,
            }),
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get report error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch report",
    });
  }
}