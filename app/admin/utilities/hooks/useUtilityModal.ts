import { Utility } from "@/models/utility";
import { useState } from "react";

const useUtilityModal = () => {
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const openAdd = () => setIsAdding(true);
  const openEdit = (utility: Utility) => setSelectedUtility(utility);
  const close = () => {
    setSelectedUtility(null);
    setIsAdding(false);
  };

  return {
    selectedUtility,
    setSelectedUtility,
    isAdding,
    setIsAdding,
    openAdd,
    openEdit,
    close,
  };
};

export default useUtilityModal;
