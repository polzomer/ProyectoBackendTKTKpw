interface LevelBarProps {
  currentXP: number;
}

export default function LevelBar({ currentXP }: LevelBarProps) {
  const level = Math.floor(currentXP / 10) + 1;
  const progress = (currentXP % 10) * 10;

  return (
    <div style={{ marginTop: 20 }}>
      <p>Nivel {level}</p>
      <div
        style={{
          height: 10,
          background: "#333",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            background: "#ff0050",
            height: "100%",
            transition: "width 0.3s",
          }}
        />
      </div>
    </div>
  );
}
