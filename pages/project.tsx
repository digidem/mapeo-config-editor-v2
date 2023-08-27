import { useRouter } from 'next/router'
import MapeoRender from '../components/MapeoRender'
import styles from '../components/styles.module.css'

const Project = () => {
	const router = useRouter()
	const serverUrl = Array.isArray(router.query?.url) ? router.query?.url[0] : router.query?.url;
	const reset = () => router.push('/')
	console.log('serverUrl', serverUrl)
	const build = async () => {
		console.log('building')
		try {
			const response = await fetch('/api/build', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ serverUrl }),
			})
			const data = await response.json()
			console.log('Build response:', data)
		} catch (error) {
			console.error('Error building:', error)
		}
	}
	return (
		<div className={styles.verticalcenter}>
			<div>
				<MapeoRender serverUrl={serverUrl || ''} />
				<div className={styles.actions}>
					<button className={styles.button} style={{ backgroundColor: 'red' }} onClick={() => reset()}>Restart</button>
					<button className={styles.button} style={{ backgroundColor: 'green' }} onClick={() => build()}>Build</button>
				</div>
			</div>
		</div >
	);
};

export default Project;

