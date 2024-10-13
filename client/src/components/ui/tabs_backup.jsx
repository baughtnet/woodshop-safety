import * as React from "react";
import { cn } from "../../lib/utils";

// Tabs Root Component
const Tabs = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4", className)} {...props} />
));
Tabs.displayName = "Tabs";

// TabsList Component
const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex border-b border-gray-200", className)} {...props} />
));
TabsList.displayName = "TabsList";

// TabsTrigger Component
const TabsTrigger = React.forwardRef(({ className, isActive, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "px-4 py-2 text-sm font-medium leading-5 focus:outline-none",
      isActive
        ? "border-b-2 border-primary text-primary"
        : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

// TabsContent Component
const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
