// hooks/useGyroscope.ts
import { useEffect, useRef, useState } from 'react';

type Gyro = { alpha: number | null; beta: number | null; gamma: number | null };

// モジュールスコープ（重複購読を避ける）
let listenerAdded = false;
let lastData: Gyro = { alpha: null, beta: null, gamma: null };
let lastGranted = false;
let lastError: string | null = null;

const handleOrientation = (event: DeviceOrientationEvent) => {
  lastData = {
    alpha: event.alpha ?? null,
    beta: event.beta ?? null,
    gamma: event.gamma ?? null,
  };
};

const addListeners = () => {
  if (listenerAdded) return;
  window.addEventListener('deviceorientation', handleOrientation, true);
  // iOS16+ で absolute 側にのみ来る端末をフォロー
  window.addEventListener('deviceorientationabsolute' as any, handleOrientation as any, true);
  listenerAdded = true;
};

export async function requestGyroPermission(): Promise<boolean> {
  try {
    const anyDO = (DeviceOrientationEvent as unknown) as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof anyDO?.requestPermission === 'function') {
      const resp = await anyDO.requestPermission();
      if (resp !== 'granted') {
        lastGranted = false;
        lastError = 'ジャイロセンサーの許可が必要です。';
        return false;
      }
    } else {
      if (!('DeviceOrientationEvent' in window)) {
        lastGranted = false;
        lastError = 'この端末はジャイロセンサーに対応していません。';
        return false;
      }
    }
    addListeners();
    lastGranted = true;
    lastError = null;
    return true;
  } catch (e) {
    console.error('Gyro permission error:', e);
    lastGranted = false;
    lastError = 'ジャイロセンサーの初期化に失敗しました。';
    return false;
  }
}

export const useGyroscope = () => {
  const [data, setData] = useState<Gyro>(lastData);
  const [granted, setGranted] = useState<boolean>(lastGranted);
  const [error, setError] = useState<string | null>(lastError);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      // 差分のみ更新（再レンダー抑制）
      setData(prev =>
        prev.alpha === lastData.alpha && prev.beta === lastData.beta && prev.gamma === lastData.gamma
          ? prev : lastData
      );
      setGranted(g => (g === lastGranted ? g : lastGranted));
      setError(e => (e === lastError ? e : lastError));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return { gyroData: data, granted, error, requestPermission: requestGyroPermission };
};
