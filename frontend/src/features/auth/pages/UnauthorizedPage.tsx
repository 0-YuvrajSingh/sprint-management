import { Button } from "@/shared/ui/Button";
import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-4xl font-bold">403 - Access Denied</h1>
      <p className="mt-4 text-lg">You do not have permission to view this page.</p>
      <Button asChild className="mt-8">
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
