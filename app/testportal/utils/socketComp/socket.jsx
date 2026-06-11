"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { socketUrl } from "../urls";

export default function SocketComp() {
  const [socket, setSocket] = useState(null);
  const [transport, setTransport] = useState(null);
  const [studentId, setStudentId] = useState("");

  // const url = `http://localhost:2222`

  const url = socketUrl;



  useEffect(() => {
    const newSocket = io(url);

    setSocket(newSocket);

    return () => {
      if (socket) socket.disconnect();
    };
  }, [url]);

  useEffect(() => {
    if (socket) {
      socket.on("userId", (data) => {
        console.log(data);
        setStudentId(data);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    if (socket?.connected) {
      onConnect();
    }
    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return <></>;
}
