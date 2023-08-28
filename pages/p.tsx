import { useRouter } from 'next/router'
import MapeoRender from '../components/MapeoRender'
import styles from '../components/styles.module.css'
import { useState, useEffect } from 'react'

const Project = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [isChecked, setIsChecked] = useState(false)
	const router = useRouter()
	const id = Array.isArray(router.query?.id) ? router.query?.id[0] : router.query?.id;
	useEffect(() => {
		const checkBuild = async () => {
			if (id) {
				try {
					const response = await fetch(`/api/build/${id}`)
					const { build, status } = await response.json()
					console.log('Build response:', status)
					if (status === 'done' || status === 'building') {
						router.push(`/build?id=${id}`)
					}
				} catch (error) {
					console.error('Error building:', error)
				}
				setIsChecked(true)
			}
		}
		checkBuild()
	}, [id])
	const reset = () => router.push('/')
	const build = async () => {
		setIsLoading(true)
		console.log('building')
		fetch(`/api/build/${id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		router.push(`/build?id=${id}`)
		// try {
		// 	const response = await fetch(`/api/build/${ id }`, {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 		},
		// 	})
		// 	const data = await response.json()
		// 	console.log('Build response:', data)
		// } catch (error) {
		// 	console.error('Error building:', error)
		// } finally {
		// 	setIsLoading(false)
		//  router.push(`/build?id=${id}`)
		// }
	}
	return (
		<div className={`${styles.verticalcenter} pt-4`}>
			{isChecked && <div>
				<MapeoRender id={id || ''} />
				<div className="flex justify-between items-center bg-gray-200 p-4 rounded-lg mt-4">
					<button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 focus:outline-none" onClick={() => reset()}>Restart</button>
					<button className={isLoading ? "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none" : "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"} onClick={() => build()} disabled={isLoading}>
						{isLoading ? 'Building...' : 'Build'}
					</button>
				</div>
			</div>}
		</div >
	);
};

export default Project;


