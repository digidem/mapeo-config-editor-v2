import React from 'react';
import CategoryForm from './CategoryForm';
import { Preset } from './MapeoRender';

interface CategoryModalProps {
	id: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	selectedPreset: Preset | null;
	handleUpdatePreset:
	(slug: string | undefined, form: { icon: string, name: string, color: string, sort: number }) => void;
	handleCreatePreset:
	(form: { icon: string, name: string, color: string, sort: number }) => void;
	handleDeletePreset:
	(slug: string | undefined) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
	id,
	isOpen,
	setIsOpen,
	selectedPreset,
	handleUpdatePreset,
	handleCreatePreset,
	handleDeletePreset
}) => {
	const createNew = !selectedPreset;

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-10 overflow-y-auto">
			<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
				{/* Background overlay */}
				<div
					className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
					onClick={() => setIsOpen(false)}
				></div>

				{/* Modal content */}
				<div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-20">
					<CategoryForm
						id={id}
						{...selectedPreset}
						onSave={(formState) => {
							handleUpdatePreset(selectedPreset?.slug, formState)
							setIsOpen(false);
						}}
						onCancel={() => setIsOpen(false)}
						onDelete={() => {
							handleDeletePreset(selectedPreset?.slug);
							setIsOpen(false);
						}}
						onCreate={(formState) => {
							handleCreatePreset(formState);
							setIsOpen(false);
						}}
						createNew={createNew}
					/>
				</div>
			</div>
		</div>
	);
};

export default CategoryModal;
