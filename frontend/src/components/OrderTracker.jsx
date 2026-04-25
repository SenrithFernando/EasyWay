import React from "react";
import "../styles/OrderTracker.css";

const ORDER_STAGES = [
  { value: "pending", label: "Pending", icon: "⏳" },
  { value: "preparing", label: "Preparing", icon: "📋" },
  { value: "cooking", label: "Cooking", icon: "👨‍🍳" },
  { value: "ready_for_pickup", label: "Ready", icon: "✅" },
  { value: "completed", label: "Completed", icon: "🎉" },
];

export function OrderTracker({ status }) {
  const currentIndex = ORDER_STAGES.findIndex((s) => s.value === status);
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="order-tracker-container">
        <div className="order-tracker cancelled">
          <div className="cancelled-badge">❌ Order Cancelled</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracker-container">
      <div className="order-tracker">
        {ORDER_STAGES.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isFinal = index === ORDER_STAGES.length - 1;

          return (
            <div key={stage.value} className="tracker-stage">
              <div
                className={`stage-indicator ${isCompleted ? "completed" : isActive ? "active" : "pending"}`}
              >
                <span className="stage-icon">{stage.icon}</span>
              </div>
              <div className="stage-label">{stage.label}</div>
              {!isFinal && (
                <div
                  className={`stage-connector ${isCompleted ? "completed" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="tracker-status-text">
        Current Status:{" "}
        <strong>{ORDER_STAGES[currentIndex]?.label || "Unknown"}</strong>
      </div>
    </div>
  );
}
