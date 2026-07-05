import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { VisitorEntryPassContext } from "../../context/VisitorEntryPassContext";

function PrivateRoute({ children }) {
  const { userInfo } = useContext(VisitorEntryPassContext);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
