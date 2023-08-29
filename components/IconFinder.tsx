import React, { useState, useEffect } from 'react';

interface IconFinderProps {
	onCancel: () => void;
	onSelect: (icon: string) => void;
}

const IconFinder: React.FC<IconFinderProps> = ({ onCancel, onSelect }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [icons, setIcons] = useState([]);
	const [page, setPage] = useState(1);

	useEffect(() => {
		fetchIcons();
	}, [searchTerm, page]);

	const fetchIcons = async () => {
		const response = await fetch(`https://icons.earthdefenderstoolkit.com/api/search?s=${searchTerm}&l=en&p=${page}`);
		const data = await response.json();
		setIcons(data);
	};

	const handleLoadMore = () => {
		setPage(page + 1);
	};

	return (
		<div>
			<input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search icons" />
			<div>
				{icons.map((icon, index) => (
					<div key={index}>
						<img src={icon} alt="Icon" />
						<button onClick={() => onSelect(icon)}>Select</button>
					</div>
				))}
			</div>
			<button onClick={handleLoadMore}>Load more</button>
			<button onClick={onCancel}>Cancel</button>
		</div>
	);
};

export default IconFinder;
