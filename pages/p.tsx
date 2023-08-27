import { useRouter } from 'next/router'
import MapeoRender from '../components/MapeoRender'
import styles from '../components/styles.module.css'
import { useState } from 'react'

const Project = () => {
	const router = useRouter()
	const id = Array.isArray(router.query?.id) ? router.query?.id[0] : router.query?.id;
	const reset = () => router.push('/')
	console.log('id', id)
	const [isLoading, setIsLoading] = useState(false)
	const build = async () => {
		setIsLoading(true)
		console.log('building')
		try {
			const response = await fetch(`/api/build/${ id }`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			const data = await response.json()
			console.log('Build response:', data)
		} catch (error) {
			console.error('Error building:', error)
		} finally {
			setIsLoading(false)
		}
	}
	return (
		<div className={styles.verticalcenter}>
			<div>
				<MapeoRender id={id || ''} />
				<div className={styles.actions}>
					<button className={styles.button} style={{ backgroundColor: 'red' }} onClick={() => reset()}>Restart</button>
					<button className={styles.button} style={{ backgroundColor: isLoading ? 'green' : 'blue' }} onClick={() => build()} disabled={isLoading}>
						{isLoading ? 'Building...' : 'Build'}
					</button>
				</div>
			</div>
		</div >
	);
};

export default Project;


