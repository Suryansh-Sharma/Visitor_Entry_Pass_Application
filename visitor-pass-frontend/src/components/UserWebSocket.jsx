import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import Swal from "sweetalert2";
import { useApolloClient } from "@apollo/client";
import { SEARCH_VISITS } from "../graphQl/queries";

const UserWebSocket = () => {
  const [messageQueue, setMessageQueue] = useState([]);
  const isShowing = useRef(false);
  const apolloClient = useApolloClient();

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        console.log("WebSocket connected ✅");
        client.subscribe("/topic/visits", (msg) => {
          const data = JSON.parse(msg.body);
          setMessageQueue((prev) => [...prev, data]);
          apolloClient.refetchQueries({ include: [SEARCH_VISITS] });
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket STOMP error", frame);
      },
    });
    client.activate();
    return () => client.deactivate();
  }, []);

  // ✅ Process queue one by one
  useEffect(() => {
    if (messageQueue.length > 0 && !isShowing.current) {
      showNextAlert();
    }
  }, [messageQueue]);

  const showNextAlert = async () => {
    if (messageQueue.length === 0) return;

    isShowing.current = true;

    const current = messageQueue[0];

    if (current.visitStatus === "ACCEPT") {
      await Swal.fire({
        title: "Hey!!, There is an update",
        text: current.msg,
        icon: "success",
      });
    } else if (current.visitStatus === "REJECT") {
      await Swal.fire({
        title: "Oh No !!",
        text: current.msg,
        icon: "error",
      });
    }

    setMessageQueue((prev) => prev.slice(1));

    isShowing.current = false;
  };

  return <></>;
};

export default UserWebSocket;
