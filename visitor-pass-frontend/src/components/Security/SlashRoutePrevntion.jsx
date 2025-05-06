import { useEffect } from "react";
import { useNavigate } from "react-router";

function SlashRoutePrevntion(prevent) {
  const navigate = useNavigate();
  const formatedTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    navigate(`/visits-by-date/${formatedTodayDate()}?page_no=0&page_size=8&sort_by=visitedOn&sort_order=ASC`);
  }, [prevent]);
}
export default SlashRoutePrevntion;
