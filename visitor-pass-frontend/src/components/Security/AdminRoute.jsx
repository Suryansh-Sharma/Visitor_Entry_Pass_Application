import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { VisitorEntryPassContext } from "../../context/VisitorEntryPassContext";

function AdminRoute({ children }) {
  const { userInfo } = useContext(VisitorEntryPassContext);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
