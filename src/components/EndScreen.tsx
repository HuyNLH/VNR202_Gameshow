/* =====================================================
   EndScreen.tsx — Màn hình kết thúc game + Bảng vinh danh
   Matching the provided mockup (podium, stats, ranking)
   ===================================================== */

import type { GameState } from '../types';
import { getGameStats } from '../utils/gameLogic';

interface EndScreenProps {
  state: GameState;
  onRestart: () => void;
}

export default function EndScreen({ state, onRestart }: EndScreenProps) {
  const { ranking, topStealer, topCorrect } = getGameStats(state);

  // Top 3 for podium
  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];

  return (
    <div className="relative min-h-screen bg-[#211111] text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #ea2a33 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ea2a33]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ea2a33]/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen px-6 py-4 lg:px-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-[#ea2a33]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#ea2a33] p-2 rounded-lg">
              <span className="material-symbols-outlined text-white text-2xl">account_balance</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Cướp hay Bỏ Vali – Lịch sử Đảng</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Kết Thúc Trận Đấu</p>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-12 gap-6 flex-grow items-stretch">
          {/* Left: Stats */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 flex-grow">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#ea2a33]">
                <span className="material-symbols-outlined">military_tech</span>
                Thống kê vinh danh
              </h3>
              <div className="space-y-6">
                {/* Vua Cướp */}
                {topStealer && topStealer.totalSteals > 0 && (
                  <div className="flex items-center gap-4 group">
                    <div className="size-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                      <span className="material-symbols-outlined text-3xl">swords</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Vua Cướp</p>
                      <p className="font-bold text-white">{topStealer.name}</p>
                      <p className="text-[10px] text-slate-500">Cướp {topStealer.totalSteals} lần</p>
                    </div>
                  </div>
                )}

                {/* Nhà Sử Học */}
                {topCorrect && topCorrect.correctAnswers > 0 && (
                  <div className="flex items-center gap-4 group">
                    <div className="size-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined text-3xl">auto_stories</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Nhà Sử Học</p>
                      <p className="font-bold text-white">{topCorrect.name}</p>
                      <p className="text-[10px] text-slate-500">{topCorrect.correctAnswers} câu trả lời đúng</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="p-4 bg-[#ea2a33]/5 rounded-lg">
                  <p className="text-xs text-center italic text-slate-400">
                    "Lịch sử là thầy dạy của cuộc sống."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Podium */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-end pb-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-[#ea2a33] uppercase tracking-tighter">Bảng Vinh Danh</h2>
              <p className="text-slate-400 mt-2">Chúc mừng các chiến sĩ xuất sắc nhất!</p>
            </div>

            <div className="flex items-end justify-center gap-2 sm:gap-4 h-full max-h-[400px]">
              {/* Rank 2 */}
              {second && (
                <div className="flex flex-col items-center w-1/3 max-w-[160px]">
                  <div className="mb-4 relative">
                    <div className="size-20 rounded-full border-4 border-slate-300 bg-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-slate-300">person</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-900 size-8 rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-bold text-sm truncate w-full">{second.name}</p>
                    <p className="text-[#ea2a33] text-xs font-bold">{second.score} điểm</p>
                  </div>
                  <div className="w-full h-32 bg-slate-400/20 backdrop-blur rounded-t-xl border-x border-t border-slate-400/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-4xl opacity-50">workspace_premium</span>
                  </div>
                </div>
              )}

              {/* Rank 1 */}
              {first && (
                <div className="flex flex-col items-center w-1/3 max-w-[200px]">
                  <div className="mb-6 relative">
                    <div className="size-28 rounded-full border-4 border-amber-400 bg-slate-700 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                      <span className="material-symbols-outlined text-6xl text-amber-400">person</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 size-10 rounded-full flex items-center justify-center font-black text-lg">
                      1
                    </div>
                    <span className="material-symbols-outlined absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400 text-4xl animate-bounce">
                      star
                    </span>
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-black text-lg truncate w-full">{first.name}</p>
                    <p className="text-[#ea2a33] text-sm font-bold">{first.score} điểm</p>
                  </div>
                  <div className="w-full h-48 bg-amber-500/20 backdrop-blur rounded-t-xl border-x border-t border-amber-500/40 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#ea2a33]/10 to-transparent"></div>
                    <span className="material-symbols-outlined text-amber-400 text-6xl opacity-60 relative z-10">trophy</span>
                  </div>
                </div>
              )}

              {/* Rank 3 */}
              {third && (
                <div className="flex flex-col items-center w-1/3 max-w-[160px]">
                  <div className="mb-4 relative">
                    <div className="size-20 rounded-full border-4 border-amber-700 bg-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-amber-700">person</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-amber-700 text-white size-8 rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <p className="font-bold text-sm truncate w-full">{third.name}</p>
                    <p className="text-[#ea2a33] text-xs font-bold">{third.score} điểm</p>
                  </div>
                  <div className="w-full h-24 bg-amber-800/20 backdrop-blur rounded-t-xl border-x border-t border-amber-800/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-800 text-4xl opacity-50">workspace_premium</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Full Ranking */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 h-full flex flex-col">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ea2a33]">format_list_numbered</span>
                Xếp hạng chi tiết
              </h3>
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {ranking.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-4">{idx + 1}</span>
                      <div>
                        <span className="text-sm font-medium">{player.name}</span>
                        <div className="flex gap-2 text-[10px] text-slate-500">
                          <span>Cướp: {player.totalSteals}</span>
                          <span>Đúng: {player.correctAnswers}/{player.totalAnswers}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#ea2a33]">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 py-6">
          <button
            className="group flex items-center justify-center gap-3 px-10 py-5 bg-[#ea2a33] text-white rounded-xl shadow-[0_10px_30px_rgba(234,42,51,0.3)] hover:scale-105 active:scale-95 transition-all"
            onClick={onRestart}
          >
            <span className="material-symbols-outlined text-2xl group-hover:rotate-180 transition-transform duration-500">replay</span>
            <span className="text-xl font-black uppercase tracking-widest">Chơi Lại</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
