import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { SearchIcon } from "./Icons"
import styles from './styles.module.css'
import colorize from '../lib/colorize.js'

interface IconFinderProps {
	term: string;
	baseUrl: string;
	onCancel: () => void;
	onSave: (iconUrl: string, iconColor: string) => void;
}

const IconFinder: React.FC<IconFinderProps> = ({ term, onCancel, onSave, baseUrl }) => {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState(term.toLowerCase() || '');
	const [icons, setIcons] = useState<any[]>([]);
	const [page, setPage] = useState(1);
	const [selectedIcon, setSelectedIcon] = useState(icons[0]);
	const [color, setColor] = useState('#000');

	useEffect(() => {
		fetchIcons();
	}, [page]);


	const fetchIcons = async (append?) => {
		const searchUrl = `${baseUrl}/search?s=${searchTerm}&l=en&p=${page}`
		setLoading(true)
		try {
			setError(null)
			const response = await fetch(searchUrl);
			let data = await response.json();
			// Ensure data is an array before setting it to icons
			if (!Array.isArray(data)) {
				data = [];
			}
			if (append) {
				setIcons(prevIcons => {
					const newData = [...prevIcons, ...data]
					console.log('APPENDED', newData.length === prevIcons.length + data.length, newData.length)
					return newData
				});
			} else setIcons(data)
			setLoading(false)
		} catch (error) {
			const err = error as Error;
			console.error(err);
			setError(err?.message)
			setLoading(false)
		}
	}

	const handleLoadMore = async () => {
		setPage(page + 1);
		await fetchIcons(true)
	};
	const uniqueIcons = Array.from(new Set(icons));
	// const colorFilter = useMemo(() => {
	// 	const filter = colorize(color);
	// 	return filter;
	// }, [color]);
	const filterStyle = colorize(color); // replace '#ff0000' with your desired color
	return (
		<form onSubmit={(e) => {
			e.preventDefault()
			fetchIcons()
		}}>
			<div className="flex flex-col items-center justify-center w-full">
				{loading && <div className="py-8 flex justify-center items-center h-full">
					<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 m-auto"></div>
				</div>}
				{error &&
					<div className="py-8 flex justify-center items-center h-full">
						<p className="text-center m-auto">Sorry we couldn not find anything with the term {searchTerm}</p>
					</div>}
				<div className={`${styles.scrollbar} overflow-y-scroll max-h-[500px] grid grid-cols-2 sm:grid-cols-3 gap-4 w-full items-center justify-center`}>
					{(!loading && !error) && uniqueIcons.map((icon, index) => (
						<div onClick={() => setSelectedIcon(icon)} key={index} className={`cursor-pointer flex flex-col items-center justify-center border-4 sm:h-[120px] rounded-full`} style={{ borderColor: icon === selectedIcon ? color : 'white' }}>
							<Image width={30} height={30} unoptimized src={icon} alt="Icon" className="w-24 h-24 p-3 m-auto" style={{...filterStyle}} />
						</div>
					))}
				</div>
				<div className="flex flex-row items-center justify-between w-full">
					<input id="iconSearch" type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value) }} placeholder="Search icons" className="py-3 pl-6 border-2 rounded-l-full shadow-md mb-0 mr-2 flex-grow" style={{ width: '70%' }} />
					<button type="submit" className="mt-0 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-full w-auto"><SearchIcon /></button>
				</div>
				<div className="border-violet-800 border-2 border-dashed flex flex-col sm:flex-row items-center justify-center w-full my-4 sm:my-12">
					<label htmlFor="colorPicker" className="text-lg font-bold mb-0">Pick color</label>
					<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="cursor-pointer mt-4 ml-4 p-4 sm:my-8 rounded-full w-10 h-10" style={{ backgroundColor: color }} />
				</div>
				<div className="flex flex-col sm:flex-row items-center justify-around w-full mt-4">
					<button onClick={onCancel} className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded w-full sm:w-auto">Cancel</button>
					<button onClick={handleLoadMore} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto">Load more</button>
					<button disabled={!selectedIcon} onClick={() => onSave(selectedIcon, color)} className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto">Save</button>
				</div>
			</div>
		</form>
	);
};

export default IconFinder;
