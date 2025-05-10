import { NextApiRequest, NextApiResponse } from "next";
import { parseForm } from "../../../../lib/parse-form";
import getOutputDir from "../../../../lib/getOutputDir";
import crypto from 'crypto';
import formidable from "formidable";
import fs from 'fs';

// Define the FormidableFile type for TypeScript
interface FormidableFile {
  filepath: string;
  originalFilename: string | null;
  newFilename: string | null;
  mimetype: string | null;
  size: number;
  [key: string]: any;
}

const ResponseData = {
	icon: String || null
}

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: { icon: File | string | null } | null;
		error: string | null;
	}>
) => {
	let data = ResponseData;
	let error = String || null;
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		res.status(405).json({
			data: { icon: null },
			error: "Method Not Allowed",
		});
		return;
	}
	// Just after the "Method Not Allowed" code
	const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
	if (!id) {
		res.status(400).json({
			data: { icon: '' },
			error: "Missing id",
		});
		return;
	}
	const { fields, files } = await parseForm(req);
	const { outputDir } = getOutputDir(id)
	const iconsDir = `${outputDir}/icons`;
	const uuid = crypto.randomBytes(16).toString('hex');
	const newFilePath100 = `${iconsDir}/${uuid}-100px.svg`;
	const newFilePath24 = `${iconsDir}/${uuid}-24px.svg`;
	try {
		let fileUrl: string;
		if (Object.keys(files).length > 0) {
			// Cast the file to our FormidableFile type
			const file = files.icon as FormidableFile | FormidableFile[] | undefined;

			if (!file) {
				throw new Error("No icon file uploaded");
			}

			// Handle both single file and array of files
			if (Array.isArray(file)) {
				if (file.length === 0) {
					throw new Error("Empty file array");
				}
				fileUrl = file[0].filepath;
			} else {
				fileUrl = file.filepath;
			}

			// Make sure fileUrl is defined
			if (!fileUrl) {
				throw new Error("File path is undefined");
			}

			await fs.promises.copyFile(fileUrl, newFilePath100);
			await fs.promises.copyFile(fileUrl, newFilePath24);
		} else {
			const file: string | string[] = fields.icon as string | string[];
			const fileData = Array.isArray(file) ? file[0].split(',')[1] : file.split(',')[1];
			const decodedFileData = decodeURIComponent(fileData);
			const buffer = Buffer.from(decodedFileData, 'utf8');
			fs.writeFileSync(newFilePath100, buffer);
			fs.writeFileSync(newFilePath24, buffer);
		}
		res.status(200).json({
			data: {
				icon: uuid,
			},
			error: null,
		});
	} catch (e) {
		console.error("Error in icon upload:", e);

		// Check if error is from formidable
		if (e instanceof Error && 'httpCode' in e) {
			const formError = e as Error & { httpCode?: number };
			res.status(formError.httpCode || 400).json({
				data: { icon: null },
				error: formError.message
			});
		} else {
			res.status(500).json({
				data: { icon: null },
				error: e instanceof Error ? e.message : "Internal Server Error"
			});
		}
	}
};

export const config = {
	api: {
		bodyParser: false,
	},
};

export default handler;
