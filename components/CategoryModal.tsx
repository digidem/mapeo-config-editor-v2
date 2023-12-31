import React, { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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

const CategoryModal: React.FC<CategoryModalProps> = ({ id, isOpen, setIsOpen, selectedPreset, handleUpdatePreset, handleCreatePreset, handleDeletePreset }) => {
	const cancelButtonRef = useRef(null);
	const createNew = !selectedPreset
	return (
		<Transition show={isOpen} as={Fragment}>
			<Dialog
				as="div"
				className="fixed inset-0 z-10 overflow-y-auto"
				initialFocus={cancelButtonRef}
				static
				open={isOpen}
				onClose={() => { }}
			>
				<div className="min-h-screen px-4 text-center">
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
					</Transition.Child>
					<span
						className="inline-block h-screen align-middle"
						aria-hidden="true"
					>
						&#8203;
					</span>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
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
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	)
};

export default CategoryModal;
