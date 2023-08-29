import { FC, useEffect, useState } from "react";
import SingleFileUploadForm from "./SingleUploadForm";
import styles from './styles.module.css'
import { useRouter } from 'next/router'

const Home: FC = () => {
	const router = useRouter()
	const [id, setId] = useState(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (id) {
			router.push(`/p?id=${id}`)
		}
	}, [id])

	const handleClick = async () => {
		setLoading(true)
		const res = await fetch('/api/upload/settings')
		const { data } = await res.json()
		setId(data?.id)
		setLoading(false)
	}

	return (
		<div className={styles.verticalcenter}>
			<div className="w-full max-w-3xl px-3 mx-auto">
				<div className="flex items-center justify-center flex-col pb-24">
					<img src="/mapeo.png" alt="Mapeo Icon" className="mr-3 mb-3" />
					<h1 className="text-3xl text-center font-bold text-gray-900">
						Mapeo Configuration Editor
					</h1>
				</div>
				{loading ? (
					<div className="flex flex-col justify-center items-center h-[400px]">
						<div className="animate-spin loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
						<h3>Loading latest Mapeo configuration template</h3>
					</div>
				) : (
					<>
						<div className="space-y-10">
							<div>
								<h2 className="mb-4 text-xl font-bold text-gray-900 text-center">
									Either upload an existing Mapeo configuration file or initiate a new one from the latest default template
								</h2>
								<SingleFileUploadForm />
							</div>
						</div>
						<div className="flex flex-col justify-center items-center my-6">
							<span className="caption pb-4">Or start a new Mapeo project</span>
							<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded w-[250px]" onClick={handleClick}>Start</button>
						</div>
					</>
				)}
			</div>
		</div>
	)
};

export default Home;


