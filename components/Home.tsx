import { useState, FC } from "react";
import MapeoRender from './MapeoRender'
import SingleFileUploadForm from "./SingleUploadForm";
import styles from './styles.module.css'

const Home: FC = () => {
	return (
		<div className={styles.verticalcenter}>
			<SingleFileUploadForm />
		</div>
	);
};

export default Home;
