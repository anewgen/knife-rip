/**
 * JSX for `next/og` ImageResponse — inline styles only (subset supported by Satori).
 */
export function OgImageMarkup() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#060404",
        padding: 72,
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 520,
          height: 520,
          background:
            "radial-gradient(circle at 60% 40%, rgba(220, 38, 38, 0.22), transparent 58%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -80,
          width: 440,
          height: 440,
          background:
            "radial-gradient(circle at 40% 60%, rgba(127, 29, 29, 0.35), transparent 55%)",
        }}
      />
      <div
        style={{
          fontSize: 108,
          fontWeight: 800,
          color: "#f4eded",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        Knife
      </div>
      <div
        style={{
          fontSize: 34,
          color: "#9a8f90",
          marginTop: 16,
          fontWeight: 500,
        }}
      >
        knife.rip
      </div>
      <div
        style={{
          width: 100,
          height: 4,
          background: "linear-gradient(90deg, #f87171, rgba(248, 113, 113, 0.2))",
          marginTop: 40,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          fontSize: 28,
          color: "#c4b8b9",
          marginTop: 36,
          maxWidth: 820,
          lineHeight: 1.45,
          fontWeight: 400,
        }}
      >
        All-in-one Discord bot — moderation, utilities, engagement.
      </div>
    </div>
  );
}
