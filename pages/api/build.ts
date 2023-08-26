import type { NextApiRequest, NextApiResponse } from "next";
import path from 'path'
import settingsBuilder from 'mapeo-settings-builder/commands/build_lint.js'
const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: {
			port: string | string[];
		} | null;
		error: string | null;
	}>
) => {
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		res.status(405).json({
			data: null,
			error: "Method Not Allowed",
		});
		return;
	}
	let serverUrl = req.body.serverUrl;

	if (!serverUrl) {
		res.status(405).json({
			data: null,
			error: "Server url to connect to not passed",
		});
		return;
	}
	try {
		// calls serverUrl/path to get mapeoconfigfolder
		console.log('serverUrl', serverUrl)
		let response = await fetch(`${serverUrl}/path`);
		if (!response.ok) {
			// This will activate the closest `error.js` Error Boundary
			throw new Error('Failed to fetch data')
		}
		let data = await response.json();

		let configFolderPath = data.data;
		// runs build on it
		const build = await settingsBuilder({ output: path.join(configFolderPath, 'build') }, configFolderPath)
		console.log('BUILD!!', build)
	} catch (err) {
		console.error(err)
	}
}

export default handler;

