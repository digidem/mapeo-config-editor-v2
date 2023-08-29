import { NextApiRequest, NextApiResponse } from "next";
import { parseForm, FormidableError } from "../../../../lib/parse-form";
import getOutputDir from "../../../../lib/getOutputDir";
import crypto from 'crypto';

import fs from 'fs'
const ResponseData = {
  icon: String || null
}

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: { icon: string | null } | null;
		error: string | null;	
	}>
) => {
  let data = ResponseData;
  let error = String || null;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      data: { icon: null },
      error: "Method Not Allowed",
    });
    return;
  }
  // Just after the "Method Not Allowed" code
	const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
	if (!id) {
		res.status(400).json({
			data: { icon: '' },
			error: "Missing id",
		});
		return;
	}
	const { fields, files } = await parseForm(req);
	const file = files.icon
	const { outputDir } = getOutputDir(id)
	const iconsDir = `${outputDir}/icons`;
  try {
		let fileUrl = Array.isArray(file) ? file[0].filepath : file.filepath;    const uuid = crypto.randomBytes(16).toString('hex');
    const newFilePath100 = `${iconsDir}/${uuid}-100px.svg`;
    const newFilePath24 = `${iconsDir}/${uuid}-24px.svg`;
    await fs.promises.copyFile(fileUrl, newFilePath100);
    await fs.promises.copyFile(fileUrl, newFilePath24);
    res.status(200).json({
      data: {
        icon: uuid,
      },
      error: null,
    });
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ data: { icon: null }, error: e.message });
    } else {
      console.error(e);
      res.status(500).json({ data: { icon: null }, error: "Internal Server Error" });
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
