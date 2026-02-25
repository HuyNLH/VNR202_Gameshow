/* =====================================================
   SetupScreen.tsx — Màn hình thiết lập game
   Matching the provided mockup design
   ===================================================== */

import { useState, type KeyboardEvent } from 'react';

interface SetupScreenProps {
  onStart: (playerNames: string[], tokens: number) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [players, setPlayers] = useState<string[]>([]);
  const [inputName, setInputName] = useState('');
  const [tokens, setTokens] = useState(3);
  const [error, setError] = useState('');

  const addPlayer = () => {
    const name = inputName.trim();
    if (!name) return;
    if (players.includes(name)) {
      setError('Tên người chơi đã tồn tại');
      return;
    }
    setPlayers([...players, name]);
    setInputName('');
    setError('');
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') addPlayer();
  };

  const handleStart = () => {
    if (players.length < 2) {
      setError('Cần ít nhất 2 người chơi');
      return;
    }
    onStart(players, tokens);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(234, 42, 51, 0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }}
    >
      {/* Header */}
      <header className="w-full px-8 py-6 flex items-center justify-between border-b border-[#ea2a33]/20 bg-[#211111]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-[#ea2a33] p-2 rounded-lg shadow-lg shadow-[#ea2a33]/20">
            <span className="material-symbols-outlined text-white text-3xl">menu_book</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            CƯỚP HAY BỎ VALI – <span className="text-[#ea2a33]">LỊCH SỬ ĐẢNG</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-widest text-[#ea2a33] font-bold">Phiên bản học tập</span>
            <span className="text-sm text-slate-400">Trò chơi giáo dục lịch sử Đảng</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
        {/* Left Panel: Player List */}
        <section className="col-span-4 flex flex-col gap-6 border border-[#ea2a33]/10 p-6 rounded-xl bg-[#211111]/80 backdrop-blur-lg">
          <div className="flex items-center gap-3 border-b border-[#ea2a33]/20 pb-4">
            <span className="material-symbols-outlined text-[#ea2a33] text-3xl">groups</span>
            <h2 className="text-xl font-bold uppercase tracking-wide text-white">Danh sách người chơi</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input
                className="w-full bg-[#211111]/50 border-2 border-[#ea2a33]/30 rounded-lg py-4 px-5 text-lg text-white placeholder:text-slate-500 transition-all focus:border-[#ea2a33] focus:outline-none"
                placeholder="Nhập tên sinh viên..."
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="absolute right-2 top-2 bottom-2 bg-[#ea2a33] hover:bg-[#ea2a33]/80 px-4 rounded-md text-white font-bold transition-colors"
                onClick={addPlayer}
              >
                THÊM
              </button>
            </div>
            {error && (
              <p className="text-[#ea2a33] text-sm font-bold">{error}</p>
            )}
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2">
              {players.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg group hover:border-[#ea2a33]/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="size-8 rounded-full bg-[#d4af37] text-[#211111] flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-lg font-medium text-white">{name}</span>
                  </div>
                  <button
                    className="text-slate-500 hover:text-[#ea2a33] transition-colors"
                    onClick={() => removePlayer(i)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
              {players.length === 0 && (
                <div className="flex items-center justify-center p-8 text-slate-500 italic">
                  Chưa có người chơi nào
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Middle Panel: Game Settings */}
        <section className="col-span-4 flex flex-col gap-6 border border-[#ea2a33]/10 p-6 rounded-xl bg-[#211111]/80 backdrop-blur-lg">
          <div className="flex items-center gap-3 border-b border-[#ea2a33]/20 pb-4">
            <span className="material-symbols-outlined text-[#ea2a33] text-3xl">tune</span>
            <h2 className="text-xl font-bold uppercase tracking-wide text-white">Thiết lập thông số</h2>
          </div>
          <div className="space-y-8 py-4">
            {/* Token Stepper */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37]">badge</span>
                <label className="text-lg font-medium text-white">Số lượt 'Cướp' mỗi người</label>
              </div>
              <div className="flex items-center justify-center gap-6 bg-[#211111]/40 p-6 rounded-xl border border-white/5 shadow-inner">
                <button
                  className="size-14 rounded-full border-2 border-[#ea2a33] text-[#ea2a33] hover:bg-[#ea2a33] hover:text-white transition-all flex items-center justify-center"
                  onClick={() => setTokens(Math.max(1, tokens - 1))}
                >
                  <span className="material-symbols-outlined text-3xl font-bold">remove</span>
                </button>
                <span className="text-6xl font-black text-white min-w-[80px] text-center">{tokens}</span>
                <button
                  className="size-14 rounded-full border-2 border-[#ea2a33] text-[#ea2a33] hover:bg-[#ea2a33] hover:text-white transition-all flex items-center justify-center"
                  onClick={() => setTokens(Math.min(10, tokens + 1))}
                >
                  <span className="material-symbols-outlined text-3xl font-bold">add</span>
                </button>
              </div>
            </div>

            {/* Game Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d4af37]">work</span>
                <label className="text-lg font-medium text-white">Số lượng Vali</label>
              </div>
              <div className="flex justify-center items-center bg-white/5 p-4 rounded-lg">
                <span className="text-4xl font-black text-[#d4af37]">20 VALI</span>
              </div>
              <p className="text-slate-400 text-sm text-center">12 câu hỏi • 3 phạt • 2 thử thách • 2 đặc quyền • 1 twist</p>
            </div>
          </div>
        </section>

        {/* Right Panel: Rules */}
        <section className="col-span-4 flex flex-col gap-6 border border-[#ea2a33]/10 p-6 rounded-xl bg-[#211111]/80 backdrop-blur-lg overflow-hidden relative">
          <div className="flex items-center gap-3 border-b border-[#ea2a33]/20 pb-4">
            <span className="material-symbols-outlined text-[#ea2a33] text-3xl">info</span>
            <h2 className="text-xl font-bold uppercase tracking-wide text-white">Quy tắc & Tư liệu</h2>
          </div>
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="space-y-6">
              <div className="bg-[#211111]/60 p-5 rounded-lg border-l-4 border-[#d4af37] italic relative">
                <span className="material-symbols-outlined absolute -top-3 -left-3 text-[#d4af37]/30 text-5xl">format_quote</span>
                <p className="text-slate-200 text-lg leading-relaxed">
                  "Đảng muốn vững thì phải có chủ nghĩa làm cốt, trong Đảng ai cũng phải hiểu, ai cũng phải theo chủ nghĩa ấy..."
                </p>
                <p className="mt-3 text-[#d4af37] text-right font-bold">— Hồ Chí Minh</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-[#ea2a33] font-bold uppercase text-sm tracking-widest">Tóm tắt luật chơi</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-slate-300">
                    <span className="material-symbols-outlined text-[#d4af37] text-sm">circle</span>
                    <span>P1 chọn phong bì, P2 quyết định Cướp hoặc Bỏ.</span>
                  </li>
                  <li className="flex gap-3 text-slate-300">
                    <span className="material-symbols-outlined text-[#d4af37] text-sm">circle</span>
                    <span>Cướp tốn 1 token và bị -2 điểm phí cướp.</span>
                  </li>
                  <li className="flex gap-3 text-slate-300">
                    <span className="material-symbols-outlined text-[#d4af37] text-sm">circle</span>
                    <span>Không được cướp quá 2 lượt liên tiếp.</span>
                  </li>
                  <li className="flex gap-3 text-slate-300">
                    <span className="material-symbols-outlined text-[#d4af37] text-sm">circle</span>
                    <span>Cướp vali câu hỏi & sai → phạt thêm -3 điểm.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center gap-4">
              <span className="material-symbols-outlined text-[#d4af37] text-3xl">verified</span>
              <p className="text-sm text-[#d4af37]/90 leading-tight font-medium">Trò chơi giáo dục phục vụ học tập Lịch sử Đảng.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full p-8 flex justify-center bg-gradient-to-t from-[#211111] via-[#211111]/90 to-transparent">
        <button
          className="group relative flex items-center justify-center gap-4 px-16 py-6 bg-[#ea2a33] rounded-xl border-2 border-[#d4af37] shadow-[0_0_40px_rgba(234,42,51,0.4)] hover:shadow-[0_0_60px_rgba(212,175,55,0.4)] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleStart}
          disabled={players.length < 2}
        >
          <span className="text-3xl font-black text-white tracking-[0.2em] uppercase">BẮT ĐẦU GAME</span>
          <span className="material-symbols-outlined text-3xl text-[#d4af37] group-hover:translate-x-2 transition-transform">play_circle</span>
          {/* Decorative Corners */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#d4af37]"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#d4af37]"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#d4af37]"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#d4af37]"></div>
        </button>
      </footer>

      {/* Decorative BG */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-20">
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-[#ea2a33]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 left-[-10%] w-[500px] h-[500px] bg-[#d4af37]/10 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
