import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { VisitorEntryPassContext } from "../../context/VisitorEntryPassContext";

const PublicRoute = ({ children }) => {
  const { userInfo } = useContext(VisitorEntryPassContext);

  return userInfo ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
