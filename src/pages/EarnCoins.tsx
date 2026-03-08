import { useState } from 'react';
import { Ticket, Gift, CheckCircle2, Lock, Trophy, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

/* ─── 4-day check-in cycle: 1 ticket on day 4 ─── */
const DAILY_REWARDS = [
  { day: 1, label: '—' },
  { day: 2, label: '—' },
  { day: 3, label: '—' },
  { day: 4, label: '1 Ticket', reward: true },
];

/* ─── Single mission ─── */
const MISSIONS = [
  {
    id: 1,
    icon: MessageSquare,
    title: 'Comment Streak',
    desc: 'Leave a comment for 3 days in a row',
    reward: '1 Ticket',
    progress: 1,
    total: 3,
    completed: false,
  },
];

export default function EarnCoins() {
  const [claimedDay, setClaimedDay] = useState(2); // mock: user claimed up to day 2

  const todayDay = claimedDay + 1;
  const canClaim = todayDay <= 4;

  const handleClaim = () => {
    if (canClaim) setClaimedDay(todayDay);
  };

  return (
    <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Earn Rewards</h1>
            <p className="text-sm text-muted-foreground">Complete tasks to earn free tickets</p>
          </div>
        </div>

        {/* Ticket balance */}
        <div className="flex items-center gap-2 rounded-full bg-card border border-border/60 px-4 py-2">
          <Ticket className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">3</span>
        </div>
      </div>

      {/* ──────── 4-Day Check-in ──────── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Daily Check-in</h2>
          <span className="text-xs text-muted-foreground ml-2">Day {Math.min(todayDay, 4)} / 4</span>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
            {DAILY_REWARDS.map((r) => {
              const claimed = r.day <= claimedDay;
              const isToday = r.day === todayDay;
              const locked = r.day > todayDay;

              return (
                <div
                  key={r.day}
                  className={`relative flex flex-col items-center rounded-xl p-3 sm:p-4 transition-all duration-200 ${
                    claimed
                      ? 'bg-primary/10 border border-primary/30'
                      : isToday
                      ? 'bg-accent border-2 border-primary shadow-md ring-2 ring-primary/20'
                      : 'bg-muted/40 border border-border/40 opacity-60'
                  }`}
                >
                  <span className="text-xs font-semibold text-muted-foreground mb-1.5">
                    Day {r.day}
                  </span>

                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-1.5 ${
                    claimed ? 'bg-primary/20' : isToday ? 'bg-primary/15' : 'bg-muted/60'
                  }`}>
                    {claimed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : locked ? (
                      <Lock className="w-4 h-4 text-muted-foreground/50" />
                    ) : r.reward ? (
                      <Ticket className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>

                  <span className={`text-xs font-medium ${
                    claimed ? 'text-primary' : isToday ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {r.label}
                  </span>

                  {r.reward && !claimed && (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                      REWARD
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {canClaim
                ? `Check in for Day ${todayDay}${todayDay === 4 ? ' to earn your ticket!' : ''}`
                : "Cycle complete! Resets tomorrow 🎉"}
            </p>
            <Button onClick={handleClaim} disabled={!canClaim} className="rounded-xl px-6 gap-2">
              <Gift className="w-4 h-4" />
              {canClaim ? 'Check In' : 'Completed'}
            </Button>
          </div>
        </div>
      </section>

      {/* ──────── Mission ──────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Mission</h2>
        </div>

        <div className="flex flex-col gap-3">
          {MISSIONS.map((mission) => {
            const pct = Math.round((mission.progress / mission.total) * 100);
            const done = mission.completed || mission.progress >= mission.total;

            return (
              <div
                key={mission.id}
                className={`rounded-2xl border bg-card p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 ${
                  done ? 'border-primary/30 bg-primary/[0.03]' : 'border-border/60'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  done ? 'bg-primary/15' : 'bg-muted/50'
                }`}>
                  <mission.icon className={`w-5 h-5 ${done ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`font-semibold text-sm ${done ? 'text-primary' : 'text-foreground'}`}>
                      {mission.title}
                    </h3>
                    {done && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{mission.desc}</p>
                  <div className="flex items-center gap-3">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium text-muted-foreground shrink-0">
                      {mission.progress}/{mission.total}
                    </span>
                  </div>
                </div>

                <div className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  done ? 'bg-primary/15 text-primary' : 'bg-muted/50 text-muted-foreground'
                }`}>
                  {mission.reward}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
