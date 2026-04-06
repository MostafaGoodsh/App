import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "./card";
import { useUICardSettings } from "@/hooks/useUICardSettings";

interface StyledCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardKey?: string;
  children: React.ReactNode;
}

/**
 * StyledCard – wraps <Card> and auto-applies admin UI card settings.
 * Pass a `cardKey` that matches a row in ui_card_settings.
 * If no key or no matching setting exists it renders a plain Card.
 */
const StyledCard = React.forwardRef<HTMLDivElement, StyledCardProps>(
  ({ cardKey, className, style, children, ...props }, ref) => {
    const { getCardStyle, getCardSetting } = useUICardSettings();

    const setting = cardKey ? getCardSetting(cardKey) : undefined;
    const adminStyle = cardKey ? getCardStyle(cardKey) : {};
    const hasOverlay = setting?.background_image && (setting?.overlay_opacity ?? 0) > 0;

    return (
      <Card
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        style={{ ...adminStyle, ...style }}
        {...props}
      >
        {hasOverlay && (
          <div
            className="absolute inset-0 bg-black pointer-events-none z-0"
            style={{ opacity: (setting!.overlay_opacity ?? 0) / 100 }}
          />
        )}
        <div className={cn(hasOverlay ? "relative z-10" : "")}>
          {children}
        </div>
      </Card>
    );
  }
);
StyledCard.displayName = "StyledCard";

/**
 * StyledCardTitle – applies admin title styles (font size, color, align).
 */
const StyledCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { cardKey?: string }
>(({ cardKey, className, style, ...props }, ref) => {
  const { getTitleStyle } = useUICardSettings();
  const adminStyle = cardKey ? getTitleStyle(cardKey) : {};

  return (
    <CardTitle
      ref={ref}
      className={className}
      style={{ ...adminStyle, ...style }}
      {...props}
    />
  );
});
StyledCardTitle.displayName = "StyledCardTitle";

/**
 * StyledCardDescription – applies admin description styles.
 */
const StyledCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { cardKey?: string }
>(({ cardKey, className, style, ...props }, ref) => {
  const { getDescriptionStyle } = useUICardSettings();
  const adminStyle = cardKey ? getDescriptionStyle(cardKey) : {};

  return (
    <CardDescription
      ref={ref}
      className={className}
      style={{ ...adminStyle, ...style }}
      {...props}
    />
  );
});
StyledCardDescription.displayName = "StyledCardDescription";

export {
  StyledCard,
  StyledCardTitle,
  StyledCardDescription,
  CardHeader,
  CardContent,
  CardFooter,
};
