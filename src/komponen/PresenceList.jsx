import React, { useEffect, useState } from "react";
import { rtdb } from "../firebase/firebase";
import { onValue, ref } from "firebase/database";

const PresenceList = ({ currentUser, onStartDM }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const presenceRef = ref(rtdb, "presence");
    const unsub = onValue(presenceRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val)
        .map(([uid, u]) => ({ uid, ...u }))
        .filter((u) => u.online);
      setUsers(list);
    });
    return () => unsub();
  }, []);

  const canDM = (u) => currentUser && u.uid !== currentUser.uid;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Online:</span>
      {users.length === 0 ? (
        <span className="text-sm text-gray-500">Tidak ada</span>
      ) : (
        <div className="flex -space-x-2">
          {users.map((u) => (
            <button
              key={u.uid}
              type="button"
              onClick={() => canDM(u) && onStartDM && onStartDM(u)}
              className={`relative ${canDM(u) ? "cursor-pointer" : "cursor-default"}`}
              title={
                canDM(u)
                  ? `Mulai chat privat dengan ${u.displayName || u.uid}`
                  : `${u.displayName || u.uid}`
              }
            >
              {u.photoURL ? (
                <img
                  src={u.photoURL}
                  alt={u.displayName || u.uid}
                  className="w-6 h-6 rounded-full border"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center border">
                  {(u.displayName || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PresenceList;
