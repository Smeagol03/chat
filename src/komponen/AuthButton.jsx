import React from "react";
import { auth } from "../firebase/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const provider = new GoogleAuthProvider();

const AuthButton = ({ user }) => {
  const handleSignIn = async () => {
    await signInWithPopup(auth, provider);
  };
  const handleSignOut = async () => {
    await signOut(auth);
  };
  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          {user.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              {user.displayName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <span className="text-sm text-gray-700">{user.displayName || user.email}</span>
          <button
            onClick={handleSignOut}
            className="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Keluar
          </button>
        </>
      ) : (
        <button
          onClick={handleSignIn}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          Masuk dengan Google
        </button>
      )}
    </div>
  );
};

export default AuthButton;