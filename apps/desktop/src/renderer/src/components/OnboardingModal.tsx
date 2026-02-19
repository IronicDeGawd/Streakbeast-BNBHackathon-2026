/**
 * OnboardingModal — First-launch guide that walks users through setup.
 * Steps: Connect Wallet → Habits Overview → OpenClaw Setup → Link Accounts
 */
import React, { useState } from 'react';
import {
  HiWallet,
  HiFire,
  HiCpuChip,
  HiLink,
  HiCodeBracket,
  HiBookOpen,
  HiLanguage,
  HiStar,
  HiCheckCircle,
  HiArrowRight,
  HiArrowLeft,
} from 'react-icons/hi2';
import { LuDumbbell, LuBrain, LuActivity, LuGithub, LuGraduationCap } from 'react-icons/lu';
import { useWallet } from '../contexts/WalletContext';
import { useOpenClawStatus } from '../contexts/OpenClawContext';
import { useLinkedAccounts } from '../hooks/useLinkedAccounts';
import { cardBackground, cardBackdrop, typography, slideIn } from '../styles/theme';
import { CARD_SHADOW, FONT_HEADING, COLOR_PURPLE_ACCENT, EASE_SPRING } from '../utils/tokens';
import { abs } from '../utils/styles';

const TOTAL_STEPS = 4;

const HABITS = [
  { name: 'Coding', icon: <HiCodeBracket size={22} /> },
  { name: 'Exercise', icon: <LuDumbbell size={22} /> },
  { name: 'Reading', icon: <HiBookOpen size={22} /> },
  { name: 'Meditation', icon: <LuBrain size={22} /> },
  { name: 'Language', icon: <HiLanguage size={22} /> },
  { name: 'Custom', icon: <HiStar size={22} /> },
];

const ACCOUNTS = [
  { key: 'strava' as const, name: 'Strava', icon: <LuActivity size={20} color="#FC4C02" /> },
  { key: 'github' as const, name: 'GitHub', icon: <LuGithub size={20} color="#fff" /> },
  { key: 'duolingo' as const, name: 'Duolingo', icon: <LuGraduationCap size={20} color="#58CC02" /> },
];

interface OnboardingModalProps {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const { account, isConnected, connect } = useWallet();
  const { isConnected: openClawActive, checkStatus } = useOpenClawStatus();
  const { accounts, connect: connectAccount } = useLinkedAccounts();

  const next = () => step < TOTAL_STEPS - 1 ? setStep(step + 1) : onComplete();
  const back = () => step > 0 && setStep(step - 1);

