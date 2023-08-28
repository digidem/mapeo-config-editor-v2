import { useRouter } from 'next/router'
import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";

const Build: NextPage = () => {
	const [build, setBuild] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);

	const router = useRouter()
	const id = Array.isArray(router.query?.id) ? router.query?.id[0] : router.query?.id;
	const reset = () => router.push('/')
	useEffect(() => {
		const checkBuild = async () => {
			if (id) {
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
		}
		const interval = setInterval(() => checkBuild(), 3000);
		return () => clearInterval(interval); // cleanup on component unmount
	}, [id]);
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

				<div className="space-y-10 bg-gray-100 p-5 rounded-lg">
					<div>
						<div className="flex items-center justify-center h-screen">
							<main className="py-10 flex justify-between space-x-4">
								<div className='flex flex-col items-center justify-center space-y-12'>
									{build ? 
										<a download href={build} className="flex flex-col items-center justify-center h-full">
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-12 w-12 animate-bounce mb-2">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
											</svg>
											<span className="mt-8 px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 transition-colors duration-200">Download Build</span> 
										</a>
										: 
										<div className="flex items-center flex-col justify-center space-x-3">
											<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
											<div className="pt-12 text-lg text-gray-700 animate-pulse">{status || 'Loading...'}</div>
										</div>
									}
									<div>
										<button className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700" onClick={() => reset()}>Restart</button>
									</div>
								</div>
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

