/**
 * middleware/upload.middleware.ts
 *
 * Handles multipart image uploads for game thumbnails.
 *
 * Security measures:
 *  - Allowlist of MIME types checked by multer's fileFilter
 *  - Magic-byte (file signature) verification AFTER disk write — rejects files
 *    whose actual bytes don't match the declared type (prevents extension spoofing)
 *  - UUID-based filenames — no user input ever touches the filesystem path
 *  - Configurable upload directory via UPLOAD_DIR env var
 *  - Hard file-size limit (2 MB)
 *  - Only one file per request (single())
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";

// ── Config ──────────────────────────────────────────────────────────────────

export const UPLOAD_DIR = path.resolve(
    process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads", "games")
);

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

// Supported image types and their magic-byte signatures
const ALLOWED_MIME_TYPES: Record<string, { ext: string; magic: Buffer[] }> = {
    "image/jpeg": {
        ext: "jpg",
        magic: [Buffer.from([0xff, 0xd8, 0xff])],
    },
    "image/png": {
        ext: "png",
        magic: [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
    },
    "image/webp": {
        ext: "webp",
        // WebP: RIFF????WEBP — bytes 0-3 = RIFF, bytes 8-11 = WEBP
        magic: [Buffer.from([0x52, 0x49, 0x46, 0x46])],
    },
    "image/gif": {
        ext: "gif",
        magic: [
            Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
            Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
        ],
    },
};

// ── Ensure upload dir exists ─────────────────────────────────────────────────

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer storage — UUID filenames, no user input in path ───────────────────

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const mimeInfo = ALLOWED_MIME_TYPES[file.mimetype];
        // mimeInfo will always exist because fileFilter runs first
        const ext = mimeInfo?.ext ?? "bin";
        const uniqueName = `${crypto.randomUUID()}.${ext}`;
        cb(null, uniqueName);
    },
});

// ── File filter — first gate: MIME type allowlist ────────────────────────────

function fileFilter(
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(
            Object.assign(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"), {
                code: "INVALID_MIME_TYPE",
            }) as unknown as null,
            false
        );
    }
}

// ── Multer instance ──────────────────────────────────────────────────────────

export const multerUpload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
    fileFilter,
});

// ── Magic-byte verification — second gate ────────────────────────────────────

function readMagicBytes(filePath: string, length: number): Buffer {
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(length);
    fs.readSync(fd, buf, 0, length, 0);
    fs.closeSync(fd);
    return buf;
}

function verifyMagicBytes(file: Express.Multer.File): boolean {
    const info = ALLOWED_MIME_TYPES[file.mimetype];
    if (!info) return false;

    const longestMagic = Math.max(...info.magic.map((m) => m.length));
    const header = readMagicBytes(file.path, longestMagic);

    // WebP needs special check: RIFF at 0 AND WEBP at 8
    if (file.mimetype === "image/webp") {
        const riff = Buffer.from([0x52, 0x49, 0x46, 0x46]);
        const webp = Buffer.from([0x57, 0x45, 0x42, 0x50]);
        const fullHeader = readMagicBytes(file.path, 12);
        return (
            fullHeader.subarray(0, 4).equals(riff) &&
            fullHeader.subarray(8, 12).equals(webp)
        );
    }

    return info.magic.some((magic) => header.subarray(0, magic.length).equals(magic));
}

// ── Helper: safely delete a file (no-throw) ──────────────────────────────────

export function deleteUploadedFile(filePath: string): void {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch {
        // Log but don't throw — a missing file on delete is non-fatal
        console.warn(`Could not delete file: ${filePath}`);
    }
}

// ── Exported middleware ──────────────────────────────────────────────────────

/**
 * uploadGameImage
 *
 * Drop-in Express middleware:
 *   1. Runs multer (saves file to disk, validates MIME type + size)
 *   2. Verifies magic bytes — deletes file and rejects if mismatch
 *
 * On success, req.file is populated with the saved file metadata.
 */
export function uploadGameImage(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    multerUpload.single("image")(req, res, (err) => {
        // ── multer-level errors ──────────────────────────────────────────────────
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    res
                        .status(400)
                        .json({ success: false, message: "Image must be 2 MB or smaller" });
                    return;
                }
                res.status(400).json({ success: false, message: err.message });
                return;
            }
            // fileFilter rejection
            res
                .status(400)
                .json({ success: false, message: (err as Error).message ?? "Upload error" });
            return;
        }

        // ── No file attached — that's fine, caller decides if required ───────────
        if (!req.file) {
            next();
            return;
        }

        // ── Magic-byte check ─────────────────────────────────────────────────────
        if (!verifyMagicBytes(req.file)) {
            deleteUploadedFile(req.file.path);
            res.status(400).json({
                success: false,
                message: "File content does not match declared image type",
            });
            return;
        }

        next();
    });
}