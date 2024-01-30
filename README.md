# Mapeo Configuration Editor

This project serves as a configuration editor for [Mapeo](https://mapeo.app/), an open-source, offline-first mapping tool. It provides a user-friendly interface to upload, edit, and download the Mapeo configuration file.

## Features

- **Upload Configuration**: Easily upload a Mapeo configuration file.
- **View and Edit Configuration**: View the uploaded configuration and make necessary changes.
- **Download Configuration**: Download the updated configuration file after editing.
- **Version Bumping**: Automatic version bumping for configuration files.
- **Build Status Tracking**: Keep track of the build status.

## Usage

1. Start the server by running `yarn dev` or `npm run dev`.
2. Open your browser and navigate to `http://localhost:3000`.
3. Upload your Mapeo configuration file.
4. The configuration will be processed and displayed for editing.
5. Make the necessary changes to the configuration.
6. Click on the "Build" button to create the updated configuration.
7. Once the build is complete, click on the "Download Build" button to download the updated configuration.

### With docker
To run the Mapeo Configuration Editor using Docker, execute the following command:

```
docker run -v /tmp/configs:/tmp/uploads -p 3000:3000 communityfirst/mapeo-config-editor
```

Open [localhost:3000](http://localhost:3000) in the browser to navigate the app. The configs will be built to the `/tmp/configs` folder.
