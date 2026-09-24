import { GetAllRenters } from "@/services/renter-service";
import { handleAxiosError } from "@/lib/utils";
import { Bill } from "@/models/bill";
import { Renter } from "@/models/renter";
import { useCallback, useState } from "react";

const useBillModal = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [renters, setRenters] = useState<Renter[] | undefined>(undefined);

  const openAdd = () => setIsAdding(true);
  const openEdit = (property: Bill) => setSelectedBill(property);
  const close = () => {
    setSelectedBill(null);
    setIsAdding(false);
  };

  const getResources = useCallback(async () => {
    try {
      const response = await GetAllRenters();
      if (response) {
        setRenters(response.data);
      }
    } catch (error) {
      handleAxiosError(error, "Failed to load properties.");
    }
  }, []);

  return {
    selectedBill,
    isAdding,
    renters,
    setSelectedBill,
    setIsAdding,
    openAdd,
    openEdit,
    close,
    getResources,
  };
};

export default useBillModal;
