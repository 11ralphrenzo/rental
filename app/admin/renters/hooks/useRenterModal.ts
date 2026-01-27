import { GetAllHouses } from "@/app/services/house-service";
import { handleAxiosError } from "@/lib/utils";
import { House } from "@/models/house";
import { Renter } from "@/models/renter";
import { useCallback, useState } from "react";

const useRenterModal = () => {
  const [selectedRenter, setSelectedRenter] = useState<Renter | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [houses, setHouses] = useState<House[] | undefined>(undefined);

  const openAdd = () => setIsAdding(true);
  const openEdit = (house: Renter) => setSelectedRenter(house);
  const close = () => {
    setSelectedRenter(null);
    setIsAdding(false);
  };

  const getResources = useCallback(async () => {
    try {
      const response = await GetAllHouses();
      if (response) {
        setHouses(response.data);
      }
    } catch (error) {
      handleAxiosError(error, "Failed to load houses.");
    }
  }, []);

  return {
    selectedRenter,
    isAdding,
    houses,
    setSelectedRenter,
    setIsAdding,
    openAdd,
    openEdit,
    close,
    getResources,
  };
};

export default useRenterModal;
