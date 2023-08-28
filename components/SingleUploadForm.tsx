import { ChangeEvent, MouseEvent, useState } from "react";
import { useRouter } from 'next/router'

const SingleFileUploadForm = () => {
	const router = useRouter()
	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [uploading, setUploading] = useState<boolean>(false);

	const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
		const fileInput = e.target;

		if (!fileInput.files) {
			alert("No file was chosen");
			return;
		}

		if (!fileInput.files || fileInput.files.length === 0) {
			alert("Files list is empty");
			return;
		}

		const file = fileInput.files[0];

		/** File validation */
		if (!file.name.endsWith('.mapeosettings')) {
			alert("Please select a valid .mapeosettings file");
			return;
		}

		/** Setting file state */
		setFile(file); // we will use the file state, to send it later to the server
		setPreviewUrl(URL.createObjectURL(file)); // we will use this to show the preview of the image

		/** Reset file input */
		e.currentTarget.type = "text";
		e.currentTarget.type = "file";
	};

	const onCancelFile = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (!previewUrl && !file) {
			return;
		}
		setFile(null);
		setPreviewUrl(null);
	};

	const onUploadFile = async (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (!file) {
			return;
		}

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
	return (
		<form
			className="w-full p-3 border border-gray-500 border-dashed"
			onSubmit={(e) => e.preventDefault()}
		>
			<div className="flex flex-col md:flex-row gap-1.5 md:py-4">
				<div className="flex-grow flex items-center justify-center">
					{previewUrl ? (
						<div className="mx-auto w-80 text-center">
							Config loaded!
						</div>
					) : (
						<label className="flex flex-col items-center justify-center h-full py-3 transition-colors duration-150 cursor-pointer hover:text-gray-600">
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
							<strong className="text-sm font-medium">Select a .mapeosettings file</strong>
							<input
								className="block w-0 h-0"
								name="file"
								type="file"
								accept=".mapeosettings"
								onChange={onFileUploadChange}
							/>
						</label>
					)}
				</div>
				<div className="flex mt-4 md:mt-0 md:flex-col justify-center gap-1.5">
					<button
						disabled={!previewUrl}
						onClick={onCancelFile}
						className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
					>
						Cancel
					</button>
					{uploading ? (
						<div>Uploading...</div>
					) : (
						<button
							disabled={!previewUrl}
							onClick={onUploadFile}
							className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
						>
							Load configuration
						</button>
					)}
				</div>
			</div>
		</form>
	);
};

export default SingleFileUploadForm;
