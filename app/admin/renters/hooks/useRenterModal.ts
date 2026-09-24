import { GetAllProperties } from "@/services/property-service";
import { handleAxiosError } from "@/lib/utils";
import { Property } from "@/models/property";
import { Renter } from "@/models/renter";
import { useCallback, useState } from "react";

const useRenterModal = () => {
  const [selectedRenter, setSelectedRenter] = useState<Renter | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [properties, setProperties] = useState<Property[] | undefined>(undefined);

  const openAdd = () => setIsAdding(true);
  const openEdit = (property: Renter) => setSelectedRenter(property);
  const close = () => {
    setSelectedRenter(null);
    setIsAdding(false);
  };

  const getResources = useCallback(async () => {
    try {
      const response = await GetAllProperties();
      if (response) {
        setProperties(response.data);
      }
    } catch (error) {
      handleAxiosError(error, "Failed to load properties.");
    }
  }, []);

  return {
    selectedRenter,
    isAdding,
    properties,
    setSelectedRenter,
    setIsAdding,
    openAdd,
    openEdit,
    close,
    getResources,
  };
};

export default useRenterModal;
