import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import os from 'os'
import { parseForm, FormidableError } from "../../lib/parse-form";
import {   desconstructPresets,
  desconstructSvgSprite,
  copyFiles,
  extractConfig,
  createPackageJson,
 } from 'mapeo-config-deconstructor/src/'
 import configRenderer from '../../../mapeo-config-renderer/api'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: {
      url: string;
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
  // Just after the "Method Not Allowed" code
  try {
		const hostname = os.hostname();
		const protocol = process.env.PRODUCTION ? 'https' : 'http'
    const { fields, files } = await parseForm(req);
    const file = files.media;
    let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
		const projectId = randomUUID()
		console.log("Building project", projectId);
		const outputDir = `/tmp/mapeo-extracted-${projectId}`
		const { configFolder, outputFolder } = await extractConfig(
			url,
			outputDir
		);
		const randomPort = Math.floor(Math.random() * (9999 - 3033 + 1)) + 3033;
		console.log('configFolder, outputFolder', configFolder, outputFolder);
		await desconstructPresets(configFolder, outputFolder);
		await desconstructSvgSprite(configFolder, outputFolder);
		await copyFiles(configFolder, outputFolder);
		await createPackageJson(configFolder, outputFolder);
		configRenderer(outputFolder, randomPort)
		console.log("Done!");
    res.status(200).json({
      data: {
        url: `${protocol}://${hostname}:${randomPort}`,
      },
      error: null,
    });
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ data: null, error: e.message });
    } else {
      console.error(e);
      res.status(500).json({ data: null, error: "Internal Server Error" });
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
