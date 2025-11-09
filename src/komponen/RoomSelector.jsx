import React from "react";

const defaultRooms = ["global", "random", "tech"];

const RoomSelector = ({ value, onChange, rooms = defaultRooms }) => {
  return (
    <div className="flex gap-2">
      {rooms.map((r) => {
        const active = r === value;
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={
              "px-3 py-1 rounded border " +
              (active
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 hover:bg-gray-100")
            }
          >
            #{r}
          </button>
        );
      })}
    </div>
  );
};

export default RoomSelector;