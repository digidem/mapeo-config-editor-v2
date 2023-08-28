import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import CategoryModal from './CategoryModal';

export interface Preset {
	name: string;
	color: string;
	iconPath: string;
	sort: number;
	icon: string;
	slug: string;
}
const fetchPresets = async (id): Promise<{ data: Preset[] | null }> => {
	if (!id || id.trim() === '') {
		console.error('Invalid ID:', id)
		return Promise.resolve({ data: null });
	}
	try {
		const response = await fetch(`/api/project/${id}`)
		const data = await response.json()
		return data;
	} catch (error) {
		console.error('Error fetching presets:', error)
		return Promise.resolve({ data: null });
	}
};

const updatePreset = async (id, slug, formState) => {
	const body = { ...formState, slug }
	const response = await fetch(`/api/project/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	const data = await response.json();
	return data

}

const MapeoRender = ({ id }) => {
	const [presets, setPresets] = useState<Preset[] | null>(null);
	const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
	const [error, setError] = useState<String | null>(null);
	const [isOpen, setIsOpen] = useState(false);


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
	const handleDeletePreset = async (slug) => {
		try {
			const response = await fetch(`/api/project/${id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ slug }),
			});
			const { data } = await response.json();
			setPresets(data);
		} catch (error) {
			console.error('Error deleting preset:', error);
			setError((error as Error)?.message);
		}
	};

	const handleCreatePreset = async (formState) => {
		try {
			const response = await fetch(`/api/project/${id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formState),
			});
			const { data } = await response.json();
			setPresets(data);
		} catch (error) {
			console.error('Error creating preset:', error);
			setError((error as Error)?.message);
		}
	};

	const handleUpdatePreset = async (slug, formState) => {
		try {
			const { data } = await updatePreset(id, slug, formState)
			setPresets(data);
		} catch (error) {
			console.error('Error fetching presets:', error);
			setError((error as Error)?.message);
		}
	}
	return (
		<div>
			<div className="flex flex-col md:flex-row">
				<div className={styles.phoneouterframe}>
					<div className={styles.phoneframe}>
						<div className={styles.categorygrid}>
							<button onClick={() => setIsOpen(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
								Create Preset
							</button>
							{presets && presets.length === 0 && <span className={styles.verticalcenter}>Loading...</span>}
							{presets && presets.map((preset: Preset, index: number) => (
								<div key={`${preset.slug}-${index}`} className={styles.categorycontainer}>
									<div
										className={styles.icon}
										style={{
											backgroundColor: 'white',
											borderColor: preset.color,
											borderWidth: 3.5,
										}}
										onClick={() => { setSelectedPreset(preset); setIsOpen(true); }}
									>
										<img
											src={preset.iconPath}
											alt={preset.name}
											style={{ maxWidth: '35px', height: '35px' }}
										/>
									</div>
									<div className={styles.iconname}>{preset.name}</div>
									<button onClick={() => handleDeletePreset(preset.slug)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
										Delete
									</button>
								</div>
							))}
							{!presets && !error && <span className={styles.verticalcenter}>Loading...</span>}
							{error && <span className={styles.verticalcenter}>Mapeo configuration folder not detected, make sure you are inside or passing the right folder</span>}
						</div>
					</div>
					<div className="md:w-1/2">
						<CategoryModal handleUpdatePreset={handleUpdatePreset} isOpen={isOpen} setIsOpen={setIsOpen} selectedPreset={selectedPreset} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default MapeoRender;



