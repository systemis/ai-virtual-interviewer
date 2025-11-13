'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AvatarDisplayProps {
  expression: string;
  isSpeaking: boolean;
  isListening: boolean;
}

export default function AvatarDisplay({ expression, isSpeaking, isListening }: AvatarDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const avatarRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xffdbac,
      shininess: 30,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);

    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.3, 0.8);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.3, 0.8);
    head.add(rightEye);

    const mouthGeometry = new THREE.TorusGeometry(
      0.3,
      0.05,
      16,
      32,
      Math.PI
    );
    const mouthMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.2, 0.85);
    mouth.rotation.x = Math.PI;
    head.add(mouth);

    const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.9, 2, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x2c5aa0 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -1.5;

    const avatar = new THREE.Group();
    avatar.add(head);
    avatar.add(body);
    scene.add(avatar);

    camera.position.z = 4;
    camera.position.y = 0.5;

    sceneRef.current = {
      scene,
      camera,
      renderer,
      head,
      mouth,
      leftEye,
      rightEye,
    };
    avatarRef.current = avatar;

    let time = 0;
    function animate() {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      avatar.position.y = Math.sin(time * 2) * 0.02;

      if (Math.random() > 0.98) {
        leftEye.scale.y = 0.1;
        rightEye.scale.y = 0.1;
        setTimeout(() => {
          leftEye.scale.y = 1;
          rightEye.scale.y = 1;
        }, 100);
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const { head, mouth } = sceneRef.current;

    if (isListening) {
      let nodTime = 0;
      const nodInterval = setInterval(() => {
        nodTime += 0.1;
        head.rotation.x = Math.sin(nodTime) * 0.1;
      }, 50);
      return () => clearInterval(nodInterval);
    }

    if (isSpeaking) {
      let talkTime = 0;
      const talkInterval = setInterval(() => {
        talkTime += 0.3;
        mouth.scale.y = 0.8 + Math.sin(talkTime * 5) * 0.4;
      }, 100);
      return () => clearInterval(talkInterval);
    } else {
      mouth.scale.y = 1;
    }

    if (expression === 'encouraging') {
      mouth.rotation.x = Math.PI * 1.1;
    } else if (expression === 'neutral') {
      mouth.rotation.x = Math.PI;
    } else if (expression === 'thinking') {
      head.rotation.z = 0.1;
    }
  }, [expression, isSpeaking, isListening]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width="400" height="400" />
      {isListening && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full listening-indicator">
          🎤 Listening...
        </div>
      )}
      {isSpeaking && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full">
          🔊 Speaking...
        </div>
      )}
    </div>
  );
}
