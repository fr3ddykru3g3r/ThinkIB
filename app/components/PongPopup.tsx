'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Gamepad2, X, Trophy, RotateCcw } from 'lucide-react';

type GameMode = 'dino' | 'tetris' | 'pong';

export default function ArcadeSuitePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameMode>('dino');

  // Common UI state
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Pong specific
  const [pongScore, setPongScore] = useState({ player: 0, ai: 0 });
  const [pongDifficulty, setPongDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [pongControl, setPongControl] = useState<'wasd' | 'mouse'>('wasd');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // ----------------------------------------------------
  // GAME 1: REAL GOOGLE CHROME DINO GAME (Smooth Physics & Canvas)
  // ----------------------------------------------------
  const dinoState = useRef({
    x: 35,
    y: 155,
    vy: 0,
    width: 20,
    height: 24,
    isJumping: false,
    gravity: 0.62,
    jumpForce: -10.8,
    groundY: 155,
    obstacles: [] as { x: number; width: number; height: number; speed: number }[],
    cactiTimer: 0,
    gameSpeed: 3.4,
    legFrame: 0,
    scoreTimer: 0
  });

  const resetDinoGame = () => {
    dinoState.current = {
      x: 35,
      y: 155,
      vy: 0,
      width: 20,
      height: 24,
      isJumping: false,
      gravity: 0.62,
      jumpForce: -10.8,
      groundY: 155,
      obstacles: [],
      cactiTimer: 0,
      gameSpeed: 3.4,
      legFrame: 0,
      scoreTimer: 0
    };
  };

  const jumpDino = () => {
    const s = dinoState.current;
    if (!s.isJumping) {
      s.vy = s.jumpForce;
      s.isJumping = true;
    }
  };

  // ----------------------------------------------------
  // GAME 2: POLISHED TETRIS (Standard 10x20 Grid & Rotation)
  // ----------------------------------------------------
  const TETRIS_SHAPES = [
    { shape: [[1, 1, 1, 1]], color: '#38bdf8' }, // I
    { shape: [[1, 1], [1, 1]], color: '#facc15' }, // O
    { shape: [[0, 1, 0], [1, 1, 1]], color: '#c084fc' }, // T
    { shape: [[1, 0, 0], [1, 1, 1]], color: '#60a5fa' }, // L
    { shape: [[0, 0, 1], [1, 1, 1]], color: '#fb923c' }, // J
    { shape: [[0, 1, 1], [1, 0, 0]], color: '#4ade80' }, // S
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#f87171' }  // Z
  ];

  const tetrisState = useRef({
    grid: Array.from({ length: 20 }, () => Array(10).fill(0)),
    piece: null as { shape: number[][]; color: string; x: number; y: number } | null,
    dropTimer: 0,
    dropInterval: 380
  });

  const resetTetrisGame = () => {
    tetrisState.current.grid = Array.from({ length: 20 }, () => Array(10).fill(0));
    tetrisState.current.dropTimer = 0;
    spawnTetrisPiece();
  };

  const spawnTetrisPiece = () => {
    const template = TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)];
    tetrisState.current.piece = {
      shape: template.shape,
      color: template.color,
      x: 3,
      y: 0
    };
    if (checkTetrisCollision(0, 0)) {
      setGameOver(true);
    }
  };

  const checkTetrisCollision = (offsetX: number, offsetY: number, customShape?: number[][]) => {
    const p = tetrisState.current.piece;
    if (!p) return false;
    const shape = customShape || p.shape;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const nx = p.x + c + offsetX;
          const ny = p.y + r + offsetY;
          if (nx < 0 || nx >= 10 || ny >= 20) return true;
          if (ny >= 0 && tetrisState.current.grid[ny][nx]) return true;
        }
      }
    }
    return false;
  };

  const rotateTetrisPiece = () => {
    const p = tetrisState.current.piece;
    if (!p) return;
    const rotated = p.shape[0].map((_, idx) => p.shape.map(row => row[idx]).reverse());
    if (!checkTetrisCollision(0, 0, rotated)) {
      p.shape = rotated;
    }
  };

  const lockTetrisPiece = () => {
    const p = tetrisState.current.piece;
    if (!p) return;
    p.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val && p.y + r >= 0) {
          tetrisState.current.grid[p.y + r][p.x + c] = 1;
        }
      });
    });

    // Clear completed rows
    let cleared = 0;
    for (let r = 19; r >= 0; r--) {
      if (tetrisState.current.grid[r].every(v => v === 1)) {
        tetrisState.current.grid.splice(r, 1);
        tetrisState.current.grid.unshift(Array(10).fill(0));
        cleared++;
        r++;
      }
    }

    if (cleared > 0) {
      setScore(prev => {
        const next = prev + cleared * 100;
        setHighScore(h => Math.max(h, next));
        return next;
      });
    }
    spawnTetrisPiece();
  };

  // ----------------------------------------------------
  // GAME 3: ARCADE PONG
  // ----------------------------------------------------
  const pongState = useRef({
    ballX: 160,
    ballY: 110,
    ballSpeedX: 2.5,
    ballSpeedY: 1.5,
    playerY: 85,
    aiY: 85,
    paddleHeight: 50,
    paddleWidth: 6,
    canvasWidth: 320,
    canvasHeight: 220
  });

  const resetPongBall = (winner: 'player' | 'ai') => {
    const base = pongDifficulty === 'easy' ? 2.2 : pongDifficulty === 'medium' ? 2.8 : 3.4;
    pongState.current.ballX = 160;
    pongState.current.ballY = 110;
    pongState.current.ballSpeedX = winner === 'player' ? -base : base;
    pongState.current.ballSpeedY = (Math.random() - 0.5) * (base * 0.9);
  };

  // Switch Game Helper
  const restartCurrentGame = () => {
    setGameOver(false);
    setScore(0);

    if (activeGame === 'dino') {
      resetDinoGame();
    } else if (activeGame === 'tetris') {
      resetTetrisGame();
    } else if (activeGame === 'pong') {
      setPongScore({ player: 0, ai: 0 });
      resetPongBall('player');
    }
  };

  useEffect(() => {
    restartCurrentGame();
  }, [activeGame, pongDifficulty]);

  // Unified Render & Physics Animation Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (activeGame === 'pong' && pongControl === 'mouse') {
        const rect = canvas.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        pongState.current.playerY = Math.max(
          0,
          Math.min(pongState.current.canvasHeight - pongState.current.paddleHeight, relativeY - pongState.current.paddleHeight / 2)
        );
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;

      if (activeGame === 'dino') {
        if (k === ' ' || k === 'arrowup' || k === 'w') {
          e.preventDefault();
          jumpDino();
        }
      } else if (activeGame === 'tetris') {
        if (k === 'arrowleft' || k === 'a') {
          e.preventDefault();
          if (!checkTetrisCollision(-1, 0)) tetrisState.current.piece!.x--;
        } else if (k === 'arrowright' || k === 'd') {
          e.preventDefault();
          if (!checkTetrisCollision(1, 0)) tetrisState.current.piece!.x++;
        } else if (k === 'arrowdown' || k === 's') {
          e.preventDefault();
          if (!checkTetrisCollision(0, 1)) tetrisState.current.piece!.y++;
        } else if (k === 'arrowup' || k === 'w') {
          e.preventDefault();
          rotateTetrisPiece();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastTime = performance.now();

    const mainLoop = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      // Dark editorial canvas background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 320, 220);

      if (!gameOver) {
        // ==========================================
        // 1. CHROME DINO RUNNER PHYSICS & DRAWING
        // ==========================================
        if (activeGame === 'dino') {
          const s = dinoState.current;

          // Apply Gravity
          s.vy += s.gravity;
          s.y += s.vy;

          if (s.y >= s.groundY) {
            s.y = s.groundY;
            s.vy = 0;
            s.isJumping = false;
          }

          // Leg Animation Frame
          s.legFrame += 0.2;

          // Increment Score
          s.scoreTimer++;
          if (s.scoreTimer % 6 === 0) {
            setScore(prev => {
              const next = prev + 1;
              setHighScore(h => Math.max(h, next));
              return next;
            });
          }

          // Spawn Obstacles
          s.cactiTimer++;
          if (s.cactiTimer > 85 - Math.min(30, Math.floor(score / 50))) {
            const h = 20 + Math.floor(Math.random() * 14);
            const w = 12 + Math.floor(Math.random() * 8);
            s.obstacles.push({ x: 320, width: w, height: h, speed: s.gameSpeed + Math.min(2.5, score / 200) });
            s.cactiTimer = 0;
          }

          // Move & Render Obstacles
          s.obstacles.forEach(obs => {
            obs.x -= obs.speed;

            // Cactus Body
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(obs.x, 178 - obs.height, obs.width, obs.height);
            // Cactus Arms
            ctx.fillRect(obs.x - 3, 178 - obs.height + 6, 3, 6);
            ctx.fillRect(obs.x + obs.width, 178 - obs.height + 4, 3, 6);

            // AABB Collision Box
            if (s.x + s.width - 4 > obs.x && s.x + 4 < obs.x + obs.width) {
              if (s.y + s.height > 178 - obs.height + 2) {
                setGameOver(true);
              }
            }
          });

          // Clean offscreen cacti
          s.obstacles = s.obstacles.filter(o => o.x > -30);

          // Draw Horizon Ground Line
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, 179);
          ctx.lineTo(320, 179);
          ctx.stroke();

          // Draw Chrome T-Rex Sprite (Vector Canvas Pixel-Art Body)
          ctx.fillStyle = '#10b981';
          // Head & Eye
          ctx.fillRect(s.x + 6, s.y, 14, 8);
          ctx.fillStyle = '#090d16';
          ctx.fillRect(s.x + 15, s.y + 2, 2, 2);
          ctx.fillStyle = '#10b981';
          // Body & Tail
          ctx.fillRect(s.x, s.y + 8, 16, 10);
          ctx.fillRect(s.x - 4, s.y + 6, 4, 4); // tail
          ctx.fillRect(s.x + 12, s.y + 10, 4, 2); // arm

          // Animated Running Legs
          const isLeft = Math.floor(s.legFrame) % 2 === 0;
          ctx.fillRect(s.x + 3, s.y + 18, 3, s.isJumping ? 4 : isLeft ? 6 : 2);
          ctx.fillRect(s.x + 10, s.y + 18, 3, s.isJumping ? 4 : isLeft ? 2 : 6);
        }

        // ==========================================
        // 2. TETRIS GAME LOGIC & DRAWING
        // ==========================================
        else if (activeGame === 'tetris') {
          const ts = tetrisState.current;
          ts.dropTimer += delta;

          if (ts.dropTimer > ts.dropInterval) {
            if (!checkTetrisCollision(0, 1)) {
              ts.piece!.y++;
            } else {
              lockTetrisPiece();
            }
            ts.dropTimer = 0;
          }

          // Draw Matrix Board Grid
          const cellSize = 10;
          const startX = 110;
          const startY = 10;

          ctx.strokeStyle = '#1e293b';
          for (let r = 0; r < 20; r++) {
            for (let c = 0; c < 10; c++) {
              ctx.strokeRect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
              if (ts.grid[r][c]) {
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(startX + c * cellSize + 1, startY + r * cellSize + 1, cellSize - 2, cellSize - 2);
              }
            }
          }

          // Draw Falling Block Piece
          if (ts.piece) {
            ctx.fillStyle = ts.piece.color;
            ts.piece.shape.forEach((row, r) => {
              row.forEach((val, c) => {
                if (val) {
                  ctx.fillRect(
                    startX + (ts.piece!.x + c) * cellSize + 1,
                    startY + (ts.piece!.y + r) * cellSize + 1,
                    cellSize - 2,
                    cellSize - 2
                  );
                }
              });
            });
          }
        }

        // ==========================================
        // 3. PONG GAME LOGIC & DRAWING
        // ==========================================
        else if (activeGame === 'pong') {
          const ps = pongState.current;
          const aiSpeed = pongDifficulty === 'easy' ? 1.1 : pongDifficulty === 'medium' ? 1.8 : 2.7;

          if (pongControl === 'wasd') {
            if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
              ps.playerY = Math.max(0, ps.playerY - 4.5);
            }
            if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
              ps.playerY = Math.min(ps.canvasHeight - ps.paddleHeight, ps.playerY + 4.5);
            }
          }

          // Ball Motion
          ps.ballX += ps.ballSpeedX;
          ps.ballY += ps.ballSpeedY;

          // Wall Collisions
          if (ps.ballY <= 6) {
            ps.ballY = 6;
            ps.ballSpeedY = Math.abs(ps.ballSpeedY);
          } else if (ps.ballY >= ps.canvasHeight - 6) {
            ps.ballY = ps.canvasHeight - 6;
            ps.ballSpeedY = -Math.abs(ps.ballSpeedY);
          }

          // AI Tracking
          const aiCenter = ps.aiY + ps.paddleHeight / 2;
          if (aiCenter < ps.ballY - 8) ps.aiY += aiSpeed;
          else if (aiCenter > ps.ballY + 8) ps.aiY -= aiSpeed;
          ps.aiY = Math.max(0, Math.min(ps.canvasHeight - ps.paddleHeight, ps.aiY));

          // Player Bounce
          if (ps.ballX <= ps.paddleWidth + 8 && ps.ballX >= 2) {
            if (ps.ballY >= ps.playerY - 4 && ps.ballY <= ps.playerY + ps.paddleHeight + 4) {
              ps.ballX = ps.paddleWidth + 9;
              ps.ballSpeedX = Math.min(5.5, Math.abs(ps.ballSpeedX) * 1.03);
              ps.ballSpeedY = (ps.ballY - (ps.playerY + ps.paddleHeight / 2)) * 0.14;
            }
          } else if (ps.ballX < -10) {
            setPongScore(prev => {
              const n = prev.ai + 1;
              if (n >= 5) setGameOver(true);
              return { ...prev, ai: n };
            });
            resetPongBall('ai');
          }

          // AI Bounce
          const aiLeft = ps.canvasWidth - ps.paddleWidth - 8;
          if (ps.ballX >= aiLeft && ps.ballX <= ps.canvasWidth - 2) {
            if (ps.ballY >= ps.aiY - 4 && ps.ballY <= ps.aiY + ps.paddleHeight + 4) {
              ps.ballX = aiLeft - 1;
              ps.ballSpeedX = -Math.min(5.5, Math.abs(ps.ballSpeedX) * 1.03);
              ps.ballSpeedY = (ps.ballY - (ps.aiY + ps.paddleHeight / 2)) * 0.14;
            }
          } else if (ps.ballX > ps.canvasWidth + 10) {
            setPongScore(prev => {
              const n = prev.player + 1;
              if (n >= 5) setGameOver(true);
              return { ...prev, player: n };
            });
            resetPongBall('player');
          }

          // Render Net, Paddles & Ball
          ctx.strokeStyle = '#1e293b';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(160, 0);
          ctx.lineTo(160, 220);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(8, ps.playerY, ps.paddleWidth, ps.paddleHeight);
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(320 - ps.paddleWidth - 8, ps.aiY, ps.paddleWidth, ps.paddleHeight);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ps.ballX, ps.ballY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(mainLoop);
    };

    animRef.current = requestAnimationFrame(mainLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen, activeGame, gameOver, score, pongDifficulty, pongControl]);

  return (
    <>
      {/* Header Inline Mini Action Trigger */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        title="Arcade Mini-Games Collection"
        style={{
          background: 'var(--panel-light)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '4px 10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--ink)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.color = '#3b82f6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--ink)';
        }}
      >
        <Gamepad2 size={13} style={{ color: '#3b82f6' }} />
        <span>ARCADE</span>
      </button>

      {/* Floating Retro Arcade Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            right: '24px',
            zIndex: 999991,
            width: '320px',
            background: '#1c1917',
            borderRadius: '4px',
            border: '1px solid #44403c',
            boxShadow: '0 16px 36px rgba(43, 39, 33, 0.28)',
            overflow: 'hidden',
            animation: 'slideUpFade 0.2s ease-out'
          }}
        >
          {/* Top Title Bar */}
          <div
            style={{
              padding: '8px 12px',
              background: '#292524',
              borderBottom: '1px solid #44403c',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#d6d3d1', letterSpacing: '0.5px' }}>
              [ARCADE: STUDY_BREAK]
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Game Switcher Tabs */}
          <div style={{ display: 'flex', background: '#1c1917', borderBottom: '1px solid #44403c' }}>
            {(['dino', 'tetris', 'pong'] as const).map(g => (
              <button
                key={g}
                onClick={() => setActiveGame(g)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  background: activeGame === g ? '#292524' : 'transparent',
                  color: activeGame === g ? '#e7e5e4' : '#78716c',
                  border: 'none',
                  borderBottom: activeGame === g ? '2px solid #9a6a3e' : 'none',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Sub-Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              background: '#040711',
              borderBottom: '1px solid #1e293b'
            }}
          >
            {activeGame === 'pong' ? (
              <>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button
                    onClick={() => setPongControl('wasd')}
                    style={{
                      background: pongControl === 'wasd' ? '#3b82f6' : '#1e293b',
                      color: pongControl === 'wasd' ? '#fff' : '#64748b',
                      border: 'none',
                      padding: '2px 5px',
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    WASD
                  </button>
                  <button
                    onClick={() => setPongControl('mouse')}
                    style={{
                      background: pongControl === 'mouse' ? '#3b82f6' : '#1e293b',
                      color: pongControl === 'mouse' ? '#fff' : '#64748b',
                      border: 'none',
                      padding: '2px 5px',
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    MOUSE
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setPongDifficulty(d)}
                      style={{
                        background: pongDifficulty === d ? '#10b981' : '#1e293b',
                        color: pongDifficulty === d ? '#fff' : '#64748b',
                        border: 'none',
                        padding: '2px 5px',
                        fontSize: '0.62rem',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {d[0]}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                {activeGame === 'tetris' ? 'KEYS: ← → ↓ AND W / UP TO ROTATE' : 'PRESS SPACE / W / UP TO JUMP'}
              </span>
            )}
          </div>

          {/* Score Display Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 14px',
              background: '#020617',
              borderBottom: '1px solid #1e293b',
              color: '#f8fafc',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {activeGame === 'pong' ? (
              <>
                <span style={{ color: '#3b82f6' }}>YOU: {pongScore.player}</span>
                <span style={{ color: '#f43f5e' }}>AI: {pongScore.ai}</span>
              </>
            ) : (
              <>
                <span style={{ color: '#10b981' }}>SCORE: {score}</span>
                <span style={{ color: '#eab308' }}>HIGH: {highScore}</span>
              </>
            )}
          </div>

          {/* Canvas Game Stage */}
          <div style={{ position: 'relative', width: '320px', height: '220px' }}>
            <canvas ref={canvasRef} width={320} height={220} style={{ width: '320px', height: '220px', display: 'block' }} />

            {/* Game Over Screen */}
            {gameOver && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(9, 13, 22, 0.94)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <Trophy size={28} style={{ color: '#eab308' }} />
                <h4 style={{ color: '#f8fafc', margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>
                  GAME OVER
                </h4>
                <button
                  onClick={restartCurrentGame}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={13} /> RESTART
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
