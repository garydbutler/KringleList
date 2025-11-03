// src/components/features/trends/TrendBadge.tsx
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, DollarSign, Award } from "lucide-react";
import { TrendBadge as TrendBadgeType } from "@/lib/jobs/compute-trends";

interface TrendBadgeProps {
  badge: TrendBadgeType;
}

const badgeConfig: Record<
  TrendBadgeType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
  }
> = {
  Rising: {
    label: "Rising",
    icon: TrendingUp,
    variant: "default",
    className: "bg-orange-100 text-orange-700 border-orange-300",
  },
  "Back in Stock": {
    label: "Back in Stock",
    icon: Package,
    variant: "secondary",
    className: "bg-blue-100 text-blue-700 border-blue-300",
  },
  "High Margin": {
    label: "High Margin",
    icon: DollarSign,
    variant: "outline",
    className: "bg-green-100 text-green-700 border-green-300",
  },
  "Best Value": {
    label: "Best Value",
    icon: Award,
    variant: "default",
    className: "bg-purple-100 text-purple-700 border-purple-300",
  },
};

export function TrendBadge({ badge }: TrendBadgeProps) {
  const config = badgeConfig[badge];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  );
}
