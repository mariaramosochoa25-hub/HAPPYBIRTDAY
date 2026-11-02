import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const heartFloat = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); opacity: calc(var(--base-opacity, 0.34) + var(--hi, 0) * 0.12); }
  100% { transform: translate(var(--drift-x), calc(-100vh + var(--drift-y))) rotate(var(--drift-rotation)); opacity: 0; }
`;

const damageRise = keyframes`
  0% { opacity: 0; transform: translate(-50%, 8px) scale(0.65); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -68px) scale(1.05); }
`;

const crackSpread = keyframes`
  0% { opacity: 0; transform: scale(0.45); }
  18% { opacity: 1; }
  100% { opacity: 0.9; transform: scale(1); }
`;

const shardFall = keyframes`
  0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rotation)) scale(0.55); }
`;

const heartPath = 'M16 28C16 28 3 20.5 3 11.5C3 7.5 6 4.5 10 4.5C12.5 4.5 14.5 5.5 16 7.5C17.5 5.5 19.5 4.5 22 4.5C26 4.5 29 7.5 29 11.5C29 20.5 16 28 16 28Z';

const Heart = styled.button.attrs(props => ({
  style: {
    '--mx': props.$motionX,
    '--my': props.$motionY,
    '--tilt': props.$tilt,
    '--base-opacity': props.$boosted ? 0.5 : 0.34,
    '--drift-x': `${props.$driftX}px`,
    '--drift-y': `${props.$driftY}px`,
    '--drift-rotation': `${props.$driftRotation}deg`
  }
}))`
  position: fixed;
  top: ${props => props.$top}%;
  left: ${props => props.$left}%;
  z-index: 10;
  opacity: calc(var(--base-opacity, 0.34) + var(--hi, 0) * 0.12);
  scale: calc(1 + var(--hi, 0) * 0.36);
  translate: calc(var(--mx) * var(--hi, 0) * 12px) calc(var(--my) * var(--hi, 0) * 12px);
  rotate: calc(var(--tilt) * var(--hi, 0) * 8deg);
  will-change: transform, opacity;
  contain: layout style;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  animation: ${heartFloat} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
  visibility: ${props => props.$breaking ? 'hidden' : 'visible'};

  &:focus-visible { outline: 2px solid white; outline-offset: 4px; }

  .heart-shape, .heart-cracks {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .heart-shape path {
    fill: ${props => props.$color};
    stroke: rgba(255, 255, 255, 0.35);
    stroke-width: 0.8;
  }

  .heart-cracks {
    z-index: 2;
    pointer-events: none;
    animation: ${crackSpread} 240ms ease-out both;
  }

  .crack-line {
    fill: none;
    stroke: #fff;
    stroke-width: 0.58;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .crack-branch {
    fill: none;
    stroke: rgba(255, 255, 255, 0.84);
    stroke-width: 0.34;
    stroke-linecap: round;
  }
`;

const EffectLayer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 70;
  overflow: hidden;
  pointer-events: none;
`;

const DamageNumber = styled.div`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  color: ${props => props.$critical ? '#ffd166' : '#f7f3ff'};
  font-family: 'Roboto', sans-serif;
  font-size: ${props => props.$critical ? '1.75rem' : '1.12rem'};
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 2px 3px #1a0717, 0 0 10px ${props => props.$critical ? 'rgba(255, 190, 60, 0.95)' : 'rgba(255, 105, 180, 0.8)'};
  animation: ${damageRise} 980ms cubic-bezier(0.18, 0.75, 0.25, 1) forwards;

  ${props => props.$critical && `
    font-style: italic;
    -webkit-text-stroke: 0.4px #a84c00;
  `}
`;

const Shard = styled.span`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: ${props => props.$color};
  clip-path: polygon(50% 0, 100% 34%, 72% 100%, 12% 78%, 0 28%);
  will-change: transform, opacity;
  animation: ${shardFall} 1250ms cubic-bezier(0.2, 0.65, 0.35, 1) forwards;
  animation-delay: ${props => props.$delay}ms;
  --dx: ${props => props.$dx}px;
  --dy: ${props => props.$dy}px;
  --rotation: ${props => props.$rotation}deg;
`;

const HeartItem = React.memo(({ heart, index, boosted, onHit }) => (
    <Heart
    key={`${heart.id}-${heart.generation}`}
    type="button"
    aria-label={`Golpea el corazón ${index + 1}; daño acumulado ${heart.damage}`}
    onClick={event => onHit(event, heart)}
    $size={heart.size}
    $color={heart.color}
    $left={heart.left}
    $top={heart.top}
    $duration={heart.duration}
    $delay={heart.delay}
    $motionX={heart.motionX}
    $motionY={heart.motionY}
    $tilt={heart.tilt}
    $driftX={heart.driftX}
    $driftY={heart.driftY}
    $driftRotation={heart.driftRotation}
    $boosted={boosted}
    $breaking={heart.breaking}
  >
    <svg className="heart-shape" viewBox="0 0 32 32" aria-hidden="true">
      <path d={heartPath} />
    </svg>
    {heart.cracks.length > 0 && (
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <clipPath id="heart-clip"><path d={heartPath} /></clipPath>
        </defs>
      </svg>
    )}
    {heart.cracks.map(crack => (
      <svg
        className="heart-cracks"
        key={crack.id}
        viewBox="0 0 32 32"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g clipPath="url(#heart-clip)">
          {crack.paths.map((path, pathIndex) => (
            <path
              className={pathIndex % 3 === 0 ? 'crack-line' : 'crack-branch'}
              d={path}
              key={pathIndex}
            />
          ))}
          <circle cx={crack.x} cy={crack.y} r="0.7" fill="#fff" />
        </g>
      </svg>
    ))}
  </Heart>
));

const FloatingHearts = ({ count = 15, intensityRef = null, boosted = false }) => {
  const wrapperRef = useRef(null);
  const [hearts, setHearts] = useState(() => Array.from({ length: count }, (_, id) => {
    const colors = ['#ff69b4', '#ffb6c1', '#ffc0cb', '#ff1493', '#db7093'];
    const size = Math.random() * 28 + 40;
    const maxLeft = Math.max(0, 100 - (size / Math.max(1, window.innerWidth)) * 100);
    const maxTop = Math.max(0, 100 - (size / Math.max(1, window.innerHeight)) * 100);
    return {
      id,
      generation: 0,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * maxLeft,
      top: Math.random() * maxTop,
      duration: Math.random() * 10 + 14,
      delay: Math.random() * 10,
      motionX: Math.random() * 2 - 1,
      motionY: Math.random() * 2 - 1,
      tilt: Math.random() * 2 - 1,
      driftX: Math.random() * 48 - 24,
      driftY: Math.random() * 48 - 24,
      driftRotation: Math.random() * 34 - 17,
      damage: 0,
      hits: 0,
      cracks: [],
      breaking: false
    };
  }));
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [shatteredHearts, setShatteredHearts] = useState([]);
  const timeoutRefs = useRef([]);
  const breakingIdsRef = useRef(new Set());

  useEffect(() => () => {
    timeoutRefs.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!intensityRef) return undefined;
    let frame;
    let last = 0;
    const tick = () => {
      const next = intensityRef.current || 0;
      if (Math.abs(next - last) > 0.015 || (next === 0 && last !== 0)) {
        last = next;
        wrapperRef.current?.style.setProperty('--hi', next.toFixed(3));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [intensityRef]);

  const hitHeart = (event, heart) => {
    if (heart.breaking || breakingIdsRef.current.has(heart.id)) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = ((event.clientX - bounds.left) / bounds.width) * 32;
    const localY = ((event.clientY - bounds.top) / bounds.height) * 32;
    const critical = Math.random() < 0.2;
    const damage = critical
      ? Math.floor(Math.random() * 36) + 60
      : Math.floor(Math.random() * 19) + 12;
    const hitId = `${heart.id}-${heart.generation}-${Date.now()}-${Math.random()}`;
    const damageNumber = {
      id: hitId,
      x: event.clientX,
      y: event.clientY,
      critical,
      text: `${critical ? '¡CRÍTICO!' : '¡Normal!'} -${damage}`
    };
    const breaksHeart = heart.damage + damage >= 100 || heart.hits + 1 >= 5 || (critical && damage >= 86);
    const crack = {
      id: hitId,
      x: localX,
      y: localY,
      paths: createCrackPaths(localX, localY, heart.size)
    };

    setDamageNumbers(previous => [...previous, damageNumber]);
    timeoutRefs.current.push(setTimeout(() => {
      setDamageNumbers(previous => previous.filter(number => number.id !== hitId));
    }, 1000));

    setHearts(previous => previous.map(current => {
      if (current.id !== heart.id || current.generation !== heart.generation) return current;

      const nextDamage = current.damage + damage;
      const nextHits = current.hits + 1;
      if (!breaksHeart) {
        return { ...current, damage: nextDamage, hits: nextHits, cracks: [...current.cracks, crack] };
      }

      return { ...current, damage: nextDamage, hits: nextHits, cracks: [...current.cracks, crack], breaking: true };
    }));

    if (breaksHeart) {
      breakingIdsRef.current.add(heart.id);
      setShatteredHearts(previous => [...previous, createShards(heart, bounds)]);
      const timeout = setTimeout(() => {
        breakingIdsRef.current.delete(heart.id);
        setShatteredHearts(previous => previous.filter(shard => shard.heartId !== heart.id));
        setHearts(previous => previous.map(current => current.id === heart.id
          ? {
            ...current,
            generation: current.generation + 1,
            left: Math.random() * Math.max(0, 100 - (current.size / Math.max(1, window.innerWidth)) * 100),
            top: Math.random() * Math.max(0, 100 - (current.size / Math.max(1, window.innerHeight)) * 100),
            delay: 0,
            driftX: Math.random() * 48 - 24,
            driftY: Math.random() * 48 - 24,
            driftRotation: Math.random() * 34 - 17,
            damage: 0,
            hits: 0,
            cracks: [],
            breaking: false
          }
          : current));
      }, 1500);
      timeoutRefs.current.push(timeout);
    }
  };

  const hitRef = useRef(hitHeart);
  hitRef.current = hitHeart;
  const onHit = useCallback((event, heart) => hitRef.current(event, heart), []);

  const heartsMarkup = hearts.map((heart, index) => (
    <HeartItem
      key={`${heart.id}-${heart.generation}`}
      heart={heart}
      index={index}
      boosted={boosted}
      onHit={onHit}
    />
  ));

  const effectMarkup = (
    <EffectLayer aria-hidden="true">
      {damageNumbers.map(number => (
        <DamageNumber
          key={number.id}
          $x={number.x}
          $y={number.y}
          $critical={number.critical}
        >
          {number.text}
        </DamageNumber>
      ))}
      {shatteredHearts.flatMap(shard => shard.pieces.map(piece => (
        <Shard
          key={`${shard.heartId}-${piece.id}`}
          $x={shard.centerX - piece.size / 2}
          $y={shard.centerY - piece.size / 2}
          $size={piece.size}
          $dx={piece.dx}
          $dy={piece.dy}
          $rotation={piece.rotation}
          $delay={piece.delay}
          $color={shard.color}
        />
      )))}
    </EffectLayer>
  );

  return (
    <div ref={wrapperRef} style={{ display: 'contents' }}>
      {heartsMarkup}
      {effectMarkup}
    </div>
  );
};

function createCrackPaths(startX, startY, size) {
  const paths = [];
  const rayCount = 6;

  for (let ray = 0; ray < rayCount; ray += 1) {
    const angle = (ray / rayCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const length = size * (0.32 + Math.random() * 0.3);
    const steps = 4;
    let path = `M ${startX.toFixed(2)} ${startY.toFixed(2)}`;

    for (let step = 1; step <= steps; step += 1) {
      const distance = (length / steps) * step;
      const jitter = step === steps ? 0 : (Math.random() - 0.5) * size * 0.12;
      const x = startX + Math.cos(angle) * distance + Math.cos(angle + Math.PI / 2) * jitter;
      const y = startY + Math.sin(angle) * distance + Math.sin(angle + Math.PI / 2) * jitter;
      path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    paths.push(path);

    if (ray % 2 === 0) {
      const branchX = startX + Math.cos(angle) * length * 0.52;
      const branchY = startY + Math.sin(angle) * length * 0.52;
      const branchAngle = angle + (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 0.55);
      const branchLength = length * 0.34;
      paths.push(`M ${branchX.toFixed(2)} ${branchY.toFixed(2)} L ${(branchX + Math.cos(branchAngle) * branchLength).toFixed(2)} ${(branchY + Math.sin(branchAngle) * branchLength).toFixed(2)}`);
    }
  }

  return paths;
}

function createShards(heart, bounds) {
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const pieces = Array.from({ length: 7 }, (_, id) => {
    const angle = (id / 7) * Math.PI * 2 + (Math.random() - 0.5) * 0.55;
    const force = 35 + Math.random() * 100;
    return {
      id,
      size: Math.max(12, heart.size * (0.25 + Math.random() * 0.24)),
      dx: Math.cos(angle) * force,
      dy: 35 + Math.random() * 100 + Math.sin(angle) * force * 0.45,
      rotation: Math.random() * 420 - 210,
      delay: Math.random() * 90
    };
  });

  return { heartId: heart.id, centerX, centerY, color: heart.color, pieces };
}

export default FloatingHearts;
