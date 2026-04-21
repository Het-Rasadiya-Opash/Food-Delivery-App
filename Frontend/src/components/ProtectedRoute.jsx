import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { currentUser, isCheckingAuth } = useSelector((state) => state.users);

  if (isCheckingAuth) return null;

    return currentUser ? <Outlet /> : <Navigate to="/login" />;

};

export default ProtectedRoute;
