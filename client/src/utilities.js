const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

const indexPoint = fingerJoints.indexFinger[4];

export const drawHand = (predictions, ctx) => {
  if (predictions.length > 0) {
    predictions.forEach((prediction) => {
      const landmarks = prediction.landmarks;
      const indexX = landmarks[indexPoint][0];
      const indexY = landmarks[indexPoint][1];
      ctx.beginPath();
      ctx.arc(indexX, indexY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "orange";
      ctx.fill();
    });
  }
};
