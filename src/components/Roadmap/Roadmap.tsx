import { useEffect, useRef, useState } from 'react';
import { roadmapSteps } from '../../data';
import Icon from '../Icon/Icon';
import './Roadmap.css';

export default function Roadmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [fillingConnector, setFillingConnector] = useState(-1);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedRef = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setRevealed(new Set(roadmapSteps.map((_, i) => i)));
      setActiveStep(0);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            observer.disconnect();
            runAnimation();
          }
        });
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      timeoutsRef.current.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function schedule(fn: () => void, delay: number) {
    timeoutsRef.current.push(setTimeout(fn, delay));
  }

  function runAnimation() {
    roadmapSteps.forEach((_, i) => {
      schedule(() => {
        setRevealed((prev) => {
          const next = new Set(prev);
          next.add(i);
          return next;
        });
      }, i * 120);
    });

    schedule(runCycle, roadmapSteps.length * 120 + 600);
  }

  function runCycle() {
    setActiveStep(0);
    setCompletedSteps(new Set());
    setFillingConnector(-1);

    let delay = 500;

    for (let i = 0; i < roadmapSteps.length - 1; i++) {
      const connectorIdx = i;

      schedule(() => setFillingConnector(connectorIdx), delay);
      delay += 850;

      schedule(() => {
        setActiveStep(connectorIdx + 1);
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.add(connectorIdx);
          return next;
        });
        setFillingConnector(-1);
      }, delay);
      delay += 700;
    }

    schedule(() => {
      setActiveStep(-1);
      setCompletedSteps(new Set());
      setFillingConnector(-1);
    }, delay);
    delay += 800;

    schedule(runCycle, delay);
  }

  const isCompleted = (index: number) => completedSteps.has(index);
  const isActive = (index: number) => index === activeStep;
  const isFilling = (index: number) => index === fillingConnector;

  return (
    <div className="roadmap" ref={containerRef}>
      <div className="roadmap-steps">
        {roadmapSteps.map((step, index) => (
          <div
            key={step.id}
            className={[
              'roadmap-step',
              revealed.has(index) ? 'roadmap-step--revealed' : '',
              isActive(index) ? 'roadmap-step--active' : '',
              isCompleted(index) ? 'roadmap-step--completed' : '',
              isFilling(index) ? 'roadmap-step--filling' : '',
            ].filter(Boolean).join(' ')}
          >
            <div className="roadmap-step-marker">
              <div className="roadmap-step-dot">
                <Icon name={step.icon} size={20} className="roadmap-step-icon" />
              </div>
              {index < roadmapSteps.length - 1 && (
                <div className="roadmap-step-connector">
                  <div className="roadmap-step-connector-fill" />
                </div>
              )}
            </div>
            <div className="roadmap-step-info">
              <div className="roadmap-step-number">{step.step}</div>
              <h3 className="roadmap-step-title">{step.title}</h3>
              <p className="roadmap-step-desc">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
