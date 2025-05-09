import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import fs from "fs";
import { parseForm, FormidableError } from "../../../lib/parse-form";
import {
	desconstructPresets,
	desconstructSvgSprite,
	copyFiles,
	extractConfig,
	createPackageJson,
} from 'mapeo-config-deconstructor/src/'
import getOutputDir from "../../../lib/getOutputDir";
import crypto from 'crypto';
import formidable from "formidable";

interface ResponseData {
	id: string | null;
}

// Define the File type from formidable
interface FormidableFile {
	filepath: string;
	originalFilename: string | null;
	newFilename: string | null;
	mimetype: string | null;
	size: number;
	[key: string]: any;
}

const defaultConfigUrl = "https://api.github.com/repos/digidem/mapeo-default-config/releases/latest"
const backupConfigUrl = `https://github.com/digidem/mapeo-default-config/releases/download/v3.6.1/mapeo-default-settings-v3.6.1.mapeosettings`

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: ResponseData;
		error: string | null;
	}>
) => {
	let fileUrl: string | string[] | undefined;
	if (req.method === "GET") {
		const configUrl = process.env.DEFAULT_CONFIG_URL
		try {
			let mapeoSettingsUrl: string;
			if (configUrl) {
				mapeoSettingsUrl = configUrl;
			} else {
				try {
					const response = await fetch(defaultConfigUrl);
					const data = await response.json() as any;
					console.log('data', data);
					mapeoSettingsUrl = data.assets.find((asset: any) => asset.name.endsWith(".mapeosettings")).browser_download_url;
				} catch (err) {
					console.error(`Got error when fetching latest default config from ${defaultConfigUrl}:`, err);
					mapeoSettingsUrl = backupConfigUrl;
				}
			}
			const fileResponse = await fetch(mapeoSettingsUrl);
			const buffer = await fileResponse.buffer();
			const filename = `/tmp/${crypto.randomBytes(16).toString("hex")}.mapeosettings`;
			fs.writeFileSync(filename, buffer);
			fileUrl = filename;
		} catch (e) {
			console.error(e);
			res.status(500).json({ data: { id: null }, error: "Internal Server Error" });
		}
	} else if (req.method === "POST") {
		try {
			// Parse the form with formidable v3.x
			const { files } = await parseForm(req);
			const file = files.media;
			console.log("Media file:", file);

			// Check if file exists before accessing it
			if (!file) {
				throw new Error("No file uploaded with field name 'media'");
			}

			// In formidable v3.x, file.filepath is the correct property to access
			if (Array.isArray(file)) {
				fileUrl = file.map((f: any) => {
					console.log("File item:", f);
					console.log("File path:", f.filepath);
					return f.filepath;
				});
			} else {
				console.log("File is a single object");
				console.log("File path:", (file as any).filepath);
				fileUrl = (file as any).filepath;
			}
			console.log("Final fileUrl value:", fileUrl);

			// Validate fileUrl before proceeding
			if (Array.isArray(fileUrl) && fileUrl.length === 0) {
				throw new Error("No valid file paths found in uploaded files");
			}

			if (!fileUrl) {
				throw new Error("No valid file path found in uploaded file");
			}
		} catch (e) {
			console.error("Error in POST handler:", e);
			res.status(500).json({ data: { id: null }, error: e instanceof Error ? e.message : "Internal Server Error" });
			return; // Return early to prevent further processing
		}
	} else {
		res.setHeader("Allow", ["GET", "POST"]);
		res.status(405).json({
			data: { id: null },
			error: "Method Not Allowed",
		});
	}
	try {
		if (!fileUrl) {
			throw new Error("No file URL provided");
		}

		const { outputDir, projectId } = getOutputDir(undefined);

		// Handle the case where fileUrl is an array
		const singleFileUrl = Array.isArray(fileUrl) ? fileUrl[0] : fileUrl;

		console.log("Using file path for extraction:", singleFileUrl);

		const { configFolder, outputFolder } = await extractConfig(
			singleFileUrl, // Always pass a single string path
			outputDir
		);

		await desconstructPresets(configFolder, outputFolder);
		await desconstructSvgSprite(configFolder, outputFolder);
		await copyFiles(configFolder, outputFolder);
		await createPackageJson(configFolder, outputFolder);
		console.log("Done!");

		// Clean up the temporary file(s)
		if (typeof fileUrl === 'string') {
			fs.unlinkSync(fileUrl);
		} else if (Array.isArray(fileUrl)) {
			fileUrl.forEach(url => fs.unlinkSync(url));
		}

		res.status(200).json({
			data: {
				id: projectId || null,
			},
			error: null,
		});
	} catch (e) {
		console.error(e);
		// Check if error is from formidable
		if (e instanceof Error && 'httpCode' in e) {
			const formError = e as Error & { httpCode?: number };
			res.status(formError.httpCode || 400).json({
				data: { id: null },
				error: formError.message
			});
		} else {
			res.status(500).json({
				data: { id: null },
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
