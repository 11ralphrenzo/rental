import React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

interface RenterPinProps {
  value: string;
  onChange: (value: string) => void;
}
function RenterPin({ value, onChange }: RenterPinProps) {
  return (
    <InputOTP
      maxLength={4}
      className="renter-pin"
      value={value}
      onChange={onChange}
    >
      <InputOTPGroup className="renter-pin-group">
        <InputOTPSlot
          index={0}
          className="renter-pin-slot w-15 h-15 sm:w-9 sm:h-9"
        />
        <InputOTPSlot
          index={1}
          className="renter-pin-slot w-15 h-15 sm:w-9 sm:h-9"
        />
        <InputOTPSlot
          index={2}
          className="renter-pin-slot w-15 h-15 sm:w-9 sm:h-9"
        />
        <InputOTPSlot
          index={3}
          className="renter-pin-slot w-15 h-15 sm:w-9 sm:h-9"
        />
      </InputOTPGroup>
    </InputOTP>
  );
}

export default RenterPin;
