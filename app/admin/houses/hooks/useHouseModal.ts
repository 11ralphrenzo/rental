import { House } from "@/models/house";
import { useState } from "react";

const useHouseModal = () => {
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const openAdd = () => setIsAdding(true);
  const openEdit = (house: House) => setSelectedHouse(house);
  const close = () => {
    setSelectedHouse(null);
    setIsAdding(false);
  };

  return {
    selectedHouse,
    setSelectedHouse,
    isAdding,
    setIsAdding,
    openAdd,
    openEdit,
    close,
  };
};

export default useHouseModal;
