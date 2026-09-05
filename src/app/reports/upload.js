import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";

const tempDirectory = path.resolve(
  process.cwd(),
  "data/uploads/tmp",
);

if (!fs.existsSync(tempDirectory)) {
  fs.mkdirSync(tempDirectory, {
    recursive: true,
  });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",

  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(
      null,
      `${crypto.randomUUID()}${extension}`,
    );
  },
});

export const reportUpload = multer({
  storage,

  limits: {
    files: 10,

    // 100 MB maximum per file
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new Error(
          `Unsupported media type: ${file.mimetype}`,
        ),
      );
    }

    cb(null, true);
  },
});