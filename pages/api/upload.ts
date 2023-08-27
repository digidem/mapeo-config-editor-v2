import type { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "../../lib/parse-form";
import {   desconstructPresets,
  desconstructSvgSprite,
  copyFiles,
  extractConfig,
  createPackageJson,
 } from 'mapeo-config-deconstructor/src/'
import getOutputDir from "../../lib/getOutputDir";

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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      data: { id: null },
      error: "Method Not Allowed",
    });
    return;
  }
  // Just after the "Method Not Allowed" code
  try {
    const { fields, files } = await parseForm(req);
    const file = files.media;
    let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
		const {outputDir, projectId} = getOutputDir(undefined)
		const { configFolder, outputFolder } = await extractConfig(
			url,
			outputDir
		);
		console.log('configFolder, outputFolder', configFolder, outputFolder);
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
