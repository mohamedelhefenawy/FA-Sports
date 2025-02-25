"use client";

import { useEffect, useRef, useState } from "react";

export default function LivePose() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseInstance, setPoseInstance] = useState(null);
  const [shoulderDistance, setShoulderDistance] = useState(0);
  const [startstatus, setStartStatus] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadMediaPipe = async () => {
      const poseModule = await import("@mediapipe/pose");
      const drawingUtilsModule = await import("@mediapipe/drawing_utils");

      const { Pose, POSE_CONNECTIONS } = poseModule;
      const { drawLandmarks, drawConnectors } = drawingUtilsModule;

      const instance = new Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      instance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
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

  // Fixed progress bar logic
  useEffect(() => {
    let interval;
    if (startstatus) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    } else {
      setProgress(0); // Reset progress when startstatus is false
    }

    return () => clearInterval(interval);
  }, [startstatus]);

  const drawPose = (results, drawLandmarks, drawConnectors, POSE_CONNECTIONS) => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    drawRectangle(ctx);

    if (results.poseLandmarks) {
      const ignoredLandmarkIndices = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22]);

      const filteredConnections = POSE_CONNECTIONS.filter(
        ([start, end]) => !ignoredLandmarkIndices.has(start) && !ignoredLandmarkIndices.has(end)
      );

      drawConnectors(ctx, results.poseLandmarks, filteredConnections, { color: "white", lineWidth: 1 });

      const bodyLandmarks = results.poseLandmarks.filter((_, index) => !ignoredLandmarkIndices.has(index));
      drawLandmarks(ctx, bodyLandmarks, { color: "white", radius: 3 });

      const leftShoulder = results.poseLandmarks[11];
      const rightShoulder = results.poseLandmarks[12];

      if (leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5) {
        const distance = Math.sqrt(
          Math.pow((rightShoulder.x - leftShoulder.x) * videoWidth, 2) +
          Math.pow((rightShoulder.y - leftShoulder.y) * videoHeight, 2)
        );
        setShoulderDistance(distance.toFixed(2));
      }

      const leftHip = results.poseLandmarks[24];
      const rightHip = results.poseLandmarks[23];

      if (leftHip && rightHip) {
        const middleHipX = (leftHip.x + rightHip.x) / 2;
        setStartStatus(middleHipX > 0.25 && middleHipX < 0.75);
      }
    }
  };

  const drawRectangle = (ctx) => {
    const rectWidth = 300;
    const rectHeight = 600;
    const x = (canvasRef.current.width - rectWidth) / 2;
    const y = (canvasRef.current.height - rectHeight) / 2;

    ctx.fillStyle = "rgba(0, 0, 0, .5)";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    ctx.clearRect(x, y, rectWidth, rectHeight);
    ctx.globalCompositeOperation = "source-over";

    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, rectWidth, rectHeight);
  };

  return (
    <div className="relative w-full h-auto flex flex-col items-center">
      <video ref={videoRef} className="w-full h-[100vh]" autoPlay playsInline></video>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-[100vh] z-10"></canvas>

      {/* Display the Start Status */}
      {startstatus ? (
        /* Progress Bar */
        <div className="absolute bottom-5 w-[40%] h-6 bg-gray-300 rounded-full mt-6">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      ) : (
        /* "Be in The Center" message */
        <div
          className="absolute w-[40%] h-[40%] flex flex-col items-center justify-center 
            top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] 
            text-7xl font-bold rounded-lg z-30 text-red-500"
        >
          <p>Be in The Center</p>
        </div>
      )}
    </div>
  );
}
