import { useState } from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Clock,
  HeartHandshake,
  Plus,
  Trash2,
  User
} from "lucide-react";

type ViewKey = "dashboard" | "assets" | "heirs" | "settings";

interface MenuItem {
    id: ViewKey;
    label: string;
    icon: any;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewKey>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [heirs, setHeirs] = useState([
    { id: "1", name: "Maria Popescu", relation: "Fiică", walletAddress: "0xabc...123", percentage: 50 },
    { id: "2", name: "Ion Popescu", relation: "Fiu", walletAddress: "0xdef...456", percentage: 30 },
  ]);

  const [newHeir, setNewHeir] = useState({
    name: "",
    relation: "",
    walletAddress: "",
    percentage: "",
  });

  const totalPercentage = heirs.reduce((sum, h) => sum + h.percentage, 0);

  const handleAddHeir = () => {
    if (!newHeir.name || !newHeir.walletAddress || !newHeir.percentage) {
      alert("Completează toate câmpurile!");
      return;
    }

    const percentage = Number(newHeir.percentage);
    if (percentage <= 0 || percentage > 100 || totalPercentage + percentage > 100) {
      alert("Procent invalid sau depășește 100%!");
      return;
    }

    setHeirs([
      ...heirs,
      {
        id: Date.now().toString(),
        name: newHeir.name,
        relation: newHeir.relation,
        walletAddress: newHeir.walletAddress,
        percentage,
      },
    ]);

    setNewHeir({ name: "", relation: "", walletAddress: "", percentage: "" });
    alert("Moștenitor adăugat cu succes!");
  };

  const handleRemoveHeir = (id: string) => {
    setHeirs(heirs.filter(h => h.id !== id));
  };

  const handleCheckIn = () => {
    alert("Check-in reușit! Taxa de reînnoire plătită. Timer-ul a fost resetat.");
  };

  const handleCancelWill = () => {
    if (window.confirm("Ești sigur că vrei să anulezi testamentul? Toate fondurile vor fi returnate.")) {
        // Aici se va apela funcția din contractul Sui: cancel_will(...)
        alert("Testament anulat. Depozitul a fost rambursat.");
    }
  };

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "assets", label: "Assets", icon: Wallet },
    { id: "heirs", label: "Heirs", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} transition-all duration-300 bg-[#1a1a1a] border-r border-[#2a2a2a]`}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d1ff] to-blue-600 flex items-center justify-center">
              <HeartHandshake className="w-8 h-8 text-black" />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-white">LegacyChain</h1>
                <p className="text-xs text-gray-400">Digital Inheritance</p>
              </div>
            )}
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                aria-label={`Go to ${item.label}`}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? "bg-[#00d1ff] text-black font-bold"
                    : "hover:bg-[#2a2a2a] text-gray-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
              {menuItems.find(i => i.id === currentView)?.label}
            </h2>
            <button
              key={"isSidebarToggl"} 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="lg:hidden p-2 rounded-lg hover:bg-[#2a2a2a]"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <span className="w-full h-0.5 bg-white"></span>
                <span className="w-full h-0.5 bg-white"></span>
                <span className="w-full h-0.5 bg-white"></span>
              </div>
            </button>
          </div>

          {/* Dashboard */}
          {currentView === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a]">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <div>
                      <p className="text-gray-400">Will Status</p>
                      <p className="text-2xl font-bold">Active</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a]">
                  <div className="flex items-center gap-4">
                    <Clock className="w-10 h-10 text-yellow-500" />
                    <div>
                      <p className="text-gray-400">Grace Period</p>
                      <p className="text-2xl font-bold">30 days</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a]">
                  <div className="flex items-center gap-4">
                    <Users className="w-10 h-10 text-blue-500" />
                    <div>
                      <p className="text-gray-400">Heirs Allocated</p>
                      <p className="text-2xl font-bold">{totalPercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleCheckIn}
                  className="px-12 py-6 bg-[#00d1ff] text-black text-2xl font-bold rounded-2xl hover:bg-cyan-400 transition-shadow hover:shadow-2xl hover:shadow-[#00d1ff]/50"
                >
                  I'm Alive! (Pay Renewal Fee)
                </button>
                <p className="text-gray-400 mt-4">Last check-in: 2 hours ago</p>
              </div>

              {totalPercentage < 100 && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                    <div>
                      <p className="text-yellow-400 font-semibold">Warning</p>
                      <p className="text-gray-300">
                        {100 - totalPercentage}% of assets are not allocated. Remaining will go to Executor upon execution.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Heirs Page */}
          {currentView === "heirs" && (
            <div className="space-y-8">
              <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-[#2a2a2a]">
                <h3 className="text-2xl font-bold mb-6">Adaugă moștenitor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Nume complet"
                    value={newHeir.name}
                    onChange={(e) => setNewHeir({ ...newHeir, name: e.target.value })}
                    className="p-4 bg-[#2a2a2a] rounded-lg border border-[#444] text-white focus:border-[#00d1ff] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Relație (ex: Fiică, Fiu)"
                    value={newHeir.relation}
                    onChange={(e) => setNewHeir({ ...newHeir, relation: e.target.value })}
                    className="p-4 bg-[#2a2a2a] rounded-lg border border-[#444] text-white focus:border-[#00d1ff] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Adresă wallet Sui (0x...)"
                    value={newHeir.walletAddress}
                    onChange={(e) => setNewHeir({ ...newHeir, walletAddress: e.target.value })}
                    className="p-4 bg-[#2a2a2a] rounded-lg border border-[#444] text-white focus:border-[#00d1ff] focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Procent (%)"
                    value={newHeir.percentage}
                    onChange={(e) => setNewHeir({ ...newHeir, percentage: e.target.value })}
                    className="p-4 bg-[#2a2a2a] rounded-lg border border-[#444] text-white focus:border-[#00d1ff] focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleAddHeir}
                  aria-label="Add heir"
                  className="px-8 py-4 bg-[#00d1ff] text-black font-bold rounded-lg hover:bg-cyan-400 transition flex items-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  Adaugă moștenitor
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Moștenitori actuali ({totalPercentage}% alocat)</h3>
                {heirs.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">Nu ai adăugat încă moștenitori</p>
                ) : (
                  heirs.map((heir) => (
                    <div key={heir.id} className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d1ff] to-blue-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{heir.name}</p>
                          <p className="text-gray-400">{heir.relation}</p>
                          <p className="text-sm text-gray-500 truncate w-64">{heir.walletAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#00d1ff]">{heir.percentage}%</p>
                        </div>
                        <button
                          onClick={() => handleRemoveHeir(heir.id)}
                          aria-label={`Remove ${heir.name}`}
                          className="p-3 bg-red-900/50 hover:bg-red-900 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings Page (include Cancel Will) */}
          {currentView === "settings" && (
            <div className="space-y-8">
                <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-[#2a2a2a]">
                    <h3 className="text-2xl font-bold text-white mb-4">Administrare Contract</h3>
                    <p className="text-gray-400 mb-6">
                        Anularea testamentului returnează depozitul inițial și blochează executarea viitoare.
                    </p>
                    <button
                        onClick={handleCancelWill}
                        aria-label="Cancel Will and claim funds"
                        className="px-8 py-4 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                    >
                        <Trash2 className="w-6 h-6" />
                        Anulează Testamentul și Revendică Fondurile
                    </button>
                </div>
            </div>
          )}


          {/* Other pages */}
          {currentView === "assets" && (
            <div className="text-center py-20">
              <p className="text-3xl text-gray-400">Assets page - Coming soon</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}