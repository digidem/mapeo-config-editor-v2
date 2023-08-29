import type { NextApiRequest, NextApiResponse } from "next";
import getPresets from 'mapeo-config-renderer/api/lib/getPresets'
import getOutputDir from "../../../lib/getOutputDir";
import fs from 'fs'

// Define the structure of the PresetData
interface PresetData {
	name: string;
	color: string;
	sort: number;
	icon: string;
}

// Define the structure of the CreatePresetData which extends PresetData
interface CreatePresetData extends PresetData {
	fields: any[];
	geometry: ('point' | 'area' | 'line')[];
	tags: any;
}

// Function to fetch presets
async function fetchPresets(id, presetsDir) {
	// Get presets from the directory
	const data = await getPresets(presetsDir)
	// Map the data to include sort and iconPath
	return data.map(i => ({
		...i,
		sort: parseInt(i.sort),
		iconPath: `/api/icon?name=${i.icon}&id=${id}`
	}))
}

// Main handler function
const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: PresetData[] | null;
		error: string | null;
	}>
) => {
	try {
		// Get the id from the request
		const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
		// Get the output directory
		const { outputDir } = getOutputDir(id)
		const presetsDir = `${outputDir}/presets`;

		// Handle GET request
		if (req.method === "GET") {
			// Fetch presets
			const data = await fetchPresets(id, presetsDir)
			// Send response
			res.status(200).json({
				data,
				error: null,
			});

		// Handle PUT request
		} else if (req.method === "PUT") {
			// Extract data from request body
			const { slug, name, color, sort, icon, projectName } = req.body;
			if (!slug) throw Error('No slug passed')
			console.log('Received request body:', req.body);
			const presetPath = `${presetsDir}/${slug}.json`;
			console.log('Preset path:', presetPath);
			let presetData: PresetData = {
				name,
				color,
				sort: parseInt(sort) || 0,
				icon,
			};
			console.log('Preset data:', presetData);
			// Check if preset already exists
			if (fs.existsSync(presetPath)) {
				const existingData = await JSON.parse(fs.readFileSync(presetPath, 'utf-8'));
				presetData = { ...existingData, ...presetData };
			}
			// Write preset data to file
			await fs.writeFileSync(presetPath, JSON.stringify(presetData));
			console.log('Preset data written to file');
			// Fetch updated presets
			const updatedData = await fetchPresets(id, presetsDir)
			// Send response
			res.status(200).json({ data: updatedData, error: null });
			console.log('Response sent');
		// Handle DELETE request
		} else if (req.method === "DELETE") {
			// Extract slug from request body
			const { slug } = req.body;
			if (!slug) throw Error('No slug passed');
			const presetPath = `${presetsDir}/${slug}.json`;
			// Check if preset exists
			if (fs.existsSync(presetPath)) {
				// Delete preset
				fs.unlinkSync(presetPath);
				console.log('Preset file deleted');
			} else {
				throw Error('Preset file not found');
			}
			// Fetch updated presets
			const updatedData = await fetchPresets(id, presetsDir)
			// Send response
			res.status(200).json({ data: updatedData, error: null });
			console.log('Response sent');
		// Handle POST request
		} else if (req.method === "POST") {
			// Extract data from request body
			const { name, color, sort, icon } = req.body;
			const slug = name.toLowerCase().replace(/ /g, '-');
			if (!name) throw Error('No name passed');
			if (!icon) throw Error('No icon passed');
			const presetPath = `${presetsDir}/${slug}.json`;
			const tags = {
				type: name
			}
			let presetData: CreatePresetData = {
				name,
				color: color || '#000000',
				sort: parseInt(sort) || 0,
				icon,
				fields: [],
				geometry: ['point'],
				tags
			};
			// Write preset data to file
			await fs.writeFileSync(presetPath, JSON.stringify(presetData));
			console.log('Preset data written to file');
			// Fetch updated presets
			const updatedData = await fetchPresets(id, presetsDir)
			// Send response
			res.status(200).json({ data: updatedData, error: null });
			console.log('Response sent');
		}
	} catch (error) {
		// Handle errors
		console.error(error)
		res.status(500).json({ data: null, error: error instanceof Error ? error.message : null });
	}
}

// Export the handler
export default handler;



