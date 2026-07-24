let dotElements: HTMLDivElement[] = [];

export function setupProgressDots(count: number): void {
  const container = document.getElementById("progress");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  dotElements = [];

  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    container.appendChild(dot);
    dotElements.push(dot);
  }
}

export function fillProgressDot(index: number, color: number): void {
  const dot = dotElements[index];
  if (!dot) {
    return;
  }

  dot.classList.add("filled");
  dot.style.backgroundColor = `#${color.toString(16).padStart(6, "0")}`;
}
