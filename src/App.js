import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import MessageCard from './components/MessageCard';
import FloatingHearts from './components/FloatingHearts';
import './App.css';

const circles = [
  { size: 300, x: '10%', y: '20%', delay: 0 },
  { size: 200, x: '85%', y: '15%', delay: 0.3 },
  { size: 250, x: '75%', y: '80%', delay: 0.6 },
  { size: 180, x: '15%', y: '75%', delay: 0.9 }
];

const soundPeakImages = [
  '/ponysalvaje.jpg',
  '/images.jpg',
  '/9a1b067c57b64ec840d2ad767704c9e7.jpg'
];

const AppContainer = styled.main`
  width: 100%;
  min-height: 100vh;
  background: #07040a;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
`;

const PlayStage = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  flex: 0 0 auto;
  overflow: hidden;
  isolation: isolate;
  background: #07040a;
`;

const StarContainer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`;

const Star = styled.div`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: #fff;
  border-radius: 50%;
  opacity: ${props => props.$opacity};
  box-shadow: ${props => props.$brilliant
    ? '0 0 6px 2px rgba(255,255,255,0.85)'
    : 'none'};
  will-change: opacity, transform;
  animation: twinkle ${props => props.$duration}s ease-in-out infinite;

  @keyframes twinkle {
    0%, 100% { opacity: ${props => props.$opacity}; transform: scale(1); }
    50% {
      opacity: ${props => props.$brilliant ? 1 : props.$opacity * 0.55};
      transform: scale(${props => props.$brilliant ? 1.7 : 1.15});
    }
  }
`;

const DecorationCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 105, 180, 0.24), transparent 70%);
  z-index: 0;
  pointer-events: none;
`;

const AudioButton = styled.button`
  position: ${props => props.$intro ? 'absolute' : 'fixed'};
  top: ${props => props.$intro ? '50%' : '18px'};
  left: ${props => props.$intro ? '50%' : 'auto'};
  right: ${props => props.$intro ? 'auto' : '18px'};
  transform: ${props => props.$intro ? 'translate(-50%, -50%)' : 'none'};
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  padding: 11px 16px;
  color: #fff;
  background: rgba(205, 45, 122, 0.92);
  box-shadow: 0 4px 18px rgba(255, 105, 180, 0.35);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  font-size: ${props => props.$intro ? '1.1rem' : 'inherit'};
  width: ${props => props.$intro ? 'auto' : '46px'};
  height: ${props => props.$intro ? 'auto' : '46px'};
  justify-content: center;
  padding: ${props => props.$intro ? '15px 28px' : '0'};
  gap: ${props => props.$intro ? '9px' : '0'};
  box-shadow: ${props => props.$intro ? '0 0 28px rgba(255, 54, 158, 0.4)' : '0 4px 18px rgba(255, 105, 180, 0.35)'};

  &:hover { background: #e64997; }
  &:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }

  @media (max-width: 480px) {
    top: ${props => props.$intro ? '50%' : '12px'};
    right: ${props => props.$intro ? 'auto' : '12px'};
    width: ${props => props.$intro ? 'auto' : '44px'};
    height: ${props => props.$intro ? 'auto' : '44px'};
    padding: ${props => props.$intro ? '14px 28px' : '0'};
    font-size: ${props => props.$intro ? '1.1rem' : '0.85rem'};
  }
`;

const SpeakerIcon = ({ muted }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
    <path d="M4 10v4h4l5 4V6l-5 4H4Z" fill="currentColor" />
    {muted ? (
      <path d="m17 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path d="M16 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    )}
  </svg>
);

const MemeFlash = styled(motion.img)`
  position: fixed;
  z-index: 90;
  max-width: min(42vw, 340px);
  max-height: 44svh;
  object-fit: contain;
  border: 2px solid rgba(255, 255, 255, 0.86);
  border-radius: 5px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 105, 180, 0.7);
  pointer-events: none;
`;

const IntroOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  display: block;
  padding: 24px;
  background: #07040a;
  text-align: center;
`;

