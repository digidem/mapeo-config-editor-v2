import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import io, { Socket } from "socket.io-client";
import styles from './styles.module.css'

interface Preset {
  name: string;
  color: string;
  iconPath: string;
}

const fetchPresets = async (serverUrl: string): Promise<Preset[] | null> => {
  try {
    const response: AxiosResponse<Preset[]> = await axios.get(`${serverUrl}/api/presets`);
    console.log("response", response);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch presets:", error);
    return null;
  }
};

const MapeoRender = ({ serverUrl }: { serverUrl: string }) => {
	console.log('serverUrl', serverUrl)
	const socket: Socket = io(serverUrl);
  const [presets, setPresets] = useState<Preset[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data: Preset[] | null = await fetchPresets(serverUrl);
      setPresets(data);
    };
    fetchData();

    // Listen for updates from the server
    socket.on("presets:update", async () => {
      const data: Preset[] | null = await fetchPresets(serverUrl);
      setPresets(data);
    });

    // Clean up the effect
		return () => {
			socket.off("presets:update");
		};
		}, [serverUrl]);
  return (
    <div className={styles.phoneouterframe}>
      <div className={styles.phoneframe}>
        <div className={styles.icongrid}>
          {presets && presets.length === 0 && <span className={styles.verticalcenter}>Loading...</span>}
          {presets && presets.map((preset: Preset, index: number) => (
            <div key={`${preset.name}-${index}`} className={styles.iconcontainer}>
              <div
                className={styles.icon}
                style={{
                  backgroundColor: "white",
                  borderColor: preset.color,
                  borderWidth: 3.5,
                }}
              >
                <img
                  src={preset.iconPath}
                  alt={preset.name}
                  style={{ maxWidth: "35px", height: "35px" }}
                />
              </div>
              <div className={styles.iconname}>{preset.name}</div>

            </div>
          ))}
          {!presets && <span className={styles.verticalcenter}>Mapeo configuration folder not detected, make sure you are inside or passing the right folder</span>}
        </div>
      </div>
    </div>
  );
};

export default MapeoRender;

