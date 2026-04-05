import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 124,
            height: 124,
            background: "linear-gradient(135deg, #f87171 0%, #b91c1c 100%)",
            borderRadius: 28,
            fontSize: 78,
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
