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
          <p>Digital Democracy 2023</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
