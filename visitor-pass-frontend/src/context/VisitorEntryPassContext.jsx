import { useQuery } from "@apollo/client";
import { createContext, useState } from "react";
import { LoadingComponent } from "../components/LoadingComponent";
import { GET_ALL_TELEGRAM_IDS } from "../graphQl/queries";

export const VisitorEntryPassContext = createContext();

const Context = ({ children }) => {
  const baseUrl = "http://localhost:8080/";
  const ReactBaseUrl = "http://localhost:5173/";

  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo")) || null;
    } catch {
      return null;
    }
  });

  const token = userInfo;

  const { data, loading, error } = useQuery(GET_ALL_TELEGRAM_IDS, {
    fetchPolicy: "network-only",
    skip: !token,
  });

  const allTelegramIds = data?.getAllTelegramIds ?? [];

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
  };

  const login = (user) => {
    localStorage.setItem("userInfo", JSON.stringify(user));
    setUserInfo(user);
  };

  if (loading) {
    return <LoadingComponent text={"Please Wait, Data is Loading !!"} />;
  }
  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <VisitorEntryPassContext.Provider
      value={{
        userInfo,
        setUserInfo,
        allTelegramIds,
        login,
        logout,
      }}
    >
      {children}
    </VisitorEntryPassContext.Provider>
  );
};

export default Context;
