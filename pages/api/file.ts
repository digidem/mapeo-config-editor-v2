import type { NextApiRequest, NextApiResponse } from "next";
import getOutputDir from '../../lib/getOutputDir'
import fs from 'fs'
// import getIcon from 'mapeo-config-renderer/api/lib/getIcon'

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: {
			iconPath: string | string[];
		} | null;
		error: string | null;
	}>
) => {
	if (req.method !== "GET") {
		res.setHeader("Allow", "GET");
		res.status(405).json({
			data: null,
			error: "Method Not Allowed",
		});
		return;
	}
	// Just after the "Method Not Allowed" code
	try {
		const { id, name } = req.query;
		const idStr = Array.isArray(id) ? id[0] : id || '';
		const nameStr = Array.isArray(name) ? name[0] : name || '';
		const { outputDir } = getOutputDir(idStr);
		const filePath = `${outputDir}/build/${nameStr}`;
		res.setHeader("Content-Type", "application/octet-stream");
		var readStream = fs.createReadStream(filePath);
		readStream.pipe(res)
	} catch (err) {
		console.error(err)
	}
};

export default handler;
