import './App.css'
import { useRef, useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const model = await cocoSsd.load();
      setModel(model);
    };
    loadModel();
  }, []);

  useEffect(() => {
    const startWebcam = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      }
    };
    startWebcam();
  }, [videoRef]);

  useEffect(() => {
    if (model) {
      const detectObjects = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.width;
        canvas.height = video.height;

        const predictions = await model.detect(video);

        ctx.clearRect(0, 0, canvas.width, canvas.height);


        predictions.forEach((prediction) => {
          if(prediction.class === 'dog' && prediction.score > 0.3)
          {
            console.log(prediction);
            const [x, y, width, height] = prediction.bbox;
            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            ctx.fillStyle = "#00FF00";
            ctx.font = "18px Arial";
            ctx.fillText(
              `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
              x,
              y > 10 ? y - 5 : 10
            );
          }
        });

        requestAnimationFrame(detectObjects);
      };

      detectObjects();
    }
  }, [model]);

  return (
    <section>
      <video
        ref={videoRef}
        autoPlay
        width="640"
        height="480"
        style={{ display: "block", position: "absolute", top: 100, left: 50 }}
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ position: "absolute", top: 100, left: 50 }}
      />
    </section>
  );
};

export default ObjectDetection;

