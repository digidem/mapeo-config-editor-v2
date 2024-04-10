import Head from "next/head";
import { useRouter } from 'next/router'
import MapeoRender from '../components/MapeoRender'
import { useState, useEffect } from 'react'

const Project = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [isChecked, setIsChecked] = useState(false)
	const [name, setName] = useState('')
	const [version, setVersion] = useState('')
	const router = useRouter()
	const id = Array.isArray(router.query?.id) ? router.query?.id[0] : router.query?.id;
	useEffect(() => {
		const checkBuild = async () => {
			if (id) {
				try {
					const response = await fetch(`/api/build/${id}`)
					const data = await response.json()
					setName(data.name)
					setVersion(data.version)
					const { status } = data
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
	}, [id, router])
	const reset = () => router.push('/')
	const build = async () => {
		setIsLoading(true)
		fetch(`/api/build/${id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		router.push(`/build?id=${id}`)
	}
	return (
		<div className="flex items-center justify-center min-h-screen bg-blue-900">
			<Head>
				<title>{name || 'Config'}</title>
				<meta name="description" content={version || 'v0.0.1'} />
			</Head>
			{isChecked && <div className="flex flex-col items-center justify-center">
				<div className="flex flex-col text-center sm:text-left items-center justify-center text-white pb-4 w-full">
					<div className="flex flex-col sm:flex-row items-center justify-center">
						<img src="/mapeo.png" alt="Mapeo logo" className="mr-4" style={{ width: '45px' }} />
						<h1 className="text-4xl mr-4">{name}</h1>
					</div>
					<h2 className="text-caption">{version}</h2>
				</div>
				<MapeoRender id={id || ''} />
				<div className="flex flex-col sm:flex-row justify-between items-center bg-blue-700 p-4 rounded-lg mt-4 w-[300px] sm:w-[380px]">
					<button className="w-[160px] mb-8 sm:mb-0 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none mx-2" onClick={() => reset()}>Restart</button>
					<button className={isLoading ? "w-[160px] px-4 py-2 bg-white text-blue-900 rounded hover:bg-green-500 focus:outline-none mx-2" : "w-[160px] px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none mx-2"} onClick={() => build()} disabled={isLoading}>
						{isLoading ? 'Building...' : 'Build'}
					</button>
				</div>
			</div>}
		</div >
	);
};

export default Project;


