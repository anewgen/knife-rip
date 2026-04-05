import { ImageResponse } from "next/og";

/** Favicon — matches Knife palette (same family as OG / brand). */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a0a",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            background: "linear-gradient(135deg, #f87171 0%, #b91c1c 100%)",
            borderRadius: 10,
            fontSize: 28,
            fontWeight: 800,
            color: "#0c0a0a",
            letterSpacing: "-0.06em",
          }}
        >
          K
        </div>
      </div>
    ),
    { ...size },
  );
}
