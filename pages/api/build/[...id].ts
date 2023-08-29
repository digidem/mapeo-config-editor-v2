import type { NextApiRequest, NextApiResponse } from "next";
import path from 'path'
const settingsBuilder = require('mapeo-settings-builder/commands/build_lint.js') as (options: { output: string }, outputDir: string) => Promise<void>;
import getOutputDir from "../../../lib/getOutputDir";
import generateDefault from "../../../lib/generateDefault"
import fs from 'fs'

function bumpVersion(version: string, bumpType: 'major' | 'minor' | 'patch' = 'patch') {
	let versionParts = version.split('.');
	switch (bumpType) {
		case 'major':
			let majorVersion = parseInt(versionParts[0]);
			majorVersion++;
			versionParts[0] = majorVersion.toString();
			break;
		case 'minor':
			let minorVersion = parseInt(versionParts[1]);
			minorVersion++;
			versionParts[1] = minorVersion.toString();
			break;
		case 'patch':
		default:
			let patchVersion = parseInt(versionParts[2]);
			patchVersion++;
			versionParts[2] = patchVersion.toString();
			break;
	}
	return versionParts.join('.');
}
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
	let bumpType: 'major' | 'minor' | 'patch' = Array.isArray(req.query.bumpType) ? req.query.bumpType[0] as 'major' | 'minor' | 'patch' : (req.query.bumpType as 'major' | 'minor' | 'patch') || 'patch';
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

	const outputFile = `${buildDir}/${name}-${bumpVersion(version, bumpType)}.mapeosettings`
	if (req.method == "POST") {
		try {
			// runs build on it
			if (!fs.existsSync(buildDir)) {
				fs.mkdirSync(buildDir);
			}
			// Bump the version in the metadata.json file

			metadata.version = bumpVersion(version, bumpType);
			fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');
			// update defaults
			await generateDefault(outputDir)
			const build = await settingsBuilder({ output: outputFile }, outputDir)
		} catch (err) {
			console.error(err)
		}
	} else if (req.method == 'GET') {
		try {
			const settingsFiles = fs.readdirSync(buildDir).filter(fn => fn.endsWith('.mapeosettings'));
			if (settingsFiles.length > 0) {
				const files = fs.readdirSync(outputDir);
				for (const file of files) {
					if (file !== 'build' && file !== 'metadata.json') {
						const filePath = path.join(outputDir, file);
						if (fs.lstatSync(filePath).isDirectory()) {
							fs.rmdirSync(filePath, { recursive: true });
						} else {
							fs.unlinkSync(filePath);
						}
					}
				}
				const filePath = `/api/file?id=${id}&name=${settingsFiles[0]}`
				res.status(200).json({ status: 'done', build: filePath, name, version, error: null, });
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
