import { useEffect, useRef, useState } from "react";
import type { MicPermission } from "../types";
import { speechToText } from "@/app/lib/django-client";

export const useMicrophone = () => {
  const [micPermission, setMicPermission] = useState<MicPermission>("unknown");
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptionResolverRef = useRef<
    ((text: string | null) => void) | null
  >(null);

  useEffect(() => {
    checkMicrophoneSupport();
  }, []);

  const checkMicrophoneSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setDebugInfo("❌ Microphone access not supported in this browser.");
      setMicPermission("unsupported");
      return;
    }

    setDebugInfo("✅ Microphone supported");

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setMicPermission("granted");
        setDebugInfo("✅ Microphone permission granted");
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((error) => {
        console.error("Microphone permission error:", error);
        setMicPermission("denied");
        setDebugInfo(
          "❌ Microphone permission denied. Please allow microphone access.",
        );
      });
  };

  const startRecording = async (): Promise<void> => {
    console.log("🎤 Start recording button clicked");

    if (micPermission === "denied") {
      alert(
        "Microphone access was denied. Please:\n1. Click the 🔒 lock icon in the address bar\n2. Allow microphone access\n3. Reload the page",
      );
      return;
    }

    try {
      console.log("Starting audio recording...");
      setIsRecording(true);
      setIsListening(true);
      setDebugInfo("🎤 Recording... Speak now!");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, processing audio...");
        setDebugInfo("⏳ Processing audio...");

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        stream.getTracks().forEach((track) => track.stop());

        try {
          // Use Django backend for speech-to-text
          const data = await speechToText(audioBlob);
          const transcribedText = data.text;
          setDebugInfo(`✅ Captured: "${transcribedText}"`);

          if (transcriptionResolverRef.current) {
            transcriptionResolverRef.current(transcribedText);
            transcriptionResolverRef.current = null;
          }
        } catch (error) {
          console.error("Transcription error:", error);
          setDebugInfo("❌ Failed to transcribe. Please try again.");

          if (transcriptionResolverRef.current) {
            transcriptionResolverRef.current(null);
            transcriptionResolverRef.current = null;
          }
        } finally {
          setIsRecording(false);
          setIsListening(false);
        }
      };

      mediaRecorder.start();
      console.log("MediaRecorder started");
    } catch (error: any) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      setIsListening(false);
      setDebugInfo("❌ Error starting microphone: " + error.message);
      alert("Error starting microphone: " + error.message);
    }
  };

  const stopRecording = (): Promise<string | null> => {
    console.log("🛑 Stop recording button clicked");
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setDebugInfo("⏹️ Stopping recording...");

        // Return a promise that resolves when transcription is complete
        return new Promise<string | null>((resolve) => {
          transcriptionResolverRef.current = resolve;

          // Timeout after 15 seconds
          setTimeout(() => {
            if (transcriptionResolverRef.current === resolve) {
              transcriptionResolverRef.current = null;
              resolve(null);
            }
          }, 15000);
        });
      } catch (error) {
        console.error("Error stopping recording:", error);
        return Promise.resolve(null);
      }
    }
    return Promise.resolve(null);
  };

  const testMicrophone = async () => {
    setDebugInfo("🧪 Testing microphone...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setDebugInfo("✅ Microphone test passed! You can use voice features.");
      setMicPermission("granted");
      stream.getTracks().forEach((track) => track.stop());
    } catch (error: any) {
      setDebugInfo("❌ Microphone test failed: " + error.message);
      setMicPermission("denied");
      alert(
        "Microphone test failed. Please allow microphone access and try again.",
      );
    }
  };

  return {
    micPermission,
    isRecording,
    isListening,
    debugInfo,
    startRecording,
    stopRecording,
    testMicrophone,
  };
};
