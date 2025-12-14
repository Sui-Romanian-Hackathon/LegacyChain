import { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-lg w-96">
          <h1 className="text-3xl text-cyan-400 text-center mb-8">LegacyChain</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email (demo)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded mb-4"
              required
            />
            <button type="submit" className="w-full p-3 bg-cyan-500 text-black font-bold rounded">
              Intră
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl text-center mb-8 text-cyan-400">Bine ai venit!</h1>
      <p className="text-center text-xl">Email: {email}</p>
      <p className="text-center mt-8 text-gray-400">
        Interfață minimă – funcționează fără erori
      </p>
      <button
        onClick={() => setIsLoggedIn(false)}
        className="mt-8 mx-auto block px-6 py-3 bg-red-600 rounded"
      >
        Logout
      </button>
    </div>
  );
}