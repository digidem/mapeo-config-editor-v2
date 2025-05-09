import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import IconFinder from './IconFinder'

interface CategoryFormProps {
	id?: string;
	slug?: string;
	icon?: string;
	name?: string;
	color?: string;
	iconPath?: string;
	sort?: number;
	createNew?: boolean;
	onSave: (data: { icon: string, name: string, color: string, sort: number }) => void;
	onCancel: () => void;
	onDelete: () => void;
	onCreate: (form: { icon: string, name: string, color: string, sort: number }) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
	id,
	icon = '',
	name = '',
	color = '',
	sort = 0,
	iconPath,
	onSave,
	onDelete,
	onCreate,
	onCancel,
	createNew = false
}) => { // Added onCancel prop and default values
	const [uploading, setUploading] = useState(false);
	const [showIconFinder, setShowIconFinder] = useState(false); // New state variable

	const [formState, setFormState] = useState({
		icon,
		name,
		color,
		sort,
	});
	const [iconFile, setIconFile] = useState<File | null>(null);

	useEffect(() => {
		if (createNew) {
			setFormState({ icon: '', name: '', color: '', sort: 0 });
		} else {
			setFormState({ icon, name, color, sort });
		}
	}, [icon, name, color, sort, createNew]);

	const clearForm = (e) => {
		e.preventDefault()
		if (createNew) {
			setFormState({ icon: '', name: '', color: '', sort: 0 });
		} else {
			setFormState({ icon, name, color, sort });
		}
		setIconFile(null);
		onCancel(); // Added onCancel action
	}

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setFormState({
			...formState,
			[event.target.name]: event.target.value,
		});
	};

	const baseUrl = `https://icons.earthdefenderstoolkit.com/api`

	const handleFileChange = async (file: File | string, color?: string) => {
		if (typeof file === 'string') {
			const generateUrl = `${baseUrl}/generate?image=${file}&color=${color?.split('#')[1]}`;
			// Call the API with the file URL and color
			try {
				const response = await fetch(generateUrl);
				const data = await response.json();
				setIconFile(data[0]?.svg);
				setShowIconFinder(false)
			} catch (err) {
				console.error(err)
			}
		} else {
			/** File validation */
			if (!file?.name.endsWith('.svg')) {
				alert("Please select a valid .svg file");
				return;
			}
			setIconFile(file);

		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setUploading(true);
		try {
			const formData = new FormData();
			if (iconFile) {
				formData.append('icon', iconFile);
			}
			const response = await fetch(`/api/upload/icon/${id}`, {
				method: 'POST',
				body: formData,
			});
			const { data } = await response.json();
			if (!data?.icon && iconFile) {
				throw new Error('Network response was not ok');
			} else {
				const updatedFormState = {
					...formState,
					icon: data?.icon || formState.icon,
				};
				if (createNew) {
					onCreate(updatedFormState)
				} else {
					onSave(updatedFormState);
				}
			}
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setUploading(false);
		}
	};
	// Inside your component
	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			'image/svg+xml': ['.svg'],
		},
		onDrop: (acceptedFiles) => {
			handleFileChange(acceptedFiles[0]);
		},
		maxFiles: 1,
	});



	return (
		<>
			{showIconFinder ? <IconFinder baseUrl={baseUrl} onCancel={() => setShowIconFinder(false)} onSave={handleFileChange} term={formState.name} />
				: <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md md:w-full h-screen md:h-auto">
					<div className="flex justify-between">
						<button onClick={clearForm} className="bg-red-500 hover:bg-red-700 text-white font-bold rounded-full p-4 absolute top-5 right-5">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div className="mb-4">
						<div {...getRootProps()} className="flex justify-center mb-4 p-2 border-dashed border-2 flex-col items-center h-full cursor-pointer">
							<input {...getInputProps()} />
							<div className="rounded-full border-4 h-20 w-20 flex items-center justify-center" style={{ borderColor: formState.color }}>
								{iconFile ? (
									<img src={(typeof iconFile === 'string') ? iconFile : URL.createObjectURL(iconFile)} alt="Icon Preview" className="p-4" />
								) : iconPath ? (
									<img src={iconPath} alt="Icon Preview" className="p-4" />
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-[45px] w-[45px] animate-bounce">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
									</svg>
								)}
							</div>
							<p className="text-xs text-center mt-2">Click or drop SVG files here</p>
						</div>
					</div>
					<div className="flex justify-center">
						<button onClick={() => setShowIconFinder(true)} className="w-full my-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
							Search icons
						</button>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
							Name
						</label>
						<input
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="name"
							type="text"
							name="name"
							value={formState.name} // Add this line
							onChange={handleChange}
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
							Color
						</label>
						<input
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="color"
							type="color"
							name="color"
							style={{ backgroundColor: formState.color, height: '50px' }}
							value={formState.color}
							onChange={handleChange}
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sort">
							Ordering
						</label>
						<input
							className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							id="sort"
							type="number"
							name="sort"
							value={formState.sort || 0}
							onChange={handleChange}
						/>
					</div>
					<div className="flex items-center justify-between">
						{!createNew && <button onClick={onDelete} className="w-[120px] bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={uploading}>
							Delete
						</button>}
						<button className={uploading ? "w-[120px] bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" : "bg-blue-500 w-[120px] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"} type="submit" disabled={uploading}>
							{uploading ? 'Uploading...' : createNew ? 'Create' : 'Save'}
						</button>
					</div>
				</form>}
		</>
	);
};

export default CategoryForm;

