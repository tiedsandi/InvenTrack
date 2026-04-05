import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

export default function ProgressBar() {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timer = useRef(null);

    useEffect(() => {
        const start = router.on('start', () => {
            setProgress(0);
            setVisible(true);
            timer.current = setInterval(() => {
                setProgress((p) => (p < 70 ? p + Math.random() * 10 : p));
            }, 200);
        });

        const finish = router.on('finish', () => {
            clearInterval(timer.current);
            setProgress(100);
            setTimeout(() => setVisible(false), 300);
        });

        return () => {
            start();
            finish();
            clearInterval(timer.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-slate-100">
            <div
                className="h-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
