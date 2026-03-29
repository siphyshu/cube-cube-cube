import { useState, useRef, useCallback, useEffect } from 'react';
import { INSPECTION_TIMES } from '../constants/defaults';

export function useTimer({ inspectionEnabled = false, soundEnabled = false, onSolveComplete }) {
  const [timerState, setTimerState] = useState('idle'); // idle | ready | inspecting | running
  const [timeMs, setTimeMs] = useState(0);
  const [inspectionTime, setInspectionTime] = useState(15);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const inspectionRef = useRef(null);
  const inspectionStartRef = useRef(0);

  const updateTime = useCallback(() => {
    setTimeMs(Date.now() - startTimeRef.current);
    timerRef.current = requestAnimationFrame(updateTime);
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimerState('running');
    timerRef.current = requestAnimationFrame(updateTime);
  }, [updateTime]);

  const startInspection = useCallback(() => {
    inspectionStartRef.current = Date.now();
    setTimerState('inspecting');
    setInspectionTime(15);

    inspectionRef.current = setInterval(() => {
      const elapsed = (Date.now() - inspectionStartRef.current) / 1000;
      const remaining = Math.ceil(15 - elapsed);
      setInspectionTime(remaining);

      if (remaining <= 0) {
        clearInterval(inspectionRef.current);
      }
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    cancelAnimationFrame(timerRef.current);
    clearInterval(inspectionRef.current);
    setTimerState('idle');
    const finalTime = Date.now() - startTimeRef.current;
    setTimeMs(finalTime);

    let penalty = '';
    if (inspectionEnabled && inspectionStartRef.current > 0) {
      const inspElapsed = (startTimeRef.current - inspectionStartRef.current) / 1000;
      if (inspElapsed >= INSPECTION_TIMES.DNF) penalty = 'DNF';
      else if (inspElapsed >= INSPECTION_TIMES.PLUS_2) penalty = '+2';
    }

    inspectionStartRef.current = 0;
    onSolveComplete?.(finalTime, penalty);
  }, [inspectionEnabled, onSolveComplete]);

  const cancelTimer = useCallback(() => {
    cancelAnimationFrame(timerRef.current);
    clearInterval(inspectionRef.current);
    setTimerState('idle');
    inspectionStartRef.current = 0;
  }, []);

  const primeTimer = useCallback(() => {
    setTimerState('ready');
    setTimeMs(0);
  }, []);

  const releasePrime = useCallback(() => {
    if (inspectionEnabled) {
      startInspection();
    } else {
      startTimer();
    }
  }, [inspectionEnabled, startInspection, startTimer]);

  const handleInspectionRelease = useCallback(() => {
    clearInterval(inspectionRef.current);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(timerRef.current);
      clearInterval(inspectionRef.current);
    };
  }, []);

  return {
    timerState,
    timeMs,
    inspectionTime,
    setTimeMs,
    setTimerState,
    primeTimer,
    releasePrime,
    startTimer,
    stopTimer,
    cancelTimer,
    handleInspectionRelease,
  };
}
