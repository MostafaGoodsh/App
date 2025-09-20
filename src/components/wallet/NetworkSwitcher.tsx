import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_NETWORKS } from "@/config/wallet";
import { ChevronDown, Network } from "lucide-react";

interface NetworkSwitcherProps {
  currentNetwork: string;
  onNetworkSwitch: (networkKey: keyof typeof SUPPORTED_NETWORKS) => void;
}

export const NetworkSwitcher = ({ currentNetwork, onNetworkSwitch }: NetworkSwitcherProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Network className="w-4 h-4" />
          {currentNetwork}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onNetworkSwitch(key as keyof typeof SUPPORTED_NETWORKS)}
            className={currentNetwork === network.name ? "bg-muted" : ""}
          >
            <div className="flex items-center justify-between w-full">
              <span>{network.name}</span>
              <span className="text-xs text-muted-foreground">{network.currency}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};