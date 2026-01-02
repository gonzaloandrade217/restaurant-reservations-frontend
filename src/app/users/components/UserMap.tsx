'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const UserMapClient = dynamic(() => import("./UserMapClient"), {
  ssr: false,
});

interface UserMapProps {
  restaurants: {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    profile?: string;
  }[];
}

export default function UserMap(props: UserMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // IMPORTANTE: hasta que no esté montado, no renderiza NADA
  if (!mounted) return null;

  return <UserMapClient {...props} />;
}
