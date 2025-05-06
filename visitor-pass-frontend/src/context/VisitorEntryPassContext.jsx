import { useLazyQuery } from "@apollo/client";
import { createContext, useEffect, useState } from "react";
import LoadingPage from "../components/LoadingPage";
import { GET_ALL_TELEGRAM_IDS } from "../graphQl/queries";
import { get } from "lodash";

export const VisitorEntryPassContext = createContext();

const Context = ({ children }) => {


  const baseUrl = "http://localhost:8080/";
  const [getAllTelegramId, { loading }] = useLazyQuery(GET_ALL_TELEGRAM_IDS,{fetchPolicy:'network-only'});

  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [allTelegramIds, setTelegramIds] = useState([]);
  const SortOrder = {
    ASC: "ASC",
    DESC: "DESC",
  };
  useEffect(() => {
    fetchTelegramIds();
    getUserInfo();
  }, []);

  const fetchTelegramIds = async () => {
    
    try {
      const response = await getAllTelegramId();
      const error = response.error;
      if (error) {
        console.log("Error while fetching telegram Id " + error);
        return;
      } else {
        const data = response.data.getAllTelegramIds;
        if (data.length > 0) {
          setTelegramIds(data);
          console.log(allTelegramIds);
        } else {
          console.log("No id is present");
        }
      }
    } catch (error) {
      console.error(`failed:`, error);
    }
  };

  const getUserInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      sessionStorage.removeItem("jwtToken");
      localStorage.removeItem("userInfo");
      return null;
    } else {
      setUserInfo(userInfo);
      sessionStorage.setItem("jwtToken", JSON.stringify(userInfo.credentials.jwtToken.token));
      return userInfo;
    }
  };
  
  if (loading) {
    return <LoadingPage />;
  }

  return (
    <VisitorEntryPassContext.Provider
      value={{
        baseUrl,
        isLogin,
        setIsLogin,
        userInfo,
        setUserInfo,
        SortOrder,
        allTelegramIds,
        setTelegramIds,
        getUserInfo,
      }}
    >
      {children}
    </VisitorEntryPassContext.Provider>
  );
};
export default Context;
