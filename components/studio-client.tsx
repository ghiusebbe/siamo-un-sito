"use client";

import { useMemo } from "react";
import { NextStudio } from "next-sanity/studio";
import { createStudioConfig, type StudioTarget } from "@/sanity/studio-config";

export function StudioClient(target: StudioTarget) {
  const config = useMemo(() => createStudioConfig(target), [target]);
  return <NextStudio config={config} />;
}
