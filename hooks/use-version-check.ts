import { useEffect, useState } from "react";

export function useVersionCheck() {
  const [hasNewVersion, setHasNewVersion] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      const res = await fetch("/version.json?t=" + Date.now());
      const data = await res.json();

      const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;

      if (data.version !== currentVersion) {
        setHasNewVersion(true);
      }
    };

    checkVersion();
  }, []);

  return hasNewVersion;
}
