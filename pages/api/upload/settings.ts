import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import fs from "fs";
import { parseForm, FormidableError } from "../../../lib/parse-form";
import {   desconstructPresets,
  desconstructSvgSprite,
  copyFiles,
  extractConfig,
  createPackageJson,
 } from 'mapeo-config-deconstructor/src/'
import getOutputDir from "../../../lib/getOutputDir";

interface ResponseData {
  id: string | null;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{
    data: ResponseData;
    error: string | null;
  }>
) => {
  if (req.method === "GET") {
    try {
      const response = await fetch("https://api.github.com/repos/digidem/mapeo-default-config/releases/latest");
      const data = await response.json();
      const mapeoSettingsUrl = data.assets.find((asset: any) => asset.name === ".mapeosettings").browser_download_url;
      const fileResponse = await fetch(mapeoSettingsUrl);
      const buffer = await fileResponse.buffer();
      fs.writeFileSync("/tmp/.mapeosettings", buffer);
      res.status(200).json({ fileUrl: "/tmp/.mapeosettings" });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
  // Just after the "Method Not Allowed" code
  try {
    const { fields, files } = await parseForm(req);
    const file = files.media;
    let fileUrl = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
		const {outputDir, projectId} = getOutputDir(undefined)
		const { configFolder, outputFolder } = await extractConfig(
			fileUrl,
			outputDir
		);
		await desconstructPresets(configFolder, outputFolder);
		await desconstructSvgSprite(configFolder, outputFolder);
		await copyFiles(configFolder, outputFolder);
		await createPackageJson(configFolder, outputFolder);
		console.log("Done!");
    res.status(200).json({
      data: {
        id: projectId || null,
      },
      error: null,
    });
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ data: { id: null }, error: e.message });
    } else {
      console.error(e);
      res.status(500).json({ data: { id: null }, error: "Internal Server Error" });
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
