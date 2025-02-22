"use client";

import { useEffect, useRef, useState } from "react";

export default function LivePose() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseInstance, setPoseInstance] = useState(null);
  const [shoulderDistance, setShoulderDistance] = useState(0);
  const [startstatus , setStartStatus] = useState(false)

  useEffect(() => {
    const loadMediaPipe = async () => {
      const poseModule = await import("@mediapipe/pose");
      const drawingUtilsModule = await import("@mediapipe/drawing_utils");

      const { Pose, POSE_CONNECTIONS } = poseModule;
      const { drawLandmarks, drawConnectors } = drawingUtilsModule;

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
        drawPose(results, drawLandmarks, drawConnectors, POSE_CONNECTIONS);
      });

      setPoseInstance(instance);
    };

    loadMediaPipe();
  }, []);

  useEffect(() => {
    if (!poseInstance || !videoRef.current) return;

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const processFrame = async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
        await poseInstance.send({ image: videoRef.current });
        requestAnimationFrame(processFrame);
      };

      videoRef.current.onloadedmetadata = () => {
        processFrame();
      };
    };

    startCamera();
  }, [poseInstance]);

  const drawPose = (results, drawLandmarks, drawConnectors, POSE_CONNECTIONS) => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.poseLandmarks) {
      // Remove face (0-10) and hands (15, 16, 17, 18, 19, 20, 21, 22)
      const ignoredLandmarkIndices = new Set([ 
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, // Face
        , 17, 18, 19, 20, 21, 22 // Hands
      ]);

      // Filter out unwanted connections
      const filteredConnections = POSE_CONNECTIONS.filter(
        ([start, end]) => !ignoredLandmarkIndices.has(start) && !ignoredLandmarkIndices.has(end)
      );

      // Draw only body connections
      drawConnectors(ctx, results.poseLandmarks, filteredConnections, { color: "white", lineWidth: 1 });

      // Draw only body landmarks (excluding face & hands)
      const bodyLandmarks = results.poseLandmarks.filter((_, index) => !ignoredLandmarkIndices.has(index));
      drawLandmarks(ctx, bodyLandmarks, { color: "white", radius: 1 });

      // Measure the shoulder distance
      const leftShoulder = results.poseLandmarks[11]; // Left Shoulder
      const rightShoulder = results.poseLandmarks[12]; // Right Shoulder

      const leftHip = results.poseLandmarks[24];
      const rightHip = results.poseLandmarks[23];

      const middleHip = [(leftHip.x+rightHip.x)/2,(leftHip.y+rightHip.y)/2]

      if (middleHip[0] > 0.25 && middleHip[0] < 0.75){
        setStartStatus(true)
      }else{
        setStartStatus(false)
      }
  

      console.log("middle hip is" , middleHip)

      if (leftShoulder && rightShoulder) {
        const distance = Math.sqrt(
          Math.pow(rightShoulder.x - leftShoulder.x, 2) +
          Math.pow(rightShoulder.y - leftShoulder.y, 2)
        );

        setShoulderDistance(distance.toFixed(3)); // Store 3 decimal places
      }
    }
  };

  return (
    <div className="relative w-full h-auto flex flex-col items-center">
      <video ref={videoRef} className="w-full h-[100vh]" autoPlay playsInline></video>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-[100vh] z-10"></canvas>
      
      {/* Display the Shoulder Distance */}
      <div className={`${startstatus === false?'bg-red-500':'bg-green-500'}  absolute top-4 left-4  text-white px-4 py-2 rounded-lg z-20`} >
        Start Status
      </div>
    </div>
  );
}
