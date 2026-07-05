import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import Swal from "sweetalert2";
import { useApolloClient } from "@apollo/client";
import { SEARCH_VISITS } from "../graphQl/queries";

const UserWebSocket = () => {
  // Use a ref for the queue so showNextAlert always reads the latest value
  // without stale-closure issues from useState
  const queueRef = useRef([]);
  const isShowing = useRef(false);
  const apolloClient = useApolloClient();

  const showNextAlert = async () => {
    if (isShowing.current || queueRef.current.length === 0) return;

    isShowing.current = true;
    const current = queueRef.current[0];
    queueRef.current = queueRef.current.slice(1);

    if (current.visitStatus === "ACCEPT") {
      await Swal.fire({
        title: "Visitor Accepted",
        text: current.msg,
        icon: "success",
        confirmButtonColor: "#2563eb",
        timer: 8000,
        timerProgressBar: true,
      });
    } else if (current.visitStatus === "REJECT") {
      await Swal.fire({
        title: "Visitor Rejected",
        text: current.msg,
        icon: "error",
        confirmButtonColor: "#dc2626",
        timer: 8000,
        timerProgressBar: true,
      });
    }

    isShowing.current = false;
    // Process next in queue if any arrived while alert was open
    showNextAlert();
  };

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        console.log("WebSocket connected ✅");
        client.subscribe("/topic/visits", (msg) => {
          const data = JSON.parse(msg.body);
          console.log("WebSocket message received:", data);
          queueRef.current = [...queueRef.current, data];
          apolloClient.refetchQueries({ include: [SEARCH_VISITS] });
          showNextAlert();
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket STOMP error", frame);
      },
      reconnectDelay: 5000,
    });
    client.activate();
    return () => client.deactivate();
  }, []);

  return null;
};

export default UserWebSocket;
