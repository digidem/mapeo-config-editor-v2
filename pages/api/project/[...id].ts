import type { NextApiRequest, NextApiResponse } from "next";
import getPresets from '../../../../mapeo-config-renderer/api/lib/getPresets'
import getOutputDir from "../../../lib/getOutputDir";
import fs from 'fs'

interface PresetData {
	name: string;
	color: string;
	sort: string;
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
			const { slug, name, color, sort, icon, projectName } = req.body;
			if (!slug) throw Error('No slug passed')
			console.log('Received request body:', req.body);
			const presetPath = `${presetsDir}/${slug}.json`;
			console.log('Preset path:', presetPath);
			const presetData: PresetData = {
				name,
				color,
				sort: `${sort}`,
				icon,
			};
			console.log('Preset data:', presetData);
			await fs.writeFileSync(presetPath, JSON.stringify(presetData));
			console.log('Preset data written to file');
			const updatedData = await fetchPresets(id, presetsDir)
			res.status(200).json({ data: updatedData, error: null });
			console.log('Response sent');
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: error instanceof Error ? error.message : null });
	}
}

	export default handler;



