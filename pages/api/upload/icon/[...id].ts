import { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "../../../../lib/parse-form";
import getOutputDir from "../../../../lib/getOutputDir";
import crypto from 'crypto';

import fs from 'fs'
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
		let fileUrl
		if (Object.keys(files).length > 0) {
			const file = files.icon
			fileUrl = Array.isArray(file) ? file[0]?.filepath : file?.filepath
			await fs.promises.copyFile(fileUrl, newFilePath100);
			await fs.promises.copyFile(fileUrl, newFilePath24);
		} else {
			const file: string | string[] = fields.icon
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
		if (e instanceof FormidableError) {
			res.status(e.httpCode || 400).json({ data: { icon: null }, error: e.message });
		} else {
			console.error(e);
			res.status(500).json({ data: { icon: null }, error: "Internal Server Error" });
		}
	}
};

export const config = {
	api: {
		bodyParser: false,
	},
};

export default handler;
