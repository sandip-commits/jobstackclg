import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Layout, LayoutGrid } from "lucide-react";

export const Templates = {
  MODERN: "modern",
  CLASSIC: "classic",
  MINIMAL: "minimal",
};

interface TemplateSelectorProps {
  template: string | undefined;
  onChange: (template: string) => void;
}

export default function TemplateSelector({
  template,
  onChange,
}: TemplateSelectorProps) {
  const currentTemplate = template || Templates.MODERN;

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={currentTemplate === Templates.MODERN ? "default" : "outline"}
        className={cn(
          "h-auto w-full justify-start gap-2 px-3 py-2",
          currentTemplate === Templates.MODERN &&
            "bg-primary text-primary-foreground",
        )}
        onClick={() => onChange(Templates.MODERN)}
        title="Modern Template"
      >
        <Layout className="size-4" />
        <span className="text-xs">Modern</span>
      </Button>
      <Button
        variant={currentTemplate === Templates.CLASSIC ? "default" : "outline"}
        className={cn(
          "h-auto w-full justify-start gap-2 px-3 py-2",
          currentTemplate === Templates.CLASSIC &&
            "bg-primary text-primary-foreground",
        )}
        onClick={() => onChange(Templates.CLASSIC)}
        title="Classic Template"
      >
        <FileText className="size-4" />
        <span className="text-xs">Classic</span>
      </Button>
      <Button
        variant={currentTemplate === Templates.MINIMAL ? "default" : "outline"}
        className={cn(
          "h-auto w-full justify-start gap-2 px-3 py-2",
          currentTemplate === Templates.MINIMAL &&
            "bg-primary text-primary-foreground",
        )}
        onClick={() => onChange(Templates.MINIMAL)}
        title="Minimal Template"
      >
        <LayoutGrid className="size-4" />
        <span className="text-xs">Minimal</span>
      </Button>
    </div>
  );
}
