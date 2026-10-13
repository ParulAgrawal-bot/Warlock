import React, { useEffect, useRef, useState } from 'react';
import { MonacoEditor } from './MonacoEditor';
import { QUESTION_BANK, LANGUAGES, starterFor, efficiencyScore, runCasesWithPiston } from '../dualChallenges';

function makePlayerId() {
  const stored = window.sessionStorage.getItem('warlock-player-id');
  if (stored) return stored;
  const id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem('warlock-player-id', id);
  return id;
}

export function DualRoom() {
  const [playerName, setPlayerName] = useState(() => window.localStorage.getItem('warlock-player-name') || '');
  const [roomInput, setRoomInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playerId] = useState(makePlayerId);
  const [room, setRoom] = useState(null);
  const [connection, setConnection] = useState('disconnected');
  const [feedback, setFeedback] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [remoteCode, setRemoteCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [remoteLanguage, setRemoteLanguage] = useState('javascript');
  const [timeLeft, setTimeLeft] = useState(120);
  const [checking, setChecking] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const socketRef = useRef(null);
  const codeTimerRef = useRef(null);
  const roundIdRef = useRef(null);
  const playerIdRef = useRef(playerId);
  const languageRef = useRef(language);
  playerIdRef.current = playerId;
  languageRef.current = language;

  const sendMessage = (message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(JSON.stringify(message));
  };

  const connectToRoom = (inputCode) => {
    const code = inputCode.trim().toUpperCase();
    if (!playerName.trim()) { setFeedback('Enter your player name first.'); return; }
    if (!/^[A-Z0-9]{4,8}$/.test(code)) { setFeedback('Room code must be 4 to 8 letters or numbers.'); return; }

    socketRef.current?.close();
    setRoomCode(code); setIsJoining(true); setConnection('connecting'); setFeedback('Connecting to the dual server…');
    window.localStorage.setItem('warlock-player-name', playerName.trim());
    const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const endpoint = import.meta.env.VITE_DUAL_SERVER_URL || `${scheme}//${window.location.hostname}:3001/dual-ws`;
    let socket;
    try { socket = new WebSocket(endpoint); } catch (error) {
      setIsJoining(false); setConnection('disconnected'); setFeedback(`Could not connect to the dual server: ${error.message}`); return;
    }
    socketRef.current = socket;
    socket.onopen = () => socket.send(JSON.stringify({ type: 'join', roomCode: code, playerId, name: playerName.trim() }));
    socket.onmessage = (event) => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.type === 'error') {
        setFeedback(message.message); setIsJoining(false); setRoomCode(''); setConnection('disconnected');
      } else if (message.type === 'room:state') {
        const nextRoom = message.room;
        const self = nextRoom.players.find((entry) => entry.id === playerIdRef.current);
        const opponent = nextRoom.players.find((entry) => entry.id !== playerIdRef.current);
        setRoom(nextRoom); setIsJoining(false); setConnection('connected'); setFeedback('');
        if (opponent) { setRemoteCode(opponent.code || ''); setRemoteLanguage(opponent.language || 'javascript'); }
        if (self?.language) { setLanguage(self.language); languageRef.current = self.language; }
        if (nextRoom.roundId && roundIdRef.current !== nextRoom.roundId) {
          roundIdRef.current = nextRoom.roundId;
          const question = QUESTION_BANK.find((entry) => entry.id === nextRoom.questionId);
          setCurrentQuestion(question || null);
          const starter = question ? starterFor(question, self?.language || languageRef.current) : '';
          const nextCode = self?.code || starter;
          setUserCode(nextCode);
          setRemoteCode(opponent?.code || '');
          setTimeLeft(nextRoom.startedAt ? Math.max(0, 120 - Math.floor((Date.now() - nextRoom.startedAt) / 1000)) : 120);
          if (question && !self?.code) sendMessage({ type: 'code:update', code: nextCode, language: self?.language || languageRef.current });
        }
        if (nextRoom.startedAt && !nextRoom.winnerId) {
          setTimeLeft(Math.max(0, 120 - Math.floor((Date.now() - nextRoom.startedAt) / 1000)));
        }
      } else if (message.type === 'opponent:code') {
        setRemoteCode(message.code); setRemoteLanguage(message.language);
      }
    };
    socket.onerror = () => {
      if (socketRef.current !== socket) return;
      setConnection('disconnected'); setIsJoining(false);
      setFeedback(`Could not reach ${endpoint}. Start the dual WebSocket server with npm run dual-server.`);
    };
    socket.onclose = () => { if (socketRef.current === socket) setConnection('disconnected'); };
  };

  useEffect(() => () => {
    clearTimeout(codeTimerRef.current);
    socketRef.current?.close();
  }, []);

  const handleCodeChange = (code) => {
    setUserCode(code);
    clearTimeout(codeTimerRef.current);
    codeTimerRef.current = setTimeout(() => sendMessage({ type: 'code:update', code, language: languageRef.current }), 80);
  };

  const changeLanguage = (nextLanguage) => {
    if (!currentQuestion) return;
    setLanguage(nextLanguage); languageRef.current = nextLanguage;
    const code = starterFor(currentQuestion, nextLanguage);
    setUserCode(code);
    sendMessage({ type: 'code:update', code, language: nextLanguage });
    setFeedback(`Editor switched to ${LANGUAGES.find((item) => item.id === nextLanguage).label}.`);
  };

  const submitCode = async () => {
    if (!currentQuestion || !room || checking || room.submissions?.[playerId]) return;
    if (userCode.trim() === starterFor(currentQuestion, language).trim()) { setFeedback('Write a solution before submitting.'); return; }
    sendMessage({ type: 'code:update', code: userCode, language });
    setChecking(true); setFeedback('Compiling and running test cases…');
    const output = await runCasesWithPiston(currentQuestion, userCode, language);
    setChecking(false);
    if (output.error) {
      setFeedback(`Could not score this submission: ${output.error}`);
      sendMessage({ type: 'round:submit', roundId: room.roundId, passed: 0, total: currentQuestion.cases.length, score: 0, language, error: output.error });
      return;
    }
    const efficiency = efficiencyScore(currentQuestion, userCode, language);
    const score = Math.round((output.passed / output.total) * 80 + efficiency * 0.2);
    sendMessage({ type: 'round:submit', roundId: room.roundId, passed: output.passed, total: output.total, score, efficiency, language });
    setFeedback(output.passed === output.total ? 'All test cases passed. Waiting for the other player…' : `${output.passed} of ${output.total} passed. Waiting for the other player…`);
  };

  const startRound = () => {
    setFeedback('Starting a shared challenge…');
    sendMessage({ type: 'round:start' });
  };

  const leaveRoom = () => {
    socketRef.current?.close(); socketRef.current = null;
    setRoom(null); setRoomCode(''); setCurrentQuestion(null); setConnection('disconnected');
    setFeedback(''); setChecking(false); roundIdRef.current = null;
  };

  const opponent = room?.players?.find((entry) => entry.id !== playerId);
  const self = room?.players?.find((entry) => entry.id === playerId);
  const mySubmission = room?.submissions?.[playerId];
  const opponentSubmission = opponent ? room?.submissions?.[opponent.id] : null;
  const winnerId = room?.winnerId;
  const inRound = Boolean(currentQuestion && room?.startedAt && !winnerId && timeLeft > 0);

  useEffect(() => {
    if (!inRound || !room?.startedAt) return undefined;
    const timer = setTimeout(() => {
      const remaining = Math.max(0, 120 - Math.floor((Date.now() - room.startedAt) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) sendMessage({ type: 'round:expire', roundId: room.roundId });
    }, 500);
    return () => clearTimeout(timer);
  }, [inRound, room?.startedAt, timeLeft]);

  const scoreLine = (entry, score) => `${entry?.name || 'Player'}: ${score ? `${score.score}/100 (${score.passed}/${score.total})${score.error ? ` · ${score.error}` : ''}` : 'waiting for submission'}`;

  return (
    <div className="duals-arena">
      <h2 className="duals-title">1v1 Coding Battle</h2>
      {!roomCode ? (
        <div className="duals-idle">
          <p className="duals-idle-copy">Create a room and share its code, or join the room created by your opponent. You will both see each other’s code live.</p>
          <label className="duals-name-label">Player name
            <input className="duals-name-input" value={playerName} maxLength={24} onChange={(event) => setPlayerName(event.target.value)} placeholder="Enter your name" />
          </label>
          <div className="duals-room-actions">
            <button type="button" className="btn run-btn duals-start-btn" disabled={isJoining} onClick={() => {
              const code = Math.random().toString(36).slice(2, 8).toUpperCase();
              setRoomInput(code); connectToRoom(code);
            }}>Create Room</button>
            <label className="duals-name-label">Room code
              <input className="duals-name-input" value={roomInput} maxLength={8} onChange={(event) => setRoomInput(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder="e.g. A1B2C3" />
            </label>
            <button type="button" className="btn duals-start-btn" disabled={isJoining} onClick={() => connectToRoom(roomInput)}>Join Room</button>
          </div>
          {feedback && <div className="duals-feedback">{feedback}</div>}
        </div>
      ) : (
        <>
          <div className="duals-room-bar">
            <div className="duals-room-id"><span className="duals-room-label">ROOM</span><strong>{roomCode}</strong><span className={`duals-connection${connection === 'connected' ? ' duals-connection--on' : ''}`}>{connection}</span></div>
            <div className="duals-room-buttons">
              <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(roomCode)}>Copy code</button>
              {connection !== 'connected' && <button type="button" className="btn" onClick={() => connectToRoom(roomCode)}>Reconnect</button>}
              <button type="button" className="btn" onClick={leaveRoom}>Leave room</button>
            </div>
          </div>
          <div className="duals-players-bar">
            <span>{self?.name || playerName || 'You'} {self?.connected ? '●' : '○'}</span><span className="duals-vs-mid">VS</span>
            <span>{opponent?.name || 'Waiting for opponent…'} {opponent?.connected ? '●' : ''}</span>
          </div>
          {inRound ? (
            <div className="duals-round">
              <div className="duals-round-header">
                <h3 className="duals-question-title">{currentQuestion.title}<span className="duals-diff">{currentQuestion.difficulty}</span></h3>
                <div className={`duals-timer${timeLeft < 30 ? ' duals-timer--warn' : ''}`}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
              </div>
              <p className="duals-desc">{currentQuestion.description}</p>
              <label className="duals-language-label">Language
                <select className="duals-language-select" value={language} onChange={(event) => changeLanguage(event.target.value)}>
                  {LANGUAGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <div className="duals-editors-grid">
                <section className="duals-editor">
                  <div className="editor-status">{self?.name || 'You'} · {LANGUAGES.find((item) => item.id === language).label}</div>
                  <div className="editor-body"><MonacoEditor language={language} value={userCode} onChange={handleCodeChange} onRun={submitCode} readOnly={Boolean(mySubmission) || checking} /></div>
                </section>
                <section className="duals-editor">
                  <div className="editor-status">{opponent?.name || 'Opponent'} · {LANGUAGES.find((item) => item.id === remoteLanguage).label} · live view</div>
                  <div className="editor-body"><MonacoEditor language={remoteLanguage} value={remoteCode} readOnly /></div>
                </section>
              </div>
              <button type="button" className="btn run-btn duals-submit-btn" onClick={submitCode} disabled={checking || Boolean(mySubmission)}>{checking ? 'Checking…' : mySubmission ? 'Submitted' : 'Submit Code'}</button>
              {feedback && <div className="duals-feedback">{feedback}</div>}
              {(mySubmission || opponentSubmission) && <div className="duals-live-scores"><span>{scoreLine(self, mySubmission)}</span><span>{scoreLine(opponent, opponentSubmission)}</span></div>}
            </div>
          ) : (
            <div className="duals-idle">
              {winnerId && winnerId !== 'expired' && <div className={`duals-outcome ${winnerId === 'draw' ? 'duals-outcome--draw' : 'duals-outcome--win'}`}>{winnerId === 'draw' ? 'DRAW' : winnerId === playerId ? 'YOU WIN' : `${opponent?.name || 'OPPONENT'} WINS`}</div>}
              {(mySubmission || opponentSubmission) && <div className="duals-live-scores"><span>{scoreLine(self, mySubmission)}</span><span>{scoreLine(opponent, opponentSubmission)}</span></div>}
              <p className="duals-idle-copy">{opponent?.connected ? 'Both players are connected. Start a shared challenge when ready.' : 'Share the room code with your opponent. The challenge starts when they join.'}</p>
              <button type="button" className="btn run-btn duals-start-btn" disabled={!opponent?.connected || !self?.connected || isJoining} onClick={startRound}>{winnerId ? 'Play Another Round' : 'Start Challenge'}</button>
              {feedback && <div className="duals-feedback">{feedback}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
