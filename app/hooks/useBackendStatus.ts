import { useState, useEffect } from "react";
import { checkBackendConnection } from "../utils/api";
import type { BackendStatus } from "../types";

export const useBackendStatus = () => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkBackendConnection();
      setBackendStatus(isConnected ? "connected" : "disconnected");
    };
    checkConnection();
  }, []);

  return backendStatus;
};

