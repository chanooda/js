const calcTime = (time) => {
  const hours = Math.floor(time / (24 * 60 * 60 * 100));
  const minutes = Math.floor(time / (60 * 100));
  const seconds = Math.floor(time / 100);
  const milliseconds = time % 100;

  return { hours, minutes, seconds, milliseconds };
};

const formatTime = (time) => {
  const { hours, minutes, seconds, milliseconds } = calcTime(time);

  const hoursString = String(hours).padStart(2, 0);
  const minutesString = String(minutes).padStart(2, 0);
  const secondsString = String(seconds).padStart(2, 0);
  const millisecondsString = String(milliseconds).padStart(2, 0);

  return {
    hours: hoursString,
    minutes: minutesString,
    seconds: secondsString,
    milliseconds: millisecondsString,
  };
};

document.addEventListener("DOMContentLoaded", () => {
  let time = 0;
  let isStart = false;

  const worker = new Worker("./worker.js");

  const startStopBtn = document.getElementById("startStopBtn");
  const recordBtn = document.getElementById("recordBtn");

  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const millisecondsEl = document.getElementById("milliseconds");

  const timeListEl = document.getElementById("timeList");

  const reset = () => {
    isStart = false;
    time = 0;
    timeListEl.innerHTML = "";
    worker.postMessage("reset");
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    millisecondsEl.textContent = "00";
  };

  startStopBtn.addEventListener("click", () => {
    if (!isStart) {
      isStart = true;
      startStopBtn.textContent = "정지";
      recordBtn.textContent = "기록";
      worker.postMessage("start");
    } else {
      isStart = false;
      startStopBtn.textContent = "시작";
      recordBtn.textContent = "초기화";
      worker.postMessage("stop");
    }
  });

  recordBtn.addEventListener("click", () => {
    if (isStart) {
      const { hours, minutes, seconds, milliseconds } = formatTime(time);
      const li = document.createElement("li");
      li.innerHTML = `<span>${hours}</span> : <span>${minutes}</span> :
        <span>${seconds}</span> :
        <span>${milliseconds}</span>`;
      timeListEl.prepend(li);
    } else {
      reset();
    }
  });

  worker.onmessage = (e) => {
    time = e.data;

    const { hours, minutes, seconds, milliseconds } = formatTime(time);

    if (Number(hours) > 0) hours;

    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;
    millisecondsEl.textContent = milliseconds;
  };
});
