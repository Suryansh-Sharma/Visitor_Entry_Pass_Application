import { useLazyQuery } from "@apollo/client";
import { createContext, useEffect, useState } from "react";
import { GET_ALL_TELEGRAM_IDS } from "../graphQl/queries";
import { LoadingComponent } from "../components/LoadingComponent";

export const VisitorEntryPassContext = createContext();

const Context = ({ children }) => {
  const baseUrl = "http://localhost:8080/";
  const ReactBaseUrl = "http://localhost:5173/";

  const [getAllTelegramId, { loading }] = useLazyQuery(GET_ALL_TELEGRAM_IDS, {
    fetchPolicy: "network-only",
  });

  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || null;
  });
  const [allTelegramIds, setTelegramIds] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const SortOrder = {
    ASC: "ASC",
    DESC: "DESC",
  };

  const fetchTelegramIds = async () => {
    try {
      const response = await getAllTelegramId();
      const error = response.error;
      if (error) {
        console.log("Error while fetching telegram Id " + error);
        return;
      } else {
        const data = response.data?.getAllTelegramIds;
        if (data && data.length > 0) {
          setTelegramIds(data);
        } else {
          console.log("No id is present");
        }
      }
    } catch (error) {
      console.error(`failed:`, error);
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setTelegramIds([]);
    setUserInfo(null);
  };
  const login = (user) => {
    setUserInfo(user);
    localStorage.setItem("userInfo", JSON.stringify(user));
  };

  useEffect(() => {
    // fetchTelegramIds();
    setLoading(false);
  }, [fetchTelegramIds]);
  if (loading) {
    return <LoadingComponent text={"Please Wait, Data is Loading !!"} />;
  }

  return (
    <VisitorEntryPassContext.Provider
      value={{
        isLogin,
        setIsLogin,
        userInfo,
        setUserInfo,
        SortOrder,
        allTelegramIds,
        setTelegramIds,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </VisitorEntryPassContext.Provider>
  );
};

export default Context;
