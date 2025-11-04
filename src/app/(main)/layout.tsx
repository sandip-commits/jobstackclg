import Navbar from "./Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen flex-col overflow-clip">
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}
