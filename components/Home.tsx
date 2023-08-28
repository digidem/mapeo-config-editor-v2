import { FC } from "react";
import SingleFileUploadForm from "./SingleUploadForm";
import styles from './styles.module.css'

const Home: FC = () => {
	return (
		<div className={styles.verticalcenter}>
			<div className="w-full max-w-3xl px-3 mx-auto">
				<div className="flex items-center justify-center flex-col pb-36">
					<img src="/mapeo.png" alt="Mapeo Icon" className="mr-3 mb-3"/>
					<h1 className="text-3xl font-bold text-gray-900">
						Mapeo Configuration Editor
					</h1>
				</div>

				<div className="space-y-10">
					<div>
						<h2 className="mb-3 text-xl font-bold text-gray-900">
							Upload a Mapeo configuration file to start
						</h2>
						<SingleFileUploadForm />
					</div>
				</div>
			</div>
		</div>

	);
};

export default Home;
