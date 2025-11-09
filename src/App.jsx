import React, { useEffect, useState } from "react";
import { auth, rtdb } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthButton from "./komponen/AuthButton";
import ChatRoom from "./komponen/ChatRoom";
import RoomSelector from "./komponen/RoomSelector";
import Sidebar from "./komponen/Sidebar";
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";

const App = () => {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState("global");
  const [dmPeer, setDmPeer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Presence: tandai user online saat terkoneksi
  useEffect(() => {
    if (!user) return;
    const connRef = ref(rtdb, ".info/connected");
    const presenceRef = ref(rtdb, `presence/${user.uid}`);
    const unsub = onValue(connRef, async (snap) => {
      if (snap.val() === true) {
        onDisconnect(presenceRef).remove();
        await set(presenceRef, {
          uid: user.uid,
          displayName: user.displayName || user.email || "Anonim",
          photoURL: user.photoURL || "",
          online: true,
          lastSeen: serverTimestamp(),
        });
      }
    });
    return () => unsub();
  }, [user]);

  const makeDMRoomId = (uidA, uidB) => {
    const [a, b] = [uidA, uidB].sort();
    return `dm_${a}_${b}`;
  };

  const startDM = (peer) => {
    if (!user || !peer?.uid) return;
    setDmPeer({ uid: peer.uid, displayName: peer.displayName || peer.uid });
    setRoomId(makeDMRoomId(user.uid, peer.uid));
    setSidebarOpen(false);
  };

  const exitDM = () => {
    setDmPeer(null);
    setRoomId("global");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-green-50">
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border bg-white hover:bg-gray-100"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle Sidebar"
            >
              <span className="sr-only">Toggle Sidebar</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path d="M3.75 5.5h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 7h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 7h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Z" />
              </svg>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-green-700">
              Chat
            </h1>
          </div>
          <AuthButton user={user} />
        </header>

        <div className="grid md:grid-cols-[18rem_1fr] gap-4">
          {/* Sidebar desktop */}
          <div className="hidden md:block">
            <Sidebar
              currentUser={user}
              onStartDM={startDM}
              onOpenRoom={(r) => {
                setRoomId(r);
                setSidebarOpen(false);
                if (r.startsWith("dm_")) {
                  const parts = r.split("_").slice(1);
                  const otherUid =
                    parts.find((p) => p !== user?.uid) || parts[0];
                  setDmPeer({ uid: otherUid, displayName: otherUid });
                } else {
                  setDmPeer(null);
                }
              }}
            />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <RoomSelector
              value={roomId}
              onChange={(r) => {
                setDmPeer(null);
                setRoomId(r);
              }}
            />
            {user ? (
              <>
                {dmPeer ? (
                  <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                    <p className="text-sm text-gray-700">
                      DM dengan{" "}
                      <span className="font-semibold">
                        {dmPeer.displayName}
                      </span>
                    </p>
                    <button
                      onClick={exitDM}
                      className="px-3 py-1 rounded-md border bg-white hover:bg-gray-100 text-sm"
                    >
                      Keluar DM
                    </button>
                  </div>
                ) : null}
                <ChatRoom user={user} roomId={roomId} peer={dmPeer} />
              </>
            ) : (
              <div className="rounded-lg border bg-white px-4 py-6 text-gray-700">
                <p>Silakan masuk untuk mulai mengirim pesan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-lg border-r p-3">
              <Sidebar
                currentUser={user}
                onStartDM={startDM}
                onOpenRoom={(r) => {
                  setRoomId(r);
                  setSidebarOpen(false);
                  if (r.startsWith("dm_")) {
                    const parts = r.split("_").slice(1);
                    const otherUid =
                      parts.find((p) => p !== user?.uid) || parts[0];
                    setDmPeer({ uid: otherUid, displayName: otherUid });
                  } else {
                    setDmPeer(null);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
