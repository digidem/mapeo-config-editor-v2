import type { NextPage } from "next";
import Head from "next/head";
import Home from "../components/Home";

const Index: NextPage = () => {
	return (
		<div>
			<Head>
				<title>Mapeo config editor</title>
				<meta name="description" content="File uploader" />
			</Head>

			<main className="py-10">
				<Home />
			</main>

			<footer>
				<div className="w-full max-w-3xl px-3 mx-auto">
					<p>Awana Digital {new Date().getFullYear()} - Version {process.env.NEXT_PUBLIC_APP_VERSION}</p>
				</div>
			</footer>
		</div>
	);
};

export default Index;
