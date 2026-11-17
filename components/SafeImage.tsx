"use client";

import Image, { ImageProps } from "next/image";
import { ImageIcon } from "lucide-react";
import { safeImageSrc } from "@/lib/safeExternalUrl";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string | null | undefined;
};

export default function SafeImage({ src, alt, className, ...props }: SafeImageProps) {
  const safeSrc = safeImageSrc(src);

  if (!safeSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className || ""}`}
        aria-label={alt || "Image unavailable"}
      >
        <ImageIcon className="w-4 h-4" />
      </div>
    );
  }

  return <Image src={safeSrc} alt={alt} className={className} unoptimized {...props} />;
}
