import { randomUUID } from "crypto";

export default (id: string | undefined) => {
	let projectId = id
	if (!id) {
		projectId = randomUUID()
	}
	const rootDir = process.env.ROOT_DIR || process.cwd()
	return {
		outputDir: `${rootDir}/uploads/mapeo-extracted-${projectId}`,
		projectId
	}
}