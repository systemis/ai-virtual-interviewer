import { useEffect, useState } from "react";
import { checkDjangoBackendHealth } from "../lib/django-client";
import type { BackendStatus } from "../types";

export const useBackendStatus = () => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkDjangoBackendHealth();
      setBackendStatus(isConnected ? "connected" : "disconnected");
    };
    checkConnection();
  }, []);

  return backendStatus;
};

