import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { currentUser, isCheckingAuth } = useSelector((state) => state.users);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Checking access...</p>
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;

};

export default ProtectedRoute;
