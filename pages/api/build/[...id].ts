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
	}>
) => {
	const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
	console.log('GOT ID', id)
	if (!id) {
		throw ('Must pass ID')
	}
	const { outputDir } = getOutputDir(id)
	const buildDir = path.join(outputDir, 'build')
	if (req.method == "POST") {
		try {
			// runs build on it
			if (!fs.existsSync(buildDir)){
				fs.mkdirSync(buildDir);
			}
			const build = await settingsBuilder({ output: buildDir }, outputDir)
			console.log('BUILD!!', build)
		} catch (err) {
			console.error(err)
		}
	} else if (req.method == 'GET') {
		try {
			const settingsFiles = fs.readdirSync(buildDir).filter(fn => fn.endsWith('.mapeosettings'));
			if (settingsFiles.length > 0) {
				const filePath = path.join(buildDir, settingsFiles[0]);
				res.status(200).json({ status: 'done', build: filePath, error: null });
			} else if (fs.existsSync(buildDir)) {
				res.status(200).json({ status: 'building', build: '', error: null });
			} else {
				res.status(500).json({ status: 'error', build: '', error: 'Build directory does not exist' });
			}
		} catch (err) {
			res.status(500).json({ status: 'error', build: '', error: (err as Error).toString() });		
		}
	}

}

export default handler;



