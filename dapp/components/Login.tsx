export function Login({ onLogin }: { onLogin: (user: { email: string }) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
      <div className="bg-[#1a1a1a] p-10 rounded-2xl shadow-2xl w-96 border border-[#333]">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#00e0ff]">LegacyChain</h1>
        <button
          onClick={() => onLogin({ email: "demo@user.com" })}
          className="w-full py-4 bg-[#00e0ff] text-black font-bold rounded-lg hover:bg-[#00ffff] transition text-xl"
        >
          Login Demo (fără parolă)
        </button>
        <p className="text-center text-[#888] mt-6 text-sm">
          Apasă butonul pentru a intra în aplicație (demo)
        </p>
      </div>
    </div>
  );
}