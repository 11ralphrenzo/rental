import { GetAllRenters } from "@/services/renter-service";
import { GetAllUtilities } from "@/services/utility-service";
import { handleAxiosError } from "@/lib/utils";
import { Bill } from "@/models/bill";
import { Renter } from "@/models/renter";
import { Utility } from "@/models/utility";
import { useCallback, useState } from "react";

const useBillModal = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [renters, setRenters] = useState<Renter[] | undefined>(undefined);
  const [masterUtilities, setMasterUtilities] = useState<Utility[] | undefined>(undefined);

  const openAdd = () => setIsAdding(true);
  const openEdit = (bill: Bill) => setSelectedBill(bill);
  const close = () => {
    setSelectedBill(null);
    setIsAdding(false);
  };

  const getResources = useCallback(async () => {
    try {
      const [renterRes, utilRes] = await Promise.all([
        GetAllRenters(),
        GetAllUtilities(),
      ]);
      if (renterRes) setRenters(renterRes.data);
      if (utilRes) setMasterUtilities(utilRes.data);
    } catch (error) {
      handleAxiosError(error, "Failed to load renters or utilities.");
    }
  }, []);

  return {
    selectedBill,
    isAdding,
    renters,
    masterUtilities,
    setSelectedBill,
    setIsAdding,
    openAdd,
    openEdit,
    close,
    getResources,
  };
};

export default useBillModal;
