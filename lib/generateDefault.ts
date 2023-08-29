import fs from 'fs';
import path from 'path';

interface Preset {
	geometry: string[];
}

interface Data {
	[key: string]: string[];
}

const generateDefault = async (projectDir: string) => {
	try {
		console.log('Starting to generate default...');
		// Read the current contents of defaults.json
		const defaultsPath = path.join(projectDir, 'defaults.json');
		const data: Data = JSON.parse(await fs.promises.readFile(defaultsPath, 'utf8'));
		const presetFolder = path.join(projectDir, 'presets')
		// Retrieve the list of preset files from the presets folder
		const presetFiles = await fs.promises.readdir(presetFolder);

		for (const file of presetFiles) {
			// Read the preset file
			const presetPath = path.join(presetFolder, file);
			const preset: Preset = JSON.parse(await fs.promises.readFile(presetPath, 'utf8'));

			// Get the geometry type(s) from the preset
			const geometries = preset.geometry;

			geometries.forEach(geometry => {
				// Get the preset name without the file extension
				const presetName = path.parse(file).name;

				// Check if the preset name already exists in the corresponding array in defaults.json
				if (!data[geometry].includes(presetName)) {
					// If not, add the preset name to the array
					data[geometry].push(presetName);
				}
			});
		}

		// Iterate over each geometry type in defaults.json
		for (const geometry in data) {
			// Get the list of presets for the current geometry type
			const presets = data[geometry];

			// Create a new array to hold the valid presets
			let validPresets: string[] = [];
			// Iterate over each preset
			for (let i = 0; i < presets.length; i++) {
				const preset = presets[i];

				// Check if the preset file exists in the presets folder
				if (fs.existsSync(path.join(presetFolder, `${preset}.json`))) {
					// If it exists, add the preset to the validPresets array
					validPresets.push(preset);
				}
			}
			// Replace the old presets array with the new validPresets array
			data[geometry] = validPresets;
		}

		// Write the updated contents back to defaults.json
		await fs.promises.writeFile(defaultsPath, JSON.stringify(data, null, 4));
		console.log('Default generation completed successfully.');
	} catch (error) {
		console.error('Error during default generation:', error);
	}
};

export default generateDefault;