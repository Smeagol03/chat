import React, { useState } from "react";

const formatTime = (ts) => {
  if (typeof ts !== "number") return "";
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const MessageItem = ({ msg, isOwn, onDelete, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [tempText, setTempText] = useState(msg.text || "");
  return (
    <div
      className={`flex ${
        isOwn ? "justify-end" : "justify-start"
      } items-end gap-2`}
    >
      {!isOwn && (
        <div className="w-7 h-7 rounded-full overflow-hidden border bg-green-600 text-white text-sm flex items-center justify-center">
          {msg.photoURL ? (
            <img
              src={msg.photoURL}
              alt={msg.displayName || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            (msg.displayName || "U").slice(0, 1).toUpperCase()
          )}
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-xl px-4 py-2 shadow-sm text-sm ${
          isOwn
            ? "bg-linear-to-r from-green-600 to-green-500 text-white"
            : "bg-white border text-gray-900"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={`font-medium mb-1 ${
              isOwn ? "text-white" : "text-gray-800"
            }`}
          >
            {msg.displayName || "Anonim"}
          </p>
          {isOwn && (
            <div className="flex items-center gap-2 text-xs">
              {!editing ? (
                <>
                  <button
                    type="button"
                    className={`underline ${
                      isOwn ? "text-green-100" : "text-gray-600"
                    }`}
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`underline ${
                      isOwn ? "text-green-100" : "text-gray-600"
                    }`}
                    onClick={onDelete}
                  >
                    Hapus
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`underline ${
                      isOwn ? "text-green-100" : "text-gray-600"
                    }`}
                    onClick={() => {
                      setEditing(false);
                      setTempText(msg.text || "");
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className={`underline ${
                      isOwn ? "text-green-100" : "text-gray-600"
                    }`}
                    onClick={() => {
                      const t = (tempText || "").trim();
                      if (!t) return;
                      onEdit && onEdit(t);
                      setEditing(false);
                    }}
                  >
                    Simpan
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {!editing ? (
          <p>{msg.text}</p>
        ) : (
          <textarea
            className={`mt-1 w-full rounded px-2 py-1 text-sm ${
              isOwn ? "text-green-900" : "text-gray-900"
            }`}
            rows={2}
            value={tempText}
            onChange={(e) => setTempText(e.target.value)}
          />
        )}
        <p
          className={`mt-1 text-xs ${
            isOwn ? "text-green-100" : "text-gray-500"
          }`}
        >
          {formatTime(msg.createdAt)}
        </p>
        {msg.editedAt && (
          <p
            className={`text-[10px] ${
              isOwn ? "text-green-100" : "text-gray-400"
            }`}
          >
            diedit
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
