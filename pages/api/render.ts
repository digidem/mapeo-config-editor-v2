import type { NextApiRequest, NextApiResponse } from "next";
import configRenderer from '../../../mapeo-config-renderer/api'

const handler = async (
	req: NextApiRequest,
	res: NextApiResponse<{
		data: {
			port: string | string[];
		} | null;
		error: string | null;
	}>
) => {
	// if (req.method !== "POST") {
	// 	res.setHeader("Allow", "POST");
	// 	res.status(405).json({
	// 		data: null,
	// 		error: "Method Not Allowed",
	// 	});
	// 	return;
	// }
	// Just after the "Method Not Allowed" code
	try {
		// configRenderer(outputFolder, randomPort, true)
	} catch (err) {
		console.error(err)
	}
}

export default handler;

