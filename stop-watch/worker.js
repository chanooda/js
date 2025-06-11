let isStart = false;
let time = 1;
let timeId = null;

const timer = () => {
  isStart = true;
  timeId = setInterval(() => {
    postMessage(time++);
  }, 10);
};

onmessage = (e) => {
  const message = e.data;

  if (message === "start") {
    if (isStart) return;
    timer();
  }

  if (message === "stop") {
    if (!isStart) return;
    isStart = false;
    clearInterval(timeId);
  }

  if (message === "reset") {
    timeId = null;
    time = 1;
    clearInterval(timeId);
    isStart = false;
  }
};
