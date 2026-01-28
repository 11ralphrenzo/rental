"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/renter/dashboard");
  }, [router]);

  return null;
}

export default Page;
