import { Spin } from "antd";

export const LoadingComponent = ({ text }) => {
  return (
    <div
      style={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Spin size="large" />

      {text && <span style={{ color: "#64748b" }}>{text}</span>}
    </div>
  );
};
