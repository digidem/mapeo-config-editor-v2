import { useState } from "react";
import MapeoRender from './MapeoRender'
import SingleFileUploadForm from "./SingleUploadForm";
import styles from './styles.module.css'

const Home = () => {
	const [serverUrl, setServerUrl] = useState<String | null>(null);
	const reset = () => setServerUrl(null)
	return (
					<div className={styles.verticalcenter}>
						{!serverUrl && <SingleFileUploadForm setServerUrl={setServerUrl} />
						}
						{serverUrl && <div>
							<MapeoRender serverUrl={serverUrl} />
							<button onClick={() => reset()}>Restart</button>
						</div>
					}
					</div>
	);
};

export default Home;