const IntroMessage = styled.p`
  position: absolute;
  top: calc(50% - 115px);
  left: 24px;
  right: 24px;
  max-width: 34rem;
  margin: 0;
  transform: translateY(-100%);
  color: #ffd9ed;
  font-family: 'Pacifico', cursive;
  font-size: clamp(1.35rem, 4vw, 2rem);
  line-height: 1.55;
  text-shadow: 0 0 16px rgba(255, 70, 170, 0.3);
  margin-left: auto;
  margin-right: auto;
`;

const MikuFrame = styled(motion.div)`
  position: absolute;
  top: 4%;
  left: 4%;
  z-index: 6;
  display: grid;
  place-items: center;
  width: min(92vw, 820px);
  height: 92svh;
  cursor: grab;
  touch-action: none;

  &:active { cursor: grabbing; }

  @media (max-width: 600px) {
    top: 3%;
    left: 0;
    width: 100%;
    height: 94svh;
  }
`;

const MikuVisual = styled.div`
  width: min(65vw, 620px);
  height: min(64svh, 600px);

  model-viewer {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  @media (max-width: 600px) {
    width: min(58vw, 340px);
    height: min(62svh, 560px);
  }
`;

const MikuSizeControl = styled.label`
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 15;
  display: grid;
  grid-template-columns: auto minmax(70px, 150px) auto;
  align-items: center;
  gap: 9px;
  color: #fff;
  font-size: 0.84rem;
  text-shadow: 0 1px 5px #000;

  input {
    width: 100%;
    accent-color: #ff69b4;
    cursor: ew-resize;
  }

  output { min-width: 36px; text-align: right; font-variant-numeric: tabular-nums; }
`;

const GiftButton = styled.button`
  position: absolute;
  right: 24px;
  bottom: 18px;
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  min-width: 112px;
  padding: 0;
  border: 0;
  color: #fff;
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  text-shadow: 0 2px 6px #000;
  cursor: pointer;
  filter: drop-shadow(0 6px 12px rgba(255, 105, 180, 0.35));

  &:disabled { cursor: wait; }
  &:focus-visible { outline: 2px solid #fff; outline-offset: 5px; border-radius: 8px; }

  @media (max-width: 600px) {
    right: 10px;
    bottom: 12px;
    min-width: 96px;
    font-size: 0.78rem;
  }
`;

const GiftDrawing = styled.span`
  position: relative;
  display: block;
  width: 78px;
  height: 72px;

  .gift-box {
    position: absolute;
    left: 10px;
    bottom: 0;
    width: 58px;
    height: 48px;
    border-radius: 4px 4px 7px 7px;
    background: linear-gradient(135deg, #ed4e92, #ae1859);
  }

  .gift-box:before {
    content: '';
    position: absolute;
    top: 0;
    left: 23px;
    width: 12px;
    height: 100%;
    background: #ffd166;
  }

  .gift-lid {
    position: absolute;
    left: 5px;
    top: 17px;
    width: 68px;
    height: 14px;
    border-radius: 4px;
    background: #ff75a9;
    transform-origin: 12% 100%;
    transform: ${props => props.$open ? 'translate(-11px, -20px) rotate(-24deg)' : 'none'};
    transition: transform 280ms ease;
  }

  .gift-bow {
    position: absolute;
    top: 4px;
    left: 32px;
    width: 15px;
    height: 14px;
    border: 5px solid #ffd166;
    border-radius: 80% 80% 15% 80%;
    transform: rotate(38deg);
  }

  .gift-bow:after {
    content: '';
    position: absolute;
    top: -4px;
    left: -18px;
    width: 15px;
    height: 14px;
    border: 5px solid #ffd166;
    border-radius: 80% 80% 80% 15%;
    transform: rotate(-76deg);
  }
`;

const FallingLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  overflow: hidden;
  pointer-events: none;
`;

const necoFloat = keyframes`
  from { transform: translateY(-7px) rotate(-2deg); }
  to { transform: translateY(7px) rotate(2deg); }
`;

const FallingNeco = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
  touch-action: none;
  cursor: grab;

  &:active { cursor: grabbing; }

`;

