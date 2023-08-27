import { useRouter } from 'next/router'
import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from '../components/styles.module.css'

const Build: NextPage = () => {
	const [build, setBuild] = useState<String | null>(null);
	const [status, setStatus] = useState<String | null>(null);

	const router = useRouter()
	const id = Array.isArray(router.query?.id) ? router.query?.id[0] : router.query?.id;
	const reset = () => router.push('/')
	console.log('id', id)
	useEffect(() => {
		const checkBuild = async () => {
			try {
				const response = await fetch(`/api/build/${id}`)
				const { build, status } = await response.json()
				setStatus(status)
				if (build) setBuild(build)
				console.log('Build response:', status)
			} catch (error) {
				console.error('Error building:', error)
			}
		}
		checkBuild();
	}, []);
	return (
		<div>
			<Head>
				<title>Mapeo config editor</title>
				<meta name="description" content="File uploader" />
			</Head>

			<div className="w-full max-w-3xl px-3 mx-auto">
				<h1 className="mb-10 text-3xl font-bold text-gray-900">
					Mapeo Configuration Editor
				</h1>

				<div className="space-y-10">
					<div>
						<h2 className="mb-3 text-xl font-bold text-gray-900">
							Build
						</h2>
						<div className={styles.verticalcenter}>
							<main className="py-10">
								{build ? <div>{build}</div> : <div>Status: {status || 'Loading...'}</div>
								}								<button className={styles.button} style={{ backgroundColor: 'red' }} onClick={() => reset()}>Restart</button>
							</main>
						</div>
					</div>
				</div>
			</div>
			<footer>
				<div className="w-full max-w-3xl px-3 mx-auto">
					<p>Digital Democracy 2023</p>
				</div>
			</footer>

		</div>

	);
};

export default Build;
