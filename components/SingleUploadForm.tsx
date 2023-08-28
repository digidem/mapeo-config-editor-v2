import { ChangeEvent, MouseEvent, useState } from "react";
import { useRouter } from 'next/router'
import { useDropzone } from 'react-dropzone'

const SingleFileUploadForm = () => {
	const router = useRouter()
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);

	const onDrop = async (acceptedFiles: File[]) => {
		const file = acceptedFiles[0];

		/** File validation */
		if (!file.name.endsWith('.mapeosettings')) {
			alert("Please select a valid .mapeosettings file");
			return;
		}

		/** Setting file state */
		setFile(file); // we will use the file state, to send it later to the server
		setUploading(true);

		try {
			var formData = new FormData();
			formData.append("media", file);

			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const {
				data,
				error,
			}: {
				data: {
					id: string | string[];
				} | null;
				error: string | null;
			} = await res.json();

			if (error || !data) {
				alert(error || "Sorry! something went wrong.");
				setUploading(false);
				return;
			}

			console.log("File was uploaded successfylly:", data);
			const id = data?.id
			router.push(`/p?id=${id}`)
			setUploading(false);
		} catch (error) {
			console.error(error);
			alert("Sorry! something went wrong.");
			setUploading(false);
		}
	};

	const { getRootProps, getInputProps } = useDropzone({ onDrop});

	return (
		<div {...getRootProps()} className="w-full p-3 border border-gray-500 border-dashed">
			<input {...getInputProps()} />
			<div className="flex flex-col md:flex-row gap-1.5 md:py-4">
				<div className="flex-grow flex items-center justify-center">
					{uploading ? (
						<div className="mx-auto w-80 text-center animate-bounce">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 mx-auto">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
							</svg>
							Uploading
						</div>
					) : (
						<div className="flex flex-col items-center justify-center h-full py-3 transition-colors duration-150 cursor-pointer hover:text-gray-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-14 h-14"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							<strong className="text-sm font-medium">Drag and drop a .mapeosettings file here, or click to select file</strong>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SingleFileUploadForm;

