import React, { useEffect, useMemo, useState } from 'react';
import './KejutanBungaIntro.css';
import './KejutanBungaFlower.css';

const introLetters = ['F', 'O', 'R', ' ', 'Y', 'O', 'U'];

function FlowerLights() {
  return Array.from({ length: 8 }, (_, index) => (
    <div key={index} className={`flower__light flower__light--${index + 1}`} />
  ));
}

function Flower({ variant, lineLeafCount = 4, style }) {
  return (
    <div className={`flower flower--${variant}`} style={style}>
      <div className={`flower__leafs flower__leafs--${variant}`}>
        <div className="flower__leaf flower__leaf--1" />
        <div className="flower__leaf flower__leaf--2" />
        <div className="flower__leaf flower__leaf--3" />
        <div className="flower__leaf flower__leaf--4" />
        <div className="flower__white-circle" />
        <FlowerLights />
      </div>

      <div className="flower__line">
        {Array.from({ length: lineLeafCount }, (_, index) => (
          <div
            key={index}
            className={`flower__line__leaf flower__line__leaf--${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function LongGrass({ group, delays, style }) {
  return (
    <div className={`long-g long-g--${group}`} style={style}>
      {delays.map((delay, index) => (
        <div key={`${group}-${index}`} className="grow-ans" style={{ '--d': delay }}>
          <div className={`leaf leaf--${index}`} />
        </div>
      ))}
    </div>
  );
}

function GrassPatch({ variant = 1, leafCount = 10, style }) {
  return (
    <div className="growing-grass" style={style}>
      <div className={`flower__grass flower__grass--${variant}`}>
        <div className="flower__grass--top" />
        <div className="flower__grass--bottom" />
        {Array.from({ length: leafCount }, (_, index) => (
          <div
            key={`patch-${variant}-${index}`}
            className={`flower__grass__leaf flower__grass__leaf--${(index % 8) + 1}`}
          />
        ))}
        <div className="flower__grass__overlay" />
      </div>
    </div>
  );
}

export default function KejutanBunga() {
  const [showFlowers, setShowFlowers] = useState(false);
  const [playAnimation, setPlayAnimation] = useState(false);
  const grassLeafCount = 10;
  const frontLeafCount = 10;
  const frLeafCount = 10;

  const extraGrassPatches = useMemo(
    () => [
      { variant: 1, style: { left: '-28vmin', bottom: '-2vmin', transform: 'scale(1.05)' } },
      { variant: 2, style: { left: '-2vmin', bottom: '-1vmin', transform: 'scale(0.95)' } },
      { variant: 1, style: { left: '24vmin', bottom: '-2vmin', transform: 'scale(1)' } },
      { variant: 2, style: { left: '40vmin', bottom: '-1vmin', transform: 'scale(0.9)' } }
    ],
    []
  );

  const flowerConfigs = useMemo(
    () => [
      { variant: 1, lineLeafCount: 6, style: { left: '-18vmin', transform: 'rotate(-10deg) scale(0.9)' } },
      { variant: 2, lineLeafCount: 5, style: { left: '-6vmin', transform: 'rotate(12deg) scale(0.95)' } },
      { variant: 3, lineLeafCount: 5, style: { left: '10vmin', transform: 'rotate(-16deg) scale(1)' } },
      { variant: 1, lineLeafCount: 6, style: { left: '24vmin', transform: 'rotate(8deg) scale(0.88)' } },
      { variant: 2, lineLeafCount: 5, style: { left: '36vmin', transform: 'rotate(22deg) scale(0.82)' } },
      { variant: 3, lineLeafCount: 5, style: { left: '-30vmin', transform: 'rotate(-22deg) scale(0.82)' } }
    ],
    []
  );

  const longGrassGroups = useMemo(
    () => [
      { group: 0, delays: ['3s', '2.2s', '3.4s', '3.6s'] },
      { group: 1, delays: ['3.6s', '3.8s', '4s', '4.2s'] },
      { group: 2, delays: ['4s', '4.2s', '4.4s', '4.6s'] },
      { group: 3, delays: ['4s', '4.2s', '3s', '3.6s'] },
      { group: 4, delays: ['4s', '4.2s', '3s', '3.6s'] },
      { group: 5, delays: ['4s', '4.2s', '3s', '3.6s'] },
      { group: 6, delays: ['4.2s', '4.4s', '4.6s', '4.8s'] },
      { group: 7, delays: ['3s', '3.2s', '3.5s', '3.6s'] },
      { group: 0, delays: ['3.1s', '2.5s', '3.2s', '3.8s'], style: { left: '-34vmin', bottom: '-1vmin', transform: 'scale(0.85)' } },
      { group: 1, delays: ['3.7s', '3.9s', '4.1s', '4.3s'], style: { left: '46vmin', bottom: '-1vmin', transform: 'scale(0.82)' } },
      { group: 2, delays: ['3.8s', '4s', '4.2s', '4.4s'], style: { left: '14vmin', bottom: '-2vmin', transform: 'scale(0.78)' } }
    ],
    []
  );

  useEffect(() => {
    if (!showFlowers) {
      setPlayAnimation(false);
      return;
    }

    const timer = setTimeout(() => setPlayAnimation(true), 0);
    return () => clearTimeout(timer);
  }, [showFlowers]);

  if (!showFlowers) {
    return (
      <div className="kejutan-bunga-intro">
        <div className="greetings">
          {introLetters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className={letter === ' ' ? 'greetings__space' : ''}
              style={{ animationDelay: `${index * 0.2}s` }}
              aria-hidden={letter === ' '}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>

        <div className="description">
          <span>Cantik nih kaya kamu❤️</span>
        </div>

        <div className="button">
          <button type="button" onClick={() => setShowFlowers(true)}>
            Clik on me
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`kejutan-bunga-scene ${playAnimation ? '' : 'kejutan-bunga-paused'}`}>
      <div className="night" />

      <div className="flowers">
        {flowerConfigs.map((item, index) => (
          <Flower
            key={`flower-${index}`}
            variant={item.variant}
            lineLeafCount={item.lineLeafCount}
            style={item.style}
          />
        ))}

        <div className="grow-ans" style={{ '--d': '1.2s' }}>
          <div className="flower__g-long">
            <div className="flower__g-long__top" />
            <div className="flower__g-long__bottom" />
          </div>
        </div>

        <GrassPatch variant={1} leafCount={grassLeafCount} />
        <GrassPatch variant={2} leafCount={grassLeafCount} />
        {extraGrassPatches.map((patch, index) => (
          <GrassPatch
            key={`extra-grass-${index}`}
            variant={patch.variant}
            leafCount={grassLeafCount}
            style={patch.style}
          />
        ))}

        <div className="grow-ans" style={{ '--d': '2.4s' }}>
          <div className="flower__g-right flower__g-right--1">
            <div className="leaf" />
          </div>
        </div>

        <div className="grow-ans" style={{ '--d': '2.8s' }}>
          <div className="flower__g-right flower__g-right--2">
            <div className="leaf" />
          </div>
        </div>

        <div className="grow-ans" style={{ '--d': '2.8s' }}>
          <div className="flower__g-front">
            {Array.from({ length: frontLeafCount }, (_, index) => (
              <div
                key={`front-leaf-${index}`}
                className={`flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--${(index % 8) + 1}`}
              >
                <div className="flower__g-front__leaf" />
              </div>
            ))}
            <div className="flower__g-front__line" />
          </div>
        </div>

        <div className="grow-ans" style={{ '--d': '3.2s' }}>
          <div className="flower__g-fr">
            <div className="leaf" />
            {Array.from({ length: frLeafCount }, (_, index) => (
              <div
                key={`g-fr-leaf-${index}`}
                className={`flower__g-fr__leaf flower__g-fr__leaf--${(index % 8) + 1}`}
              />
            ))}
          </div>
        </div>

        {longGrassGroups.map((item, index) => (
          <LongGrass
            key={`long-grass-${index}`}
            group={item.group}
            delays={item.delays}
            style={item.style}
          />
        ))}
      </div>
    </div>
  );
}
