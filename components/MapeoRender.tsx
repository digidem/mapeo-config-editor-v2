import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import CategoryForm from './CategoryForm';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';

interface Preset {
	name: string;
	color: string;
	iconPath: string;
}

const fetchPresets = async (id): Promise<{ data: Preset[] | null }> => {
	if (!id || id.trim() === '') {
		console.error('Invalid ID:', id)
		return Promise.resolve({ data: null });
	}
	try {
		const response = await fetch(`/api/project/${id}`)
		const data = await response.json()
		console.log('Presets response:', data)
		return data;
	} catch (error) {
		console.error('Error fetching presets:', error)
		return Promise.resolve({ data: null });
	}
};

const MapeoRender = ({ id }) => {
	const [presets, setPresets] = useState<Preset[] | null>(null);
	const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
	const [error, setError] = useState<String | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const cancelButtonRef = useRef(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await fetchPresets(id);
				if (data === null) {
					throw new Error('Error fetching presets');
				}
				setPresets(data);
			} catch (error) {
				console.error('Error fetching presets:', error);
				setError((error as Error)?.message);
			}
		};
		if (id && id.trim() !== '') {
			fetchData()
		}
	}, [id]);
	return (
		<div>
			<div className="flex flex-col md:flex-row">
				<div className={styles.phoneouterframe}>
					<div className={styles.phoneframe}>
						<div className={styles.icongrid}>
							{presets && presets.length === 0 && <span className={styles.verticalcenter}>Loading...</span>}
							{presets && presets.map((preset: Preset, index: number) => (
								<div key={`${preset.name}-${index}`} className={styles.iconcontainer} onClick={() => {setSelectedPreset(preset); setIsOpen(true);}}>
									<div
										className={styles.icon}
										style={{
											backgroundColor: 'white',
											borderColor: preset.color,
											borderWidth: 3.5,
										}}
									>
										<img
											src={preset.iconPath}
											alt={preset.name}
											style={{ maxWidth: '35px', height: '35px' }}
										/>
									</div>
									<div className={styles.iconname}>{preset.name}</div>
								</div>
							))}
							{!presets && !error && <span className={styles.verticalcenter}>Loading...</span>}
							{error && <span className={styles.verticalcenter}>Mapeo configuration folder not detected, make sure you are inside or passing the right folder</span>}
						</div>
					</div>
					<div className="md:w-1/2">
						{selectedPreset && (
							<Transition show={isOpen} as={Fragment}>
								<Dialog
									as="div"
									className="fixed inset-0 z-10 overflow-y-auto"
									initialFocus={cancelButtonRef}
									static
									open={isOpen}
									onClose={setIsOpen}
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
													icon={selectedPreset.iconPath}
													name={selectedPreset.name}
													borderColor={selectedPreset.color}
													sortValues={[]} // Assuming sortValues is not part of the Preset type
													onSave={(data) => {
														console.log(data);
														// Call to backend goes here
														setIsOpen(false);
													}}
												/>
											</div>
										</Transition.Child>
									</div>
								</Dialog>
							</Transition>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MapeoRender;



