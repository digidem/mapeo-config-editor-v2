import type { NextApiRequest, NextApiResponse } from "next";
import getPresets from 'mapeo-config-renderer/api/lib/getPresets'
import getOutputDir from "../../../lib/getOutputDir";

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: {
			id: string | string[];
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
		const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
		console.log('GOT ID', id)
		const { outputDir } = getOutputDir(id)
		const presetsDir = `${outputDir}/presets`;
		const data = await getPresets(presetsDir)
		const dataWithPath = data.map(i => ({
			...i,
			iconPath: `/api/icon?name=${i.icon}&id=${id}`
		}))
		res.status(200).json({
			data: dataWithPath,
			error: null,
		});
	} catch (err) {
		console.error(err)
	}
}

export default handler;


