"use client";

import Image from "next/image";
import { useState } from "react";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeamLogo({
  teamId,
  name,
  size = 32,
}: {
  teamId?: number;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!teamId || failed) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-bold text-accent"
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        {initialsOf(name)}
      </span>
    );
  }

  return (
    <Image
      src={`/api/team-logo/${teamId}`}
      alt={name}
      width={size}
      height={size}
      unoptimized
      className="shrink-0 rounded-full bg-white object-contain p-0.5"
      onError={() => setFailed(true)}
    />
  );
}
