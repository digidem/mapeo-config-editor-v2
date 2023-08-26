import { useState } from "react";
import { useRouter } from 'next/router'
import MapeoRender from '../components/MapeoRender'
import styles from '../components/styles.module.css'

const Project = () => {
	const router = useRouter()
	const serverUrl = `http://localhost:${router.query?.id}`
	const reset = () => router.push('/')
	return (
		<div className={styles.verticalcenter}>
			<div>
				<MapeoRender serverUrl={serverUrl} />
				<div style={{ marginTop: 35 }}></div>
				<button className={styles.button} onClick={() => reset()}>Restart</button>
			</div>
		</div >
	);
};

export default Project;
