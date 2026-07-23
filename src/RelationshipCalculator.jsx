import React, { useState, useRef, useEffect } from 'react';

// ============================================================
// RELATIONSHIP CALCULATOR — website standalone version
// ============================================================
// Adapted from the app's RelationshipPicker.jsx, but built for the
// public website: no login, no saved Contacts — just two plain
// name + birth-date inputs. Uses the same calculateCombinedKin()
// math already locked in kinLogic.js (sums both individual Kins,
// wraps at 260) and the same OracleDisplay / InfoCard / ChartDiagram
// components as the personal calculator, so the two pages feel
// identical in style.
//
// CONTENT: uses relationshipInfoContent.js, which is currently a
// placeholder (re-exports personInfoContent). Swap that one file
// once Ruby's relationship-framed copy is ready — nothing here
// needs to change.
// ============================================================

import {
  calculateCombinedKin, toneSealTitle,
} from './lib/kinLogic';
import OracleDisplay from './OracleDisplay';
import ChartDiagram from './ChartDiagram';
import InfoCard from './InfoCard';
import {
  POSITION_INFO as RELATIONSHIP_POSITION_INFO,
  SEAL_POSITION_TEXT as RELATIONSHIP_SEAL_POSITION_TEXT,
} from './lib/relationshipInfoContent';

const COLORS = {
  crimson: '#8B0000',
  cobalt: '#1B2A8A',
  amber: '#D4A017',
  cream: '#F5F0E4',
  jungle: '#2C4A2E',
};

// Matches OracleDisplay's own already-tested wrap breakpoint (previously
// applied via window.matchMedia at 700/701px). Measured against this
// component's own rendered width rather than the browser viewport —
// the Squarespace page template narrows the content column well below
// the full browser width, so viewport-based detection (InfoCard's old
// default) picks the wrong layout on desktop browsers. See the note in
// InfoCard.jsx for the full explanation. (An earlier version of this
// used 620px, calculated naively from raw flex-basis values — that
// ignored the cross-grid's real minimum content size and under-fired.)
const DESKTOP_CONTAINER_THRESHOLD = 701;

export default function RelationshipCalculator() {
  const [nameA, setNameA] = useState('');
  const [dateA, setDateA] = useState('1990-01-01');
  const [nameB, setNameB] = useState('');
  const [dateB, setDateB] = useState('1990-01-01');

  const [result, setResult] = useState(null); // combined kin result | null
  const [names, setNames] = useState(['', '']); // captured at calculate-time
  const [infoCard, setInfoCard] = useState(null); // { key, seal } | null

  // Measures the wrapper div's own rendered width (not the viewport) so
  // the Info Card's desktop/mobile split always agrees with whatever
  // width OracleDisplay actually has to work with.
  const wrapperRef = useRef(null);
  const [isDesktopCard, setIsDesktopCard] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setIsDesktopCard(width >= DESKTOP_CONTAINER_THRESHOLD);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCalculate = () => {
    const combined = calculateCombinedKin([dateA, dateB]);
    setResult(combined);
    setNames([nameA.trim() || 'Person A', nameB.trim() || 'Person B']);
  };

  const inputStyle = {
    width: '100%',
    maxWidth: 280,
    padding: '12px 16px',
    fontSize: 15,
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    border: 'none',
    borderBottom: `1px solid #1a171444`,
    background: 'transparent',
    marginBottom: 16,
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#8a8076',
    marginBottom: 6,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  };

  return (
    <div style={{
      fontFamily: "'Cormorant Garamond', 'Georgia', serif",
      background: COLORS.cream,
      minHeight: '100vh',
      padding: '40px 24px 24px',
      color: '#1a1714',
    }}>
      <div ref={wrapperRef} style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
        {!result && (
          <div style={{ textAlign: 'center', maxWidth: 480, margin: '40px auto' }}>
            <h1 style={{
              fontSize: 40,
              fontWeight: 400,
              letterSpacing: '0.01em',
              marginBottom: 24,
              lineHeight: 1.15,
            }}>
              See what your energies<br />create together.
            </h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontSize: 15,
              color: '#1a1714',
              marginBottom: 32,
            }}>
              Enter both birth dates to reveal your Combined Kin.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 28,
              marginBottom: 24,
            }}>
              <div style={{ width: '100%', maxWidth: 280 }}>
                <div style={labelStyle}>Person One</div>
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="date"
                  value={dateA}
                  onChange={(e) => setDateA(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
              </div>

              <div style={{ width: '100%', maxWidth: 280 }}>
                <div style={labelStyle}>Person Two</div>
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="date"
                  value={dateB}
                  onChange={(e) => setDateB(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0 }}
                />
              </div>
            </div>

            <div>
              <button
                onClick={handleCalculate}
                style={{
                  padding: '16px 40px',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                  background: '#1a1714',
                  color: COLORS.cream,
                  border: 'none',
                  borderRadius: 999,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Reveal Combined Kin
              </button>
            </div>
          </div>
        )}

        {/* RESULT — same cross layout as the personal calculator */}
        {result && (
          <OracleDisplay
            kin={result.kin}
            seal={result.seal}
            tone={result.tone}
            oracle={result.oracle}
            wavespell={result.wavespell}
            chart={result.chart}
            dailyMode
            onPositionSelect={(key, tappedSeal) => setInfoCard({ key, seal: tappedSeal })}
            headerLeft={
              <div>
                <div style={{
                  fontSize: 13,
                  color: '#8a8076',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 6,
                }}>
                  {names[0]} + {names[1]}
                </div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#1a1714',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                  marginBottom: 4,
                }}>
                  Combined Kin {result.kin}
                </div>
                <h2 style={{
                  fontSize: 32,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  fontFamily: "'IM Fell English', 'Cormorant Garamond', 'Georgia', serif",
                  color: '#1a1714',
                  lineHeight: 1.1,
                }}>
                  {toneSealTitle(result.tone.name, result.seal.name)}
                </h2>
              </div>
            }
          />
        )}

        {infoCard && (
          <InfoCard
            positionKey={infoCard.key}
            seal={infoCard.seal}
            onClose={() => setInfoCard(null)}
            positionInfo={RELATIONSHIP_POSITION_INFO}
            sealPositionText={RELATIONSHIP_SEAL_POSITION_TEXT}
            contextLabel="Your Combined Chart"
            isDesktop={isDesktopCard}
          />
        )}

        {result && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <h2 style={{
              fontFamily: "'IM Fell English', 'Cormorant Garamond', 'Georgia', serif",
              fontStyle: 'italic', fontWeight: 400, fontSize: 22, marginBottom: 10,
              color: '#1a1714', textAlign: 'center',
            }}>
              How To Read Your Combined Chart
            </h2>
            <p style={{
              fontSize: 14, lineHeight: 1.6, color: '#1a1714', textAlign: 'center',
              maxWidth: 420, margin: '0 auto 8px', fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            }}>
              This chart belongs to the relationship itself, not either person alone. Both
              Kins are combined into one new archetype — these positions describe how that
              combined energy behaves, supports itself and grows.
            </p>
            <ChartDiagram birthKinLabel="Combined Kin" />
          </div>
        )}

        {result && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => { setResult(null); setInfoCard(null); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#8a8076',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Calculate a different pair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
