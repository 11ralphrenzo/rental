"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [houses, setHouses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/houses");
        const data = await res.json();
        setHouses(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        // setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Users:</h1>
      <ul>
        {houses.map((house) => (
          <li key={house.id}>
            {house.name} - {house.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
