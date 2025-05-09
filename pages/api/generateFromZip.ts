import type { NextApiRequest, NextApiResponse } from "next";
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { parseForm } from "../../lib/parse-form";
import AdmZip from 'adm-zip';
import crypto from 'crypto';

const execAsync = promisify(exec);

async function runShellCommand(command: string) {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            console.error(`Error: ${stderr}`);
        }
        return stdout;
    } catch (error) {
        console.error(`Execution failed: ${error}`);
        throw error;
    }
}

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<{
        data: { file: string | null };
        error: string | null;
    }>
) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).json({
            data: { file: null },
            error: "Method Not Allowed",
        });
        return;
    }

    try {
        const { files } = await parseForm(req);
        const zipFile = files.file;
        const zipFilePath = Array.isArray(zipFile) ? zipFile[0]?.filepath : zipFile?.filepath;

        if (!zipFilePath) {
            res.status(400).json({
                data: { file: null },
                error: "No zip file uploaded",
            });
            return;
        }

        const uuid = crypto.randomBytes(16).toString('hex');
        const tmpDir = path.join(process.cwd(), 'tmp', uuid);
        const outputFile = path.join(tmpDir, 'output.mapeosettings');

        // Create tmp directory
        fs.mkdirSync(tmpDir, { recursive: true });

        // Unzip the file
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(tmpDir, true);

        // Run mapeo-settings-builder
        await runShellCommand(`cd ${tmpDir} && mapeo-settings-builder build --output ${outputFile}`);

        // Read the output file
        const outputData = fs.readFileSync(outputFile);

        // Clean up
        fs.rmSync(tmpDir, { recursive: true, force: true });

        // Send the file
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename=output.mapeosettings');
        res.status(200).send(outputData);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            data: { file: null },
            error: "Internal Server Error",
        });
    }
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;
