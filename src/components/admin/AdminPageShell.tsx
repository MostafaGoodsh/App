import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageShellProps {
  children: ReactNode;
  backgroundImage?: string;
  withContainer?: boolean;
  innerClassName?: string;
  containerClassName?: string;
}

const DEFAULT_BG = "/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png";

export default function AdminPageShell({
  children,
  backgroundImage = DEFAULT_BG,
  withContainer = false,
  innerClassName,
  containerClassName,
}: AdminPageShellProps) {
  const content = withContainer ? (
    <div className={cn("mx-auto w-full max-w-7xl", containerClassName)}>{children}</div>
  ) : (
    children
  );

  return (
    <div
      className="min-h-[calc(100vh-4rem)] w-full max-w-[100vw] overflow-x-hidden bg-cover bg-center"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className={cn("min-h-[calc(100vh-4rem)] w-full max-w-[100vw] overflow-x-hidden bg-background/90 px-2 py-3 sm:px-4 sm:py-6", innerClassName)}>
        {content}
      </div>
    </div>
  );
}
