import type { NextApiRequest, NextApiResponse } from "next";
import path from 'path'
const settingsBuilder = require('mapeo-settings-builder/commands/build_lint.js')
import getOutputDir from "../../../lib/getOutputDir";
import fs from 'fs'

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		status: string | string[];
		build: string;
		error: string | null;
		name: string;
		version: string;
	}>
) => {
	const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
	let metadata = {
		name: 'unknown',
		version: 'v0.0.1'
	}
	if (!id) {
		throw ('Must pass ID')
	}
	const { outputDir } = getOutputDir(id)
	const buildDir = path.join(outputDir, 'build')
	try {
		metadata = JSON.parse(fs.readFileSync(path.join(outputDir, 'metadata.json'), 'utf8'));
	} catch (err) {
		console.error('Error reading metadata.json:', err);
	}
	const { name, version } = metadata;

	const outputFile = `${buildDir}/${name}-${version}.mapeosettings`
	if (req.method == "POST") {
		try {
			// runs build on it
			if (!fs.existsSync(buildDir)){
				fs.mkdirSync(buildDir);
			}
			// Bump the version in the metadata.json file
			let versionParts = metadata.version.split('.');
			let minorVersion = parseInt(versionParts[1]);
			minorVersion++;
			versionParts[1] = minorVersion.toString();
			metadata.version = versionParts.join('.');
			fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');

			const build = await settingsBuilder({ output: outputFile }, outputDir)
			console.log('BUILD!!', build)
		} catch (err) {
			console.error(err)
		}
	} else if (req.method == 'GET') {
		try {
			const settingsFiles = fs.readdirSync(buildDir).filter(fn => fn.endsWith('.mapeosettings'));
			if (settingsFiles.length > 0) {
				const filePath = path.join(buildDir, settingsFiles[0]);
				res.status(200).json({ status: 'done', build: filePath, name, version, error: null,  });
			} else if (fs.existsSync(buildDir)) {
				res.status(200).json({ status: 'building', build: '', error: null, name, version });
			} else {
				res.status(500).json({ status: 'error', build: '', error: 'Build directory does not exist', name, version });
			}
		} catch (err) {
			res.status(500).json({ status: 'error', build: '', error: (err as Error).toString(), name: name, version });		
		}
	}

}

export default handler;




