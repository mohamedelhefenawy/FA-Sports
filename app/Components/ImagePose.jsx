"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import photo from "../../public/download.jpeg";

export default function ImagePose() {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const [poseInstance, setPoseInstance] = useState(null);
  const [POSE_CONNECTIONS, setPoseConnections] = useState(null);
  const [drawLandmarks, setDrawLandmarks] = useState(null);
  const [drawConnectors, setDrawConnectors] = useState(null);

  useEffect(() => {
    const loadMediaPipe = async () => {
      const poseModule = await import("@mediapipe/pose");
      const drawingUtilsModule = await import("@mediapipe/drawing_utils");

      const { Pose, POSE_CONNECTIONS } = poseModule;
      const { drawLandmarks, drawConnectors } = drawingUtilsModule;

      setPoseConnections(POSE_CONNECTIONS);
      setDrawLandmarks(() => drawLandmarks);
      setDrawConnectors(() => drawConnectors);

      const instance = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      instance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      instance.onResults((results) => {
        drawPose(results);
      });

      setPoseInstance(instance);
    };

    loadMediaPipe();

    return () => {
      setPoseInstance(null);
    };
  }, []);

  const processImage = async () => {
    if (!poseInstance || !imageRef.current) return;
    await poseInstance.send({ image: imageRef.current });
  };

  const drawPose = (results) => {
    if (!canvasRef.current || !imageRef.current || !drawLandmarks || !drawConnectors || !POSE_CONNECTIONS) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.poseLandmarks) {
      drawLandmarks(ctx, results.poseLandmarks, { color: "red", radius: 3 });
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: "blue", lineWidth: 2 });
    }
  };

  return (
    <div className="relative w-full h-auto flex flex-col items-center">
      <Image ref={imageRef} src={photo} alt="Pose Image" className="w-full h-[90vh]" />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-[90vh]"></canvas>
      <button onClick={processImage} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Detect Pose
      </button>
    </div>
  );
}