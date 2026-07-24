import Phaser from "phaser";

export interface ScoreCreature {
  id: string;
  color: number;
}

const iconElements = new Map<string, HTMLDivElement>();

export function setLevelLabel(label: string): void {
  const el = document.getElementById("level-label");
  if (!el) {
    return;
  }
  el.textContent = label;
}

export function setupScore(creatures: ScoreCreature[]): void {
  const container = document.getElementById("score");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  iconElements.clear();

  const rows = new Map<number, ScoreCreature[]>();
  for (const creature of creatures) {
    const row = rows.get(creature.color) ?? [];
    row.push(creature);
    rows.set(creature.color, row);
  }

  for (const [color, rowCreatures] of rows) {
    const row = document.createElement("div");
    row.className = "score-row";

    const reference = document.createElement("div");
    reference.className = "score-icon score-icon-reference";
    reference.style.backgroundColor = toCssColor(color);
    row.appendChild(reference);

    for (const creature of rowCreatures) {
      const icon = document.createElement("div");
      icon.className = "score-icon";
      row.appendChild(icon);
      iconElements.set(creature.id, icon);
    }

    container.appendChild(row);
  }
}

export function markCreaturePainted(id: string, color: number): void {
  const icon = iconElements.get(id);
  if (!icon) {
    return;
  }
  icon.classList.add("filled");
  icon.style.backgroundColor = toCssColor(color);
}

export function setupMuteButton(soundManager: Phaser.Sound.BaseSoundManager): void {
  const button = document.getElementById("mute-button");
  if (!button) {
    return;
  }

  const updateIcon = () => {
    button.classList.toggle("muted", soundManager.mute);
  };

  button.addEventListener("click", () => {
    soundManager.mute = !soundManager.mute;
    updateIcon();
  });

  updateIcon();
}

function toCssColor(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}