const FloatingNecoBody = styled.div`
  width: 100%;
  height: 100%;
  animation: ${necoFloat} ${props => props.$duration}s ease-in-out ${props => props.$delay}s infinite alternate;

  model-viewer {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
    filter: sepia(0.72) saturate(0.9) hue-rotate(-8deg);
  }
`;

const TossableNeco = ({ neco, stageRef }) => {
  const dragControls = useDragControls();
  const longPressTimerRef = useRef(null);
  const activeTouchRef = useRef(null);

  useEffect(() => () => clearTimeout(longPressTimerRef.current), []);

  const startThrowGesture = event => {
    if (event.pointerType === 'mouse' && (event.button === 2 || event.shiftKey)) {
      event.preventDefault();
      dragControls.start(event);
      return;
    }

    if (event.pointerType === 'touch') {
      activeTouchRef.current = event.pointerId;
      const pointerEvent = event.nativeEvent;
      longPressTimerRef.current = setTimeout(() => {
        if (activeTouchRef.current === event.pointerId) dragControls.start(pointerEvent);
      }, 500);
    }
  };

  const cancelLongPress = event => {
    if (event.pointerType === 'touch' && event.type === 'pointermove') {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (event.type === 'pointerup' || event.type === 'pointercancel') {
      activeTouchRef.current = null;
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <FallingNeco
      aria-label="Neco Arc: arrástralo con el cursor para moverlo"
      title="Arrástralo para moverlo a cualquier lugar"
      initial={{ x: neco.startX, y: neco.startY, scale: 0.28, rotate: neco.startRotation, opacity: 0 }}
      animate={{ x: neco.endX, y: neco.endY, scale: 1, rotate: neco.endRotation, opacity: 1 }}
      transition={{ duration: neco.duration, delay: neco.delay, ease: [0.2, 0.65, 0.35, 1] }}
      exit={{ x: neco.startX, y: neco.startY, scale: 0.28, opacity: 0, transition: { duration: 0.7, delay: 0, ease: [0.5, 0, 0.75, 0.4] } }}
      drag
      dragControls={dragControls}
      dragConstraints={stageRef}
      dragElastic={0.72}
      dragMomentum
      dragTransition={{ bounceStiffness: 280, bounceDamping: 20, timeConstant: 420 }}
      whileDrag={{ scale: 1.08, zIndex: 50 }}
      onPointerDownCapture={startThrowGesture}
      onPointerMoveCapture={cancelLongPress}
      onPointerUpCapture={cancelLongPress}
      onPointerCancelCapture={cancelLongPress}
      onContextMenu={event => event.preventDefault()}
      style={{ width: neco.size, height: neco.size * 1.12 }}
    >
      <FloatingNecoBody $duration={neco.floatDuration} $delay={neco.floatDelay}>
        <model-viewer
          src="/neco_arc_remake.glb"
          alt="Neco Arc flotando; arrastra para girar y ver su rostro"
          style={{ pointerEvents: 'none' }}
          camera-orbit="0deg 80deg 4m"
          field-of-view="35deg"
          shadow-intensity="1"
          environment-image="neutral"
          exposure="1"
        ></model-viewer>
      </FloatingNecoBody>
    </FallingNeco>
  );
};

const BirthdayEnding = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 28px;
  background: #050308;
  text-align: center;
`;

const EndingCopy = styled.div`
  position: relative;
  z-index: 2;
  max-width: 760px;
`;

const EndingTitle = styled(motion.h1)`
  margin: 0 0 20px;
  color: #ff76b7;
  font-family: 'Pacifico', cursive;
  font-size: clamp(2.6rem, 8vw, 6.5rem);
  line-height: 1.12;
  text-shadow: 0 0 14px rgba(255, 68, 160, 0.8), 0 0 42px rgba(255, 68, 160, 0.5);
`;

const EndingSubtitle = styled(motion.p)`
  margin: 0;
  color: #ffe4ef;
  font-family: 'Pacifico', cursive;
  font-size: clamp(1.15rem, 3vw, 1.8rem);
  line-height: 1.5;
  text-shadow: 0 0 14px rgba(255, 105, 180, 0.45);
`;

const SceneFloor = styled.div`
  position: absolute;
  left: 50%;
  bottom: -28px;
  width: min(76vw, 740px);
  height: 64px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 105, 180, 0.25), transparent 70%);
  filter: blur(8px);
  pointer-events: none;
