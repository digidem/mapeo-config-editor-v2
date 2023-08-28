import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface CategoryFormProps {
	slug: string;
	icon: string;
	name: string;
	color: string;
	iconPath: string;
	sort: number;
	onSave: (data: { icon: string, name: string, color: string, sort: number }) => void;
	onCancel: () => void; // Added onCancel prop
}

const CategoryForm: React.FC<CategoryFormProps> = ({ iconPath, icon, name, color, sort = 0, onSave, onCancel }) => { // Added onCancel prop
	const [formState, setFormState] = useState({ icon, name, color, sort });
	const [iconFile, setIconFile] = useState<File | null>(null);

	useEffect(() => {
		setFormState({ icon, name, color, sort });
	}, [icon, name, color, sort]);

	const clearForm = () => {
		setFormState({ icon, name, color, sort });
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
		setIconFile(event.target.files ? event.target.files[0] : null);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSave({
			...formState
		});
	};

	return (
		<form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md md:w-full h-screen md:h-auto">
			<div className="mb-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icon">
					Icon
				</label>
				<div className="flex justify-center mb-4">
					<div className="rounded-full border-4 h-36 w-36" style={{ borderColor: formState.color }}>
						<img src={iconPath} alt="Icon Preview" className="p-4" />
					</div>
				</div>
				{/* <input
					className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					id="icon"
					type="file"
					name="icon"
					onChange={handleFileChange}
				/> */}
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
					value={formState.name}
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
				<button onClick={clearForm} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
					Cancel
				</button>
				<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
					Save
				</button>
			</div>
		</form>
	);
};

export default CategoryForm;
