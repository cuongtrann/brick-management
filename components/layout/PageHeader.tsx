import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
