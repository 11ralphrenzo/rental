import { Property } from "@/models/property";
import { useState } from "react";

const usePropertyModal = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const openAdd = () => setIsAdding(true);
  const openEdit = (property: Property) => setSelectedProperty(property);
  const close = () => {
    setSelectedProperty(null);
    setIsAdding(false);
  };

  return {
    selectedProperty,
    setSelectedProperty,
    isAdding,
    setIsAdding,
    openAdd,
    openEdit,
    close,
  };
};

export default usePropertyModal;
