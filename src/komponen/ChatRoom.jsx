import React, { useEffect, useRef, useState } from "react";
import { rtdb } from "../firebase/firebase";
import {
  ref,
  onValue,
  push,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  remove,
  update,
  runTransaction,
} from "firebase/database";
import MessageItem from "./MessageItem";

const ChatRoom = ({ user, roomId, peer }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
    const q = query(messagesRef, orderByChild("createdAt"), limitToLast(200));
    const unsub = onValue(
      q,
      (snap) => {
        const val = snap.val() || {};
        const list = Object.entries(val)
          .map(([id, item]) => ({ id, ...item }))
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setMessages(list);
        setLoading(false);
        queueMicrotask(() => {
          if (listRef.current)
            listRef.current.scrollTop = listRef.current.scrollHeight;
        });
      },
      (err) => {
        setError(err.message || "Gagal memuat pesan");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [roomId]);

  // Saat memasuki DM room, reset unread untuk user ini
  useEffect(() => {
    if (!roomId?.startsWith("dm_") || !user) return;
    const indexRef = ref(rtdb, `dm_index/${user.uid}/${roomId}`);
    update(indexRef, { unreadCount: 0, lastReadAt: serverTimestamp() }).catch(
      () => {}
    );
  }, [roomId, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      const messagesRef = ref(rtdb, `rooms/${roomId}/messages`);
      await push(messagesRef, {
        text: trimmed,
        uid: user.uid,
        displayName: user.displayName || user.email || "Anonim",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp(),
      });
      setText("");

      // DM index update untuk kedua pihak
      if (roomId.startsWith("dm_") && user?.uid) {
        const parts = roomId.split("_").slice(1);
        const otherUid = parts.find((p) => p !== user.uid) || parts[0];

        // Index untuk pengirim: lastMessage, lastMessageAt, unreadCount=0
        const selfIndexRef = ref(rtdb, `dm_index/${user.uid}/${roomId}`);
        await update(selfIndexRef, {
          roomId,
          peerUid: otherUid,
          peerDisplayName: peer?.displayName || otherUid,
          peerPhotoURL: peer?.photoURL || "",
          lastMessage: trimmed,
          lastMessageAt: serverTimestamp(),
          unreadCount: 0,
        });

        // Index untuk penerima: increment unreadCount, set meta
        const otherIndexRef = ref(rtdb, `dm_index/${otherUid}/${roomId}`);
        await update(otherIndexRef, {
          roomId,
          peerUid: user.uid,
          peerDisplayName: user.displayName || user.email || user.uid,
          peerPhotoURL: user.photoURL || "",
          lastMessage: trimmed,
          lastMessageAt: serverTimestamp(),
        });
        const unreadRef = ref(
          rtdb,
          `dm_index/${otherUid}/${roomId}/unreadCount`
        );
        await runTransaction(
          unreadRef,
          (current) => (Number(current) || 0) + 1
        );
      }
    } catch (err) {
      setError(err.message || "Gagal mengirim pesan");
    }
  };

  const deleteMessage = async (msg) => {
    try {
      if (msg.uid !== user.uid) return;
      const msgRef = ref(rtdb, `rooms/${roomId}/messages/${msg.id}`);
      await remove(msgRef);
    } catch (err) {
      setError(err.message || "Gagal menghapus pesan");
    }
  };

  const editMessage = async (msg, newText) => {
    try {
      const trimmed = (newText || "").trim();
      if (!trimmed) return;
      if (msg.uid !== user.uid) return;
      const msgRef = ref(rtdb, `rooms/${roomId}/messages/${msg.id}`);
      await update(msgRef, { text: trimmed, editedAt: serverTimestamp() });
    } catch (err) {
      setError(err.message || "Gagal mengedit pesan");
    }
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[75vh] border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="p-3 border-b bg-linear-to-r from-white to-green-50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Ruang: {roomId}</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
        {loading ? (
          <p className="text-sm text-gray-600">Memuat...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-600">Belum ada pesan.</p>
        ) : (
          messages.map((m) => (
            <MessageItem
              key={m.id}
              msg={m}
              isOwn={m.uid === user.uid}
              onDelete={() => deleteMessage(m)}
              onEdit={(text) => editMessage(m, text)}
            />
          ))
        )}
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Tulis pesan..."
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
