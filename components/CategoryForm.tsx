import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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

	const clearForm = () => {
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

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files ? event.target.files[0] : null
		/** File validation */
		if (!file?.name.endsWith('.svg')) {
			alert("Please select a valid .svg file");
			return;
		}
		setIconFile(file);
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

	return (
		<form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md md:w-full h-screen md:h-auto">
			<div className="flex justify-between">
				<button onClick={clearForm} className="bg-red-500 hover:bg-red-700 text-white font-bold rounded-full p-4 absolute top-5 right-5">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div className="mb-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icon">
					Icon
				</label>
				<div className="flex justify-center mb-4">
					<div className="rounded-full border-4 h-36 w-36" style={{ borderColor: formState.color }}>
						{iconFile ? (
							<img src={URL.createObjectURL(iconFile)} alt="Icon Preview" className="p-4" />
						) : iconPath ? (
							<img src={iconPath} alt="Icon Preview" className="p-4" />
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="p-4">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 17l10 5 10-5" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12l10 5 10-5" />
							</svg>
						)}
					</div>
				</div>
				<input
					className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					id="icon"
					type="file"
					name="icon"
					accept=".svg"
					onChange={handleFileChange}
				/>
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
				{!createNew && <button onClick={onDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={uploading}>
					Delete
				</button>}
				<button className={uploading ? "bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"} type="submit" disabled={uploading}>
					{uploading ? 'Uploading...' : createNew ? 'Create' : 'Save'}
				</button>
			</div>
		</form>
	);
};

export default CategoryForm;

