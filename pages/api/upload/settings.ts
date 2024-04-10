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

interface ResponseData {
	id: string | null;
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
	let fileUrl
	if (req.method === "GET") {
		const configUrl = process.env.DEFAULT_CONFIG_URL
		try {
			let mapeoSettingsUrl
			if (configUrl) {
				mapeoSettingsUrl = configUrl
			} else {
				try {
					const response = await fetch(defaultConfigUrl);
					const data = await response.json({
						headers: {
							'Authorization': process.env.GITHUB_TOKEN,
						}
					});
					console.log('data', data);
					mapeoSettingsUrl = data.assets.find((asset: any) => asset.name.endsWith(".mapeosettings")).browser_download_url;
				} catch (err) {
					console.error(`Got error when fetching latest default config from ${defaultConfigUrl}:`, err);
					mapeoSettingsUrl = backupConfigUrl
				}
			}
			const fileResponse = await fetch(mapeoSettingsUrl);
			const buffer = await fileResponse.buffer();
			const filename = `/tmp/${crypto.randomBytes(16).toString("hex")}.mapeosettings`;
			fs.writeFileSync(filename, buffer);
			fileUrl = filename
		} catch (e) {
			console.error(e);
			res.status(500).json({ data: { id: null }, error: "Internal Server Error" });
		}
	} else if (req.method === "POST") {
		try {
			const { fields, files } = await parseForm(req);
			const file = files.media;
			fileUrl = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
		} catch (e) {
			console.error(e);
			res.status(500).json({ data: { id: null }, error: "Internal Server Error" });
		}
	} else {
		res.setHeader("Allow", ["GET", "POST"]);
		res.status(405).json({
			data: { id: null },
			error: "Method Not Allowed",
		});
	}
	try {
		const { outputDir, projectId } = getOutputDir(undefined)
		const { configFolder, outputFolder } = await extractConfig(
			fileUrl,
			outputDir
		);
		await desconstructPresets(configFolder, outputFolder);
		await desconstructSvgSprite(configFolder, outputFolder);
		await copyFiles(configFolder, outputFolder);
		await createPackageJson(configFolder, outputFolder);
		console.log("Done!");
		fs.unlinkSync(fileUrl);
		res.status(200).json({
			data: {
				id: projectId || null,
			},
			error: null,
		});
	} catch (e) {
		if (e instanceof FormidableError) {
			res.status(e.httpCode || 400).json({ data: { id: null }, error: e.message });
		} else {
			console.error(e);
			res.status(500).json({ data: { id: null }, error: "Internal Server Error" });
		}
	}
};

export const config = {
	api: {
		bodyParser: false,
	},
};

export default handler;
