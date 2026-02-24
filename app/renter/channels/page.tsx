import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoIcon, Mail, MessageCircleIcon, QrCodeIcon } from "lucide-react";
import Image from "next/image";

const paymentQRs = [
  {
    id: 1,
    channel: "GCash",
    bgColor: "bg-blue-500",
    textColor: "text-blue-500",
    borderColor: "border-blue-500",
    link: "https://drive.usercontent.google.com/download?id=1aN3nr_M5kHRr2N358SruFN9A-JlKbNgb&export=view&authuser=0",
  },
  {
    id: 2,
    channel: "Maya",
    bgColor: "bg-green-600",
    textColor: "text-green-600",
    borderColor: "border-green-600",
    link: "https://drive.usercontent.google.com/download?id=1bGw6FeOZwYMbX_fxysczINe3_nd_hSCR&export=view&authuser=0",
  },
  {
    id: 3,
    channel: "Maribank",
    bgColor: "bg-orange-500",
    textColor: "text-orange-500",
    borderColor: "border-orange-500",
    link: "https://drive.usercontent.google.com/download?id=1aMnYiVRABvZvDNdmiDlv1m5ND2CWx278&export=view&authuser=0",
  },
  {
    id: 4,
    channel: "GoTyme",
    bgColor: "bg-cyan-400",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-400",
    link: "https://drive.usercontent.google.com/download?id=13CG7vfTjI96GFOjTGb4L9sK4KBE8Y914&export=view&authuser=0",
  },
];

function Page() {
  return (
    <div className="flex-1 grid grid-cols-4 max-h-100 sm:max-w-md sm:m-auto items-center justify-center gap-4 sm:gap-3">
      {paymentQRs.map((qr) => (
        <Popover key={qr.id}>
          <PopoverTrigger asChild>
            <div
              className={`col-span-2 sm:col-span-1 flex flex-col border items-center justify-center rounded-xl p-1 gap-0.5 cursor-pointer ${qr.borderColor}`}
            >
              <QrCodeIcon
                className={`border w-full h-full sm:w-20 sm:h-20 border-none pointer-events-none ${qr.textColor}`}
              ></QrCodeIcon>
              <span
                className={`w-full text-center text-white rounded-lg text-sm font-semibold pointer-events-none ${qr.bgColor}`}
              >
                {qr.channel}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" className={`${qr.bgColor}`}>
            <Image
              src={qr.link}
              alt={qr.channel}
              width={100}
              height={50}
              loading="lazy"
              className="w-full"
            />
          </PopoverContent>
        </Popover>
      ))}
      <div className="col-span-4">
        <Alert>
          <InfoIcon />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <span>
              Click on the QR icon above, and once you have paid, please send a
              message or screenshot thru Messenger.
            </span>
            {/* <div className="space-x-2">
              <Button className="bg-blue-500 rounded-full">
                <MessageCircleIcon />
                Messenger
              </Button>
            </div> */}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export default Page;
