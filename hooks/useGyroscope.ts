import { useState, useEffect } from 'react';

interface GyroscopeData {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

export const useGyroscope = () => {
  const [gyroData, setGyroData] = useState<GyroscopeData>({ alpha: null, beta: null, gamma: null });
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setGyroData({
        alpha: event.alpha ?? null,
        beta: event.beta ?? null,
        gamma: event.gamma ?? null,
      });
    };

    const requestPermission = async () => {
      try {
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
        // @ts-ignore
        const canRequest = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';

        if (isIOS && canRequest) {
          // @ts-ignore
          const resp = await DeviceOrientationEvent.requestPermission();
          if (resp !== 'granted') {
            setError('センサーの利用が拒否されました。設定から「モーションと画面の向きへのアクセス」を有効にしてください。');
            return;
          }
        }
        window.addEventListener('deviceorientation', handleOrientation, true);
        setPermissionGranted(true);
      } catch (err) {
        console.error('Gyroscope permission error:', err);
        setError('ジャイロセンサーの初期化に失敗しました。');
      }
    };

    requestPermission();
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, []);

  return { gyroData, error, permissionGranted };
};
