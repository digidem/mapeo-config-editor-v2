import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import CategoryForm from './CategoryForm';

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
		<div className={styles.phoneouterframe}>
			<div className={styles.phoneframe}>
				<div className={styles.icongrid}>
					{presets && presets.length === 0 && <span className={styles.verticalcenter}>Loading...</span>}
					{presets && presets.map((preset: Preset, index: number) => (
						<div key={`${preset.name}-${index}`} className={styles.iconcontainer} onClick={() => setSelectedPreset(preset)}>
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
			{selectedPreset && (
				<CategoryForm
					icon={selectedPreset.iconPath}
					name={selectedPreset.name}
					borderColor={selectedPreset.color}
					sortValues={[]} // Assuming sortValues is not part of the Preset type
					onSave={(data) => {
						console.log(data);
						// Call to backend goes here
					}}
				/>
			)}
		</div>
	);
};

export default MapeoRender;


