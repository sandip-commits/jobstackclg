"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface PrintButtonProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

export default function PrintButton({ contentRef }: PrintButtonProps) {
  const handlePrint = useReactToPrint({
    contentRef: contentRef as React.RefObject<HTMLElement>,
    documentTitle: "Resume",
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
  });

  return (
    <Button
      variant="outline"
      className="h-32 w-32"
      title="Print Resume"
      onClick={() => handlePrint()}
    >
      <Printer className="size-5" />
    </Button>
  );
}
