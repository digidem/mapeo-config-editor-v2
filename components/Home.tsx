import SingleFileUploadForm from "./SingleUploadForm";
import styles from './styles.module.css'

const Home: FC = () => {
	return (
		<div className={styles.verticalcenter}>
			<div className="w-full max-w-3xl px-3 mx-auto">
				<h1 className="mb-10 text-3xl font-bold text-gray-900">
					Mapeo Configuration Editor
				</h1>

				<div className="space-y-10">
					<div>
						<h2 className="mb-3 text-xl font-bold text-gray-900">
							Upload config file
						</h2>
						<SingleFileUploadForm />
					</div>
				</div>
			</div>
		</div>

	);
};

export default Home;
