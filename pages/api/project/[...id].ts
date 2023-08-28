import type { NextApiRequest, NextApiResponse } from "next";
import getPresets from 'mapeo-config-renderer/api/lib/getPresets'
import getOutputDir from "../../../lib/getOutputDir";
import fs from 'fs'

interface PresetData {
	name: string;
	color: string;
	sort: number;
	icon: string;
}
async function fetchPresets (id, presetsDir) {
	const data = await getPresets(presetsDir)
	return data.map(i => ({
		...i,
		sort: parseInt(i.sort),
		iconPath: `/api/icon?name=${i.icon}&id=${id}`
	}))
}

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: PresetData[] | null;
		error: string | null;
	}>
) => {
	try {
		const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
		const { outputDir } = getOutputDir(id)
		const presetsDir = `${outputDir}/presets`;
		
		if (req.method === "GET") {
			const data = await fetchPresets(id, presetsDir)
			res.status(200).json({
				data,
				error: null,
			});

		} else if (req.method === "PUT") {
			// ... existing PUT method code ...
		} else if (req.method === "DELETE") {
			const { slug } = req.body;
			if (!slug) throw Error('No slug passed');
			const presetPath = `${presetsDir}/${slug}.json`;
			if (fs.existsSync(presetPath)) {
				fs.unlinkSync(presetPath);
				console.log('Preset file deleted');
			} else {
				throw Error('Preset file not found');
			}
			const updatedData = await fetchPresets(id, presetsDir)
			res.status(200).json({ data: updatedData, error: null });
			console.log('Response sent');
		} else if (req.method === "POST") {
			const { slug, name, color, sort, icon } = req.body;
			if (!slug) throw Error('No slug passed');
			const presetPath = `${presetsDir}/${slug}.json`;
			let presetData: PresetData = {
				name,
				color,
				sort: parseInt(sort) || 0,
				icon,
			};
			await fs.writeFileSync(presetPath, JSON.stringify(presetData));
			console.log('Preset data written to file');
			const updatedData = await fetchPresets(id, presetsDir)
			res.status(200).json({ data: updatedData, error: null });
			console.log('Response sent');
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({ data: null, error: error instanceof Error ? error.message : null });	}
}

	export default handler;