`;

const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
`;

function App() {
  const stageRef = useRef(null);
  const giftRef = useRef(null);
  const mikuViewerRef = useRef(null);
  const [mikuScale, setMikuScale] = useState(1.9);
  const [hasStarted, setHasStarted] = useState(false);
  const [danceStarted, setDanceStarted] = useState(false);
  const [heartsBoosted, setHeartsBoosted] = useState(false);

  useEffect(() => {
    if (!danceStarted) return undefined;
    const timer = setTimeout(() => setHeartsBoosted(true), 2000);
    return () => clearTimeout(timer);
  }, [danceStarted]);
    const [floatingNeccos, setFloatingNeccos] = useState([]);
  const [giftOpen, setGiftOpen] = useState(false);
  const [showBirthdayEnding, setShowBirthdayEnding] = useState(false);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const intensityRef = useRef(0);
  const beatPulseRef = useRef(0);
  const fluxBaselineRef = useRef(0);
  const previousBassSpectrumRef = useRef(null);
  const lastBeatTimeRef = useRef(0);
  const frequencyDataRef = useRef(null);
  const memeTimeoutRef = useRef(null);
  const memeLockRef = useRef(false);
  const lastMemeIndexRef = useRef(-1);
  const [, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [memeFlash, setMemeFlash] = useState(null);

  useEffect(() => {
    if (!hasStarted) return undefined;
    const viewer = mikuViewerRef.current;
    if (!viewer) return undefined;
    let active = true;
    let retryFrame = null;

    const correctMikuMaterials = (attempt = 0) => {
      const materials = viewer.model?.materials;
      if (!materials) {
        if (attempt < 90 && active) {
          retryFrame = requestAnimationFrame(() => correctMikuMaterials(attempt + 1));
        }
        return;
      }

      const bodyMaterial = materials.find(material => material.name === 'Miku');
      const hairMaterial = materials.find(material => material.name === 'Hair');
      bodyMaterial?.setEmissiveFactor([0, 0, 0]);
      bodyMaterial?.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
      hairMaterial?.pbrMetallicRoughness.setBaseColorFactor([0.18, 0.95, 1, 1]);
      hairMaterial?.pbrMetallicRoughness.setMetallicFactor(0);
    };

    const handleMikuLoad = () => {
      if (window.innerWidth < 700) viewer.renderScale = 0.75;
      correctMikuMaterials(0);
    };
    viewer.addEventListener('load', handleMikuLoad);
    correctMikuMaterials();
    return () => {
      active = false;
      cancelAnimationFrame(retryFrame);
      viewer.removeEventListener('load', handleMikuLoad);
    };
  }, [hasStarted, floatingNeccos.length]);

  const openGift = () => {
    const stage = stageRef.current?.getBoundingClientRect();
    const gift = giftRef.current?.getBoundingClientRect();
    if (floatingNeccos.length > 0) {
      setFloatingNeccos([]);
      setGiftOpen(false);
      return;
    }
    if (!stage || !gift) return;

    const necoSize = Math.min(196, Math.max(142, stage.width * 0.18));
    const startX = gift.left - stage.left + gift.width / 2 - necoSize / 2;
    const startY = gift.top - stage.top - necoSize * 0.24;
    const necoHeight = necoSize * 1.12;
    const topBand = stage.height * 0.07;
    const sideBand = stage.width * 0.05;
    const nextNeccos = Array.from({ length: 2 }, (_, id) => {
      const zone = id % 4;
      let endX;
      let endY;

      if (zone === 0) {
        endX = Math.random() * Math.max(1, sideBand);
        endY = Math.random() * Math.max(1, stage.height - necoHeight);
      } else if (zone === 1) {
        endX = stage.width - necoSize - Math.random() * Math.max(1, sideBand);
        endY = Math.random() * Math.max(1, stage.height - necoHeight);
      } else if (zone === 2) {
        const useLeftSide = Math.random() < 0.5;
        endX = useLeftSide
          ? Math.random() * Math.max(1, sideBand)
          : stage.width - necoSize - Math.random() * Math.max(1, sideBand);
        endY = Math.random() * topBand;
      } else {
        const useLeftSide = Math.random() < 0.5;
        endX = useLeftSide
          ? Math.random() * Math.max(1, sideBand)
          : stage.width - necoSize - Math.random() * Math.max(1, sideBand);
        endY = stage.height - necoHeight - Math.random() * topBand;
      }

      return {
        id: `${Date.now()}-${id}`,
        size: necoSize,
        startX: startX + (Math.random() - 0.5) * 34,
        startY: startY + (Math.random() - 0.5) * 20,
        endX,
        endY,
        startRotation: 0,
        endRotation: 0,
        duration: 1.8 + Math.random() * 0.65,
        delay: id * 0.12,
        floatDuration: 2.2 + Math.random() * 1.4,
        floatDelay: Math.random() * -2
      };
    });

    setGiftOpen(true);
    setFloatingNeccos(nextNeccos);
  };

  const showMemeAtPeak = () => {
    const audio = audioRef.current;
    if (!audio || memeLockRef.current || audio.duration - audio.currentTime > 18 || audio.duration - audio.currentTime < 0.5) return;

    memeLockRef.current = true;
    let imageIndex = Math.floor(Math.random() * soundPeakImages.length);
    if (imageIndex === lastMemeIndexRef.current) imageIndex = (imageIndex + 1) % soundPeakImages.length;
    lastMemeIndexRef.current = imageIndex;

    const width = Math.min(340, Math.max(140, window.innerWidth * 0.32));
    const estimatedHeight = width * 0.9;
    setMemeFlash({
      id: `${Date.now()}-${imageIndex}`,
      src: soundPeakImages[imageIndex],
      width,
      x: Math.random() * Math.max(0, window.innerWidth - width),
      y: Math.random() * Math.max(0, Math.min(window.innerHeight - estimatedHeight, window.innerHeight * 0.65))
    });

    clearTimeout(memeTimeoutRef.current);
    memeTimeoutRef.current = setTimeout(() => {
      setMemeFlash(null);
      memeLockRef.current = false;
    }, 1300);
  };

  const analyzeAudio = () => {
    const analyser = analyserRef.current;
    const audio = audioRef.current;
    if (!analyser || !audio || audio.paused) return;

    const frequencies = frequencyDataRef.current;
    analyser.getByteFrequencyData(frequencies);
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const frequencyPerBin = sampleRate / analyser.fftSize;
    const firstBassBin = Math.max(1, Math.floor(45 / frequencyPerBin));
    const lastBassBin = Math.min(frequencies.length, Math.ceil(180 / frequencyPerBin));
    if (!previousBassSpectrumRef.current) {
      previousBassSpectrumRef.current = new Uint8Array(frequencies.length);
    }
    let bassTotal = 0;
    let fluxTotal = 0;
    for (let bin = firstBassBin; bin < lastBassBin; bin += 1) {
      bassTotal += frequencies[bin];
      fluxTotal += Math.max(0, frequencies[bin] - previousBassSpectrumRef.current[bin]);
      previousBassSpectrumRef.current[bin] = frequencies[bin];
    }
    const bassBinCount = lastBassBin - firstBassBin;
    const bassLevel = bassTotal / bassBinCount / 255;
    const bassFlux = fluxTotal / bassBinCount / 255;
    const now = performance.now();
    const fluxThreshold = Math.max(0.01, fluxBaselineRef.current * 1.5);

    if (bassFlux > fluxThreshold && bassLevel > 0.07 && now - lastBeatTimeRef.current > 220) {
      beatPulseRef.current = 1;
      lastBeatTimeRef.current = now;
      showMemeAtPeak();
    } else {
      beatPulseRef.current *= 0.86;
    }

    fluxBaselineRef.current += (bassFlux - fluxBaselineRef.current) * 0.025;
    const steadyIntensity = Math.min(0.28, bassLevel * 0.35);
    const intensity = Math.max(steadyIntensity, beatPulseRef.current);
    intensityRef.current = intensity;


    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      intensityRef.current = 0;
      cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass && !analyserRef.current) {
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      audioContext.createMediaElementSource(audio).connect(analyser);
      analyser.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    }

    try {
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      await audio.play();
      setIsPlaying(true);
      analyzeAudio();
    } catch (error) {
      setIsPlaying(false);
    }
  };

  const startExperience = () => {
    setHasStarted(true);
    toggleMusic();
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  useEffect(() => () => {
    cancelAnimationFrame(animationFrameRef.current);
    clearTimeout(memeTimeoutRef.current);
    audioContextRef.current?.close();
  }, []);

  const stars = useMemo(() => Array.from({ length: window.innerWidth < 700 ? 34 : 96 }, (_, index) => {
    const brilliant = Math.random() < 0.16;
    const size = brilliant ? Math.random() * 2 + 2.2 : Math.random() * 1.8 + 1;
    const opacity = brilliant ? Math.random() * 0.12 + 0.88 : Math.random() * 0.38 + 0.48;
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const duration = brilliant ? Math.random() * 1.4 + 1.2 : Math.random() * 3 + 2;

    return (
      <Star
        key={index}
        $size={size}
        $opacity={opacity}
        $duration={duration}
        $brilliant={brilliant}
        style={{ top: `${top}%`, left: `${left}%` }}
      />
    );
  }), []);

  return (
    <AppContainer>
      <audio
        ref={audioRef}
        src={encodeURI('/ループザルーム feat. 初音ミク Looping the Rooms ft. Hatsune Miku.mp3')}
        preload="metadata"
        onTimeUpdate={event => {
          if (event.currentTarget.currentTime >= 3 && !danceStarted) {
            setDanceStarted(true);
            const viewer = mikuViewerRef.current;
            if (viewer?.availableAnimations?.includes('Miku|Miku_Dance') && typeof viewer.play === 'function') {
              viewer.animationName = 'Miku|Miku_Dance';
              viewer.play();
            }
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          intensityRef.current = 0;
          beatPulseRef.current = 0;
          cancelAnimationFrame(animationFrameRef.current);
          clearTimeout(memeTimeoutRef.current);
          memeLockRef.current = false;
          setMemeFlash(null);
          setShowBirthdayEnding(true);
        }}
      />
      {!hasStarted ? (
        <IntroOverlay>
          <IntroMessage>
            Ponte los audífonos antes de tocar el botón... ¿o eres noob?
          </IntroMessage>
          <AudioButton
            $intro
            type="button"
            onClick={startExperience}
            aria-label="Prepárate: iniciar música y baile"
          >
            <span aria-hidden="true">▶</span>
            Prepárate
          </AudioButton>
        </IntroOverlay>
      ) : (
        <AudioButton
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          <SpeakerIcon muted={isMuted} />
        </AudioButton>
      )}

      {hasStarted && !showBirthdayEnding && <PlayStage ref={stageRef} aria-label="Escenario de cumpleaños">
      <StarContainer>{stars}</StarContainer>

      {circles.map(circle => (
        <DecorationCircle
          key={circle.x}
          style={{ width: circle.size, height: circle.size, left: circle.x, top: circle.y }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: circle.delay, duration: 1 }}
        />
      ))}

      {!showBirthdayEnding && <FloatingHearts count={window.innerWidth < 700 ? 10 : 36} intensityRef={window.innerWidth < 700 ? null : intensityRef} boosted={heartsBoosted} />}

      {memeFlash && (
        <MemeFlash
          key={memeFlash.id}
          src={memeFlash.src}
          alt=""
          aria-hidden="true"
          style={{ left: memeFlash.x, top: memeFlash.y, width: memeFlash.width }}
          initial={{ opacity: 0, scale: 0.78, rotate: -5 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.78, 1, 1, 0.92], rotate: [-5, 0, 0, 4] }}
          transition={{ duration: 1.3, times: [0, 0.12, 0.78, 1], ease: 'easeOut' }}
        />
      )}

      {hasStarted && (
        <>
          <MikuFrame
            drag
            dragConstraints={stageRef}
            dragElastic={0.04}
            dragMomentum={false}
            whileDrag={{ cursor: 'grabbing' }}
            aria-label="Arrastra a Miku para moverla por el escenario"
          >
            <MikuVisual style={{ scale: mikuScale }}>
              <model-viewer
                ref={mikuViewerRef}
                src="/miku_birthday.glb"
                alt="Hatsune Miku bailando"
                autoplay={danceStarted}
                animation-name={danceStarted ? 'Miku|Miku_Dance' : ''}
                shadow-intensity={window.innerWidth < 700 ? '0' : '1'}
                environment-image="neutral"
                exposure="1"
                style={{ width: '100%', height: '100%' }}
              ></model-viewer>
            </MikuVisual>
          </MikuFrame>

          <MikuSizeControl>
            <span>Tamaño</span>
            <input
              type="range"
              min="0.75"
              max="2.4"
              step="0.05"
              value={mikuScale}
              aria-label="Tamaño de Miku"
              onChange={event => setMikuScale(Number(event.target.value))}
            />
            <output>{Math.round(mikuScale * 100)}%</output>
          </MikuSizeControl>
        </>
      )}

      <GiftButton
        ref={giftRef}
        type="button"
        onClick={openGift}
        aria-label={floatingNeccos.length > 0 ? 'Guardar los Neco Arc en la caja' : 'Abrir caja de regalo'}
      >
        <GiftDrawing $open={giftOpen} aria-hidden="true">
          <span className="gift-box" />
          <span className="gift-lid" />
          <span className="gift-bow" />
        </GiftDrawing>
        <span>{floatingNeccos.length > 0 ? 'Guardar' : 'Abrir regalo'}</span>
      </GiftButton>

      <FallingLayer aria-label="Neco Arc flotando dispersos por la pantalla">
        <AnimatePresence>
          {floatingNeccos.map(neco => (
            <TossableNeco key={neco.id} neco={neco} stageRef={stageRef} />
          ))}
        </AnimatePresence>
      </FallingLayer>

      <SceneFloor />
      <LiveRegion aria-live="polite">
        {floatingNeccos.length > 0 ? 'Los Neco Arc flotan dispersos por la pantalla' : ''}
      </LiveRegion>
      </PlayStage>}

      {hasStarted && !showBirthdayEnding && <MessageCard marginBottom={true} />}

      {showBirthdayEnding && (
        <BirthdayEnding
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          role="dialog"
          aria-label="Felicitación de cumpleaños"
        >
          {[0, 1, 2, 3, 4, 5, 6].map(index => (
            <motion.span
              key={index}
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: [0.2, 0.85, 0.2], scale: [0.8, 1.15, 0.8], y: [0, -18, 0] }}
              transition={{ duration: 2.8 + index * 0.18, repeat: Infinity, delay: index * 0.25 }}
              style={{
                position: 'absolute',
                left: `${8 + index * 13}%`,
                top: `${16 + ((index * 17) % 68)}%`,
                color: index % 2 === 0 ? '#ff71b8' : '#ffd166',
                fontSize: `${24 + (index % 3) * 12}px`,
                textShadow: '0 0 18px currentColor'
              }}
            >
              ♥
            </motion.span>
          ))}
          <EndingCopy>
            <EndingTitle
              initial={{ opacity: 0, scale: 0.7, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 1, type: 'spring' }}
            >
              ¡Feliz cumpleaños!
            </EndingTitle>
            <EndingSubtitle
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              Que todos tus sueños se hagan realidad y nunca te falten razones para sonreír.
            </EndingSubtitle>
          </EndingCopy>
        </BirthdayEnding>
      )}
    </AppContainer>
  );
}

export default App;
