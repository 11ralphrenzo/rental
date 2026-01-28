import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mediaQueryList.matches);

    // Listen for changes
    mediaQueryList.addEventListener("change", listener);

    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
