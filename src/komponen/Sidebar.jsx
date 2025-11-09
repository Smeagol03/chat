import React, { useEffect, useMemo, useState } from "react";
import { rtdb } from "../firebase/firebase";
import { onValue, ref } from "firebase/database";

const Sidebar = ({ currentUser, onStartDM, onOpenRoom }) => {
  const [queryText, setQueryText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [dmList, setDmList] = useState([]);

  useEffect(() => {
    const presenceRef = ref(rtdb, "presence");
    const unsub = onValue(presenceRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val)
        .map(([uid, u]) => ({ uid, ...u }))
        .filter((u) => u.online);
      setOnlineUsers(list);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const indexRef = ref(rtdb, `dm_index/${currentUser.uid}`);
    const unsub = onValue(indexRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val)
        .map(([roomId, meta]) => ({ roomId, ...meta }))
        .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
      setDmList(list);
    });
    return () => unsub();
  }, [currentUser]);

  const filteredOnline = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return onlineUsers;
    return onlineUsers.filter((u) =>
      (u.displayName || u.uid || "").toLowerCase().includes(q)
    );
  }, [queryText, onlineUsers]);

  const canDM = (u) => currentUser && u.uid !== currentUser.uid;

  return (
    <aside className="w-72 bg-white border rounded-lg shadow-sm p-3 flex flex-col gap-5">
      <div className="relative">
        <input
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Cari yang online..."
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Online sekarang</h3>
        <div className="mt-2">
          {filteredOnline.length === 0 ? (
            <p className="text-sm text-gray-500">Tidak ada yang cocok.</p>
          ) : (
            <ul className="space-y-1">
              {filteredOnline.map((u) => (
                <li key={u.uid} className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-gray-50">
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt={u.displayName || u.uid}
                      className="w-7 h-7 rounded-full border"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-green-600 text-white text-sm flex items-center justify-center border">
                      {(u.displayName || "U").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    className={`flex-1 text-left text-sm ${canDM(u) ? "text-gray-800 hover:underline" : "text-gray-600"}`}
                    onClick={() => canDM(u) && onStartDM && onStartDM(u)}
                    title={
                      canDM(u)
                        ? `Mulai DM dengan ${u.displayName || u.uid}`
                        : `${u.displayName || u.uid}`
                    }
                  >
                    {u.displayName || u.uid}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Direct Messages</h3>
        <div className="mt-2">
          {dmList.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada DM.</p>
          ) : (
            <ul className="space-y-1">
              {dmList.map((dm) => (
                <li key={dm.roomId} className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-gray-50">
                  <button
                    type="button"
                    onClick={() => onOpenRoom && onOpenRoom(dm.roomId)}
                    className="flex-1 text-left"
                    title={dm.peerDisplayName || dm.peerUid}
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {dm.peerDisplayName || dm.peerUid}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {dm.lastMessage || "(kosong)"}
                    </div>
                  </button>
                  {dm.unreadCount > 0 ? (
                    <span className="ml-2 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-green-600 text-white text-xs">
                      {dm.unreadCount}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;