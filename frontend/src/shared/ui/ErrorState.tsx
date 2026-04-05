import { AlertCircle } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Unable to load data", message, onRetry }: ErrorStateProps) {
  return (
    <Card className="flex flex-col gap-4 border-red-100 bg-red-50/80">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-white p-2 text-red-600 shadow-sm">
          <AlertCircle className="size-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="text-sm text-red-800/80">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <div>
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