  const shortenAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  /* ── Button style helpers ── */
  const primaryBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '14px 32px', borderRadius: 20, border: 'none',
    background: COLOR_PURPLE_ACCENT, color: '#fff',
    fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 16,
    cursor: 'pointer', transition: 'all 0.25s ease',
  };

  const secondaryBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '10px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
    fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 14,
    cursor: 'pointer', transition: 'all 0.2s ease',
  };

  const chipBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 20px', borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 14, color: '#fff',
    transition: 'all 0.2s ease',
  };

  /* ── Step renderers ── */
  function renderWelcome() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: slideIn(0.1) }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiWallet size={40} color={COLOR_PURPLE_ACCENT} />
        </div>
        <h2 style={{ ...typography.heading2, textAlign: 'center' }}>Welcome to StreakBeast</h2>
        <p style={{ fontFamily: FONT_HEADING, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6, maxWidth: 400, margin: 0 }}>
          Stake BNB on your daily habits, build streaks, and earn rewards. Let's get you set up in a few quick steps.
        </p>

        {isConnected && account ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 16, background: 'rgba(144,177,113,0.12)', border: '1px solid rgba(144,177,113,0.3)', animation: slideIn(0.2) }}>
            <HiCheckCircle size={22} color="#90B171" />
            <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#fff' }}>{shortenAddr(account)}</span>
          </div>
        ) : (
          <button
            onClick={() => connect()}
            style={primaryBtn}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <HiWallet size={20} /> Connect Wallet
          </button>
        )}
      </div>
    );
  }

  function renderHabits() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: slideIn(0.1) }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(250,164,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiFire size={40} color="#FAA448" />
        </div>
        <h2 style={{ ...typography.heading2, textAlign: 'center' }}>Your Habits</h2>
        <p style={{ fontFamily: FONT_HEADING, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6, maxWidth: 420, margin: 0 }}>
          Pick the habits you want to build. You'll stake BNB on them and check in daily to keep your streak alive.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 420 }}>
          {HABITS.map((h) => (
            <div key={h.name} style={chipBase}>
              {h.icon}
              <span>{h.name}</span>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: FONT_HEADING, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          You can stake on any habit from the Stake page
        </p>
      </div>
    );
  }

  function renderOpenClaw() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: slideIn(0.1) }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiCpuChip size={40} color={COLOR_PURPLE_ACCENT} />
        </div>
        <h2 style={{ ...typography.heading2, textAlign: 'center' }}>Set Up OpenClaw</h2>
        <p style={{ fontFamily: FONT_HEADING, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6, maxWidth: 420, margin: 0 }}>
          OpenClaw is your AI agent — it verifies your habits, coaches you, and manages streaks automatically.
        </p>

        <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'curl -fsSL https://openclaw.ai/install.sh | bash',
            'openclaw onboard --install-daemon',
          ].map((cmd) => (
            <div
              key={cmd}
              style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '10px 16px',
                fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.7)',
                userSelect: 'all' as const, wordBreak: 'break-all' as const,
              }}
            >
              $ {cmd}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: openClawActive ? '#90B171' : '#FF6B6B', transition: 'background 0.3s ease' }} />
          <span style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 14, color: openClawActive ? '#90B171' : 'rgba(255,255,255,0.5)' }}>
            {openClawActive ? 'Connected' : 'Not detected'}
          </span>
          {!openClawActive && (
            <button
              onClick={() => checkStatus()}
              style={{ ...secondaryBtn, padding: '6px 14px', fontSize: 12 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  function renderLinkAccounts() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: slideIn(0.1) }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(250,164,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiLink size={40} color="#FAA448" />
        </div>
        <h2 style={{ ...typography.heading2, textAlign: 'center' }}>Link Your Accounts</h2>
        <p style={{ fontFamily: FONT_HEADING, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6, maxWidth: 420, margin: 0 }}>
          Connect your accounts so OpenClaw can verify your daily activity automatically.
        </p>

        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ACCOUNTS.map((acc) => {
            const linked = accounts[acc.key];
            const isLinked = linked?.connected;
            return (
              <div
                key={acc.key}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>{acc.icon}</span>
                  <span style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 15, color: '#fff' }}>{acc.name}</span>
                  {isLinked && (
                    <span style={{ fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 12, color: 'rgba(144,177,113,0.8)' }}>
                      {linked.username || 'Connected'}
                    </span>
                  )}
                </div>
                {isLinked ? (
                  <HiCheckCircle size={22} color="#90B171" />
                ) : (
                  <button
                    onClick={() => connectAccount(acc.key)}
                    style={{ ...secondaryBtn, padding: '6px 16px', fontSize: 12 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const steps = [renderWelcome, renderHabits, renderOpenClaw, renderLinkAccounts];
  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
        animation: `onboardFadeIn 0.4s ${EASE_SPRING} both`,
      }}
    >
      <style>{`
        @keyframes onboardFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes onboardCardIn { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div
        style={{
          position: 'relative', width: 560, minHeight: 480,
          borderRadius: 55, overflow: 'hidden', boxShadow: CARD_SHADOW,
          animation: `onboardCardIn 0.5s ${EASE_SPRING} 0.1s both`,
        }}
      >
        {/* Card background layers */}
        <div style={abs({ inset: 0, ...cardBackground })} />
        <div style={abs({ inset: 0, ...cardBackdrop })} />

        {/* Glow orbs */}
        <div style={abs({ width: 200, height: 200, top: -40, left: -40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.25), transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none' })} />
        <div style={abs({ width: 180, height: 180, bottom: -30, right: -30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,164,72,.2), transparent 60%)', filter: 'blur(22px)', pointerEvents: 'none' })} />

        {/* Content */}
        <div style={{ position: 'relative', padding: '40px 48px 32px', display: 'flex', flexDirection: 'column', minHeight: 480 }}>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 28 : 8, height: 8, borderRadius: 4,
                  background: i === step ? COLOR_PURPLE_ACCENT : i < step ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.12)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Step content */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {steps[step]()}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
            {step > 0 ? (
              <button
                onClick={back}
                style={secondaryBtn}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                <HiArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!isLastStep && (
                <button
                  onClick={onComplete}
                  style={{ ...secondaryBtn, border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                >
                  Skip
                </button>
              )}
              <button
                onClick={next}
                style={primaryBtn}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {isLastStep ? 'Get Started' : 'Next'} <HiArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
