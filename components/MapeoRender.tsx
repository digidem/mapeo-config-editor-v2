import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import styles from './styles.module.css'

const fetchPresets = async (serverUrl) => {
  try {
    const response = await axios.get(`${serverUrl}/api/presets`);
    console.log("response", response);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch presets:", error);
    return null;
  }
};

const MapeoRender = ({ serverUrl }) => {
	console.log('serverUrl', serverUrl)
	const socket = io(serverUrl);
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPresets(serverUrl);
      setPresets(data);
    };
    fetchData();

    // Listen for updates from the server
    socket.on("presets:update", async () => {
      const data = await fetchPresets(serverUrl);
      setPresets(data);
    });

    // Clean up the effect
    return () => socket.off("presets:update");
  }, [serverUrl]);
  return (
    <div className={styles.phoneouterframe}>
      <div className={styles.phoneframe}>
        <div className={styles.icongrid}>
          {presets && presets.length === 0 && <span className={styles.verticalcenter}>Loading...</span>}
          {presets && presets.map((preset, index) => (
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
