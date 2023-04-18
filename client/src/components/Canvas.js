import React, { useState, useRef, useEffect, useContext } from "react";
import { MdClose } from "react-icons/md";
//TENSORFLOW
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import { drawHand } from "../utilities";
//CONTEXTS
import { WebcamContext } from "../WebcamProvider";

const Canvas = () => {
  const { webcamRef } = useContext(WebcamContext);
  const canvasRef = useRef();

  let interval = null;

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    // console.log("flag:", flag);

    interval = setInterval(() => {
      detect(net, webcamRef);
    }, 10);
  };

  const detect = async (net, webcamRef) => {
    const video = webcamRef.current;
    if (typeof video !== "undefined" && video !== null) {
      const videoWidth = webcamRef.current.videoWidth;
      const videoHeight = webcamRef.current.videoHeight;

      webcamRef.current.width = videoWidth;
      webcamRef.current.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);
      console.log(hand);

      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  const handleKeyPress = (e) => {
    if (e.altKey && e.keyCode == 72) {
      console.log("start detection");
      runHandpose();
    }
    if (e.altKey && e.keyCode == 83) {
      console.log("stop detection");
      clearInterval(interval);
    }
  };

  const setCanvasDimension = (webcamRef) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      canvasRef.current.width = webcamRef.current.videoWidth;
      canvasRef.current.height = webcamRef.current.videoHeight;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    setCanvasDimension(webcamRef);
  }, []);

  return (
    <div className="canvas-section">
      <div className="canvas-window">
        <div className="window-title">
          Canvas
          <span style={{ float: "right", color: "#0252AF", fontSize: "17px" }}>
            <MdClose />
          </span>
        </div>
        <canvas ref={canvasRef} id="real-canvas" />
      </div>
    </div>
  );
};

export default Canvas;
