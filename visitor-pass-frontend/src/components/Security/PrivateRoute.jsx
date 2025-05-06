import { useContext } from "react";
import { Navigate } from "react-router";
import { VisitorEntryPassContext } from "../../context/VisitorEntryPassContext";

const PrivateRoute = ({ children }) => {
  const { userInfo } = useContext(VisitorEntryPassContext);
  console.log("UserInfo:- ",userInfo);
  if (!userInfo || !userInfo.isActive || !userInfo.isVerified) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "You need to log in to access this page." }}
      />
    );
  }

  return children;
};

export default PrivateRoute;
