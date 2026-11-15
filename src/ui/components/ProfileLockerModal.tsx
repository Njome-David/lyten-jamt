'use client';

// src/ui/components/ProfileLockerModal.tsx
// Modal for viewing player profile, editing codename, inspecting NASA badges, and selecting unlocked avatars.
// Implements design specifications (DESIGN.md sections 3 & 4).

import React, { useState } from 'react';
import { BADGES, type BadgeDef } from '../../content/badges';
import type { SaveProfile, SaveV1 } from '../../engine/types';
import { getNextRank, getRankForXp } from '../../progress/ranks';

export interface ProfileLockerModalProps {
  save: SaveV1;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (patch: Partial<SaveProfile>) => void;
}

export function ProfileLockerModal({ save, isOpen, onClose, onUpdateProfile }: ProfileLockerModalProps) {
  const [codenameInput, setCodenameInput] = useState(save.profile.codename);
  const [isEditingCodename, setIsEditingCodename] = useState(false);

  if (!isOpen) return null;

  const rank = getRankForXp(save.xp);
  const nextRank = getNextRank(rank.id);
  const unlockedBadges = new Set(save.badges);

  // Helper: avatar is unlocked if it is the default or tied to an unlocked badge.
  const isAvatarUnlocked = (avatarId: string) => {
    if (avatarId === 'avatar-1' || avatarId === 'default') return true;
    const badge = Object.values(BADGES).find((b: BadgeDef) => b.unlockedAvatarId === avatarId);
    return badge ? unlockedBadges.has(badge.id) : false;
  };

  const handleSaveCodename = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codenameInput.trim() || 'Cmdr. Nova';
    onUpdateProfile({ codename: clean });
    setIsEditingCodename(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="locker-modal-title"
      data-testid="profile-locker-modal"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 7, 13, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--surface, #0f172a)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.15))',
          borderRadius: 'var(--radius-lg, 20px)',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🧑‍🚀</span>
            <div>
              <h2
                id="locker-modal-title"
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Astronaut Locker & NASA Badges
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--ink-dim)' }}>
                Track your career, unlocked NASA badges, and official flight portraits.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile modal"
            data-testid="btn-close-locker"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-dim)',
              fontSize: '24px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '6px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Profile Overview & Rank */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '20px',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius, 12px)',
              padding: '18px',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent, #60a5fa), #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                boxShadow: '0 0 20px rgba(96, 165, 250, 0.35)',
              }}
            >
              🧑‍🚀
            </div>

            {/* Codename & Rank Info */}
            <div>
              {isEditingCodename ? (
                <form
                  onSubmit={handleSaveCodename}
                  style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}
                >
                  <input
                    type="text"
                    value={codenameInput}
                    onChange={(e) => setCodenameInput(e.target.value)}
                    maxLength={24}
                    autoFocus
                    data-testid="input-codename"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--accent)',
                      borderRadius: '6px',
                      color: 'var(--ink)',
                      padding: '6px 10px',
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  />
                  <button
                    type="submit"
                    data-testid="btn-save-codename"
                    style={{
                      background: 'var(--power)',
                      color: '#05070d',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span
                    data-testid="profile-codename"
                    style={{ fontSize: '20px', fontWeight: 800 }}
                  >
                    {save.profile.codename}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingCodename(true)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: 'var(--ink-dim)',
                      fontSize: '11px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                    }}
                  >
                    ✏️ Edit
                  </button>
                </div>
              )}

              {/* Rank & XP */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '14px', alignItems: 'center' }}>
                <span
                  data-testid="profile-rank"
                  style={{ color: 'var(--power)', fontWeight: 800 }}
                >
                  🎖️ {rank.title}
                </span>
                <span style={{ color: 'var(--ink-dim)' }}>•</span>
                <span data-testid="profile-xp" style={{ fontWeight: 700 }}>
                  {save.xp} XP
                </span>
                <span style={{ color: 'var(--ink-dim)' }}>•</span>
                <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
                  🔥 {save.streak.count}d Streak
                </span>
                <span style={{ color: 'var(--ink-dim)' }}>•</span>
                <span style={{ fontSize: '12px', color: save.streak.jokerReady ? 'var(--success)' : 'var(--ink-muted)' }}>
                  {save.streak.jokerReady ? '🛡️ Joker Shield Ready' : '⏳ Joker Recharging'}
                </span>
              </div>

              {nextRank && (
                <div style={{ fontSize: '12px', color: 'var(--ink-dim)', marginTop: '6px' }}>
                  Next rank: <strong style={{ color: 'var(--ink)' }}>{nextRank.title}</strong> at {nextRank.minXp} XP ({nextRank.minXp - save.xp} XP remaining)
                </div>
              )}
            </div>
          </div>

          {/* Badges & Avatars */}
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 800,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>NASA Astronaut Badges (5)</span>
              <span style={{ fontSize: '12px', color: 'var(--ink-dim)', fontWeight: 400 }}>
                — Unlocks official NASA portrait avatars
              </span>
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
              }}
            >
              {Object.values(BADGES).map((badge: BadgeDef) => {
                const isUnlocked = unlockedBadges.has(badge.id);
                const isCurrentAvatar = save.profile.avatarId === badge.unlockedAvatarId;
                const canSelectAvatar = isAvatarUnlocked(badge.unlockedAvatarId);

                return (
                  <div
                    key={badge.id}
                    data-testid={`badge-card-${badge.id}`}
                    style={{
                      background: isUnlocked ? 'rgba(79, 216, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isUnlocked ? 'var(--accent, #4fd8ff)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: 'var(--radius, 12px)',
                      padding: '14px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      opacity: isUnlocked ? 1 : 0.65,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '28px',
                        padding: '8px',
                        borderRadius: '8px',
                        background: isUnlocked ? 'rgba(79, 216, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {'🏅'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '14px' }}>{badge.name}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isUnlocked ? 'var(--success, #10b981)' : 'rgba(255, 255, 255, 0.1)',
                            color: isUnlocked ? '#020617' : 'var(--ink-dim)',
                          }}
                        >
                          {isUnlocked ? 'UNLOCKED' : 'LOCKED 🔒'}
                        </span>
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--ink-dim)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                        {badge.conditionDescription}
                      </p>

                      {/* Avatar Action */}
                      {canSelectAvatar && (
                        <button
                          type="button"
                          onClick={() => onUpdateProfile({ avatarId: badge.unlockedAvatarId })}
                          data-testid={`btn-select-avatar-${badge.unlockedAvatarId}`}
                          style={{
                            background: isCurrentAvatar ? 'var(--accent)' : 'transparent',
                            color: isCurrentAvatar ? '#020617' : 'var(--accent)',
                            border: '1px solid var(--accent)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {isCurrentAvatar ? '✓ Active Avatar' : 'Select Avatar'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Statistics */}
          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              textAlign: 'center',
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>Played</div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{save.stats.missionsPlayed ?? 0}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>Victories</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)' }}>{save.stats.missionsWon ?? 0}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>Win Streak</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--power)' }}>{save.stats.winStreak ?? 0}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--ink-dim)' }}>Pressure Wins</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--air)' }}>{save.stats.pressureWinsClean ?? 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
