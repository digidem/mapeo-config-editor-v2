import type { NextApiRequest } from "next";
import mime from "mime";
import { join } from "path";
import * as dateFn from "date-fns";
import formidable from "formidable";
import { mkdir, stat } from "fs/promises";

// Export FormidableError class from formidable v3.x
// In v3.x, the error class is available as formidable.errors.default
export class FormidableError extends Error {
  httpCode?: number;
  code?: number;
}

export const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const uploadDir = join(
    process.env.ROOT_DIR || process.cwd(),
    `/uploads/${dateFn.format(Date.now(), "dd-MM-Y")}`
  );

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      console.error(e);
      throw e;
    }
  }

  // Create the formidable form parser with options
  const form = formidable({
    maxFiles: 1,
    maxFileSize: 1024 * 1024 * 100, // 100mb
    uploadDir,
    filename: (_name, _ext, part) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${part.name || "unknown"}-${uniqueSuffix}.${
        mime.getExtension(part.mimetype || "") || "unknown"
      }`;
      console.log("Generated filename:", filename);
      return filename;
    }
  });

  // Use the promise-based API in v3.x
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};
