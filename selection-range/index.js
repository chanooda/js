const wordExtractionRegex = /\b\w+\b/g;
const wordWithMaxLengthRegex = /\b\w{6,}\b/g;
const WORD_FREQUENCY_THRESHOLD = 5;
const WHITE_SPACE_REGEX = /\s/;
const SELECTION_WORD_MAX_LENGTH = 5;

const wordMap = {};

const getBlurredWordElement = (word) => {
  const frag = document.createDocumentFragment();
  word.split(" ").forEach((w) => {
    const span = document.createElement("span");
    span.className = "blurred";
    span.textContent = w;
    frag.append(span, " ");
  });
  return frag;
};

const initialize = () => {
  const content = document.getElementById("content");

  if (!content) return;

  const textNodes = [];
  const textWorker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => !!node.textContent.trim(),
  });

  while (textWorker.nextNode()) {
    const textContent = textWorker.currentNode.textContent;
    const words = textContent.match(wordWithMaxLengthRegex);

    words.forEach((word) => {
      wordMap[word] = (wordMap[word] || 0) + 1;
    });

    textNodes.push(textWorker.currentNode);
  }
  const wordList = Object.keys(wordMap).filter(
    (word) => wordMap[word] >= WORD_FREQUENCY_THRESHOLD
  );

  const wordRegex = new RegExp(`\\b(${wordList.join("|")})\\b`, "gi");

  textNodes.forEach((node) => {
    const p = document.createDocumentFragment();
    const textContent = node.textContent;

    wordRegex.lastIndex = 0;

    let match;
    let lastIndex = 0;
    while ((match = wordRegex.exec(textContent)) !== null) {
      const prevText = textContent.slice(lastIndex, match.index);

      const blurredWordElement = getBlurredWordElement(match[0]);
      p.append(prevText, blurredWordElement);
      lastIndex = match.index + match[0].length;
    }

    node.parentNode.replaceChild(p, node);
  });
};

const getWordRange = () => {
  const selection = document.getSelection();
  const range = selection.getRangeAt(0);
  const { startContainer, endContainer } = range;
  let startOffset = range.startOffset;
  let endOffset = range.endOffset;

  if (WHITE_SPACE_REGEX.test(startContainer.textContent[startOffset])) {
    while (WHITE_SPACE_REGEX.test(startContainer.textContent[startOffset])) {
      startOffset++;
    }
  } else {
    while (
      startOffset > 0 &&
      !WHITE_SPACE_REGEX.test(startContainer.textContent[startOffset - 1])
    ) {
      startOffset--;
    }
  }

  if (WHITE_SPACE_REGEX.test(endContainer.textContent[endOffset - 1])) {
    while (WHITE_SPACE_REGEX.test(endContainer.textContent[endOffset - 1])) {
      endOffset--;
    }
  } else {
    while (
      endOffset < endContainer.textContent.length &&
      !WHITE_SPACE_REGEX.test(endContainer.textContent[endOffset])
    ) {
      endOffset++;
    }
  }

  return {
    startOffset,
    endOffset,
  };
};

const handleClickBlurBtn = () => {
  const selection = document.getSelection();

  if (!selection?.toString().trim()) {
    alert("블러 처리할 단어를 선택해주세요.");
    return;
  }

  const range = selection.getRangeAt(0);
  const { endOffset, startOffset } = getWordRange();

  range.setStart(range.startContainer, startOffset);
  range.setEnd(range.endContainer, endOffset);

  const commonAncestorContainer = range.commonAncestorContainer;
  const parentElement = commonAncestorContainer.parentElement;
  const isBlurred =
    parentElement.tagName === "SPAN" &&
    parentElement.classList.contains("blurred");
  const spans =
    commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? commonAncestorContainer.querySelectorAll("span.blurred")
      : [];
  if (isBlurred || Array.from(spans).some((el) => range.intersectsNode(el))) {
    alert("이미 블러 처리된 단어는 다시 블러 처리할 수 없습니다.");
    return;
  }

  const selectedText = selection.toString();
  if (selectedText.split(" ").length > SELECTION_WORD_MAX_LENGTH) {
    alert("블러 처리할 단어는 최대 5개까지 선택할 수 있습니다.");
    return;
  }

  range.extractContents();
  const blurredWordEl = getBlurredWordElement(selectedText);
  range.insertNode(blurredWordEl);
  selection.removeAllRanges();
};

const handleClickRemoveBlurBtn = () => {
  const selection = document.getSelection();

  if (!selection.toString().trim()) return;

  const range = selection.getRangeAt(0);

  const { startOffset, endOffset } = getWordRange();
  range.setStart(range.startContainer, startOffset);
  range.setEnd(range.endContainer, endOffset);

  const isAllBlurred =
    range.commonAncestorContainer.parentElement.tagName === "SPAN" &&
    range.commonAncestorContainer.parentElement.classList.contains("blurred");

  if (isAllBlurred) {
    const span = range.commonAncestorContainer.parentElement;
    const text = span.textContent;
    span.replaceWith(text);
  } else {
    const text = range.extractContents().textContent;
    range.insertNode(document.createTextNode(text));

    const commonAncestorContainer = range.commonAncestorContainer;
    commonAncestorContainer.childNodes.forEach((node) => {
      if (
        node.nodeName === "SPAN" &&
        node.classList.contains("blurred") &&
        node.textContent === ""
      ) {
        node.remove();
      }
    });
  }
  selection.removeAllRanges();
};

const handleClickRemoveBlurBtnAll = (e) => {
  const blurredWord = document.querySelectorAll("span.blurred");
  blurredWord.forEach((span) => {
    span.classList.remove("blurred");
  });

  const target = e.target;
  target.classList.add("hide");

  const timer = document.getElementsByClassName("timer")[0];
  let count = 3;
  let timeoutId = null;
  timer.textContent = count;
  timer.classList.remove("hide");

  timeoutId = setInterval(() => {
    count--;
    timer.textContent = count;

    if (count === 0) {
      clearInterval(timeoutId);
      timer.classList.add("hide");
      target.classList.remove("hide");

      blurredWord.forEach((span) => {
        span.classList.add("blurred");
      });
    }
  }, 1000);
};

document.addEventListener("DOMContentLoaded", () => {
  const blurBtn = document.getElementById("blurBtn");
  const removeBlurBtn = document.getElementById("removeBlurBtn");
  const removeAllBlurBtn = document.getElementById("removeAllBlurBtn");

  initialize();

  blurBtn.addEventListener("click", handleClickBlurBtn);
  removeBlurBtn.addEventListener("click", handleClickRemoveBlurBtn);
  removeAllBlurBtn.addEventListener("click", handleClickRemoveBlurBtnAll);
});
