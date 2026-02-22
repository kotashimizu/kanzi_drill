import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './HandwritingCanvas.module.css';

/**
 * 手書き練習用キャンバスコンポーネント
 * @param {string} kanji - お手本として表示する漢字
 * @param {string} color - ペンの色
 * @param {number} strokeWidth - ペンの太さ
 */
export function HandwritingCanvas({ kanji, color = '#6C63FF', strokeWidth = 8 }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasContent, setHasContent] = useState(false);

    // キャンバスの初期化
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 高解像度ディスプレイ対応
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
    }, [color, strokeWidth]);

    /**
     * 描画開始処理
     */
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setHasContent(true);
    };

    /**
     * 描画中処理
     */
    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();

        // デフォルトのスクロール動作を防止（タッチデバイス用）
        if (e.touches) e.preventDefault();
    };

    /**
     * 描画終了処理
     */
    const stopDrawing = () => {
        if (!isDrawing) return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.closePath();
        setIsDrawing(false);
    };

    /**
     * キャンバスをクリアする
     */
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasContent(false);
    };

    return (
        <div className={styles.container}>
            {/* お手本の漢字（背景として表示） */}
            <div className={styles.exampleWrapper} aria-hidden="true">
                <span className={styles.exampleText}>{kanji}</span>
                <div className={styles.gridLines}>
                    <div className={styles.lineH} />
                    <div className={styles.lineV} />
                </div>
            </div>

            {/* 描画キャンバス */}
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            {/* アクションボタン */}
            <div className={styles.actions}>
                <button
                    className={styles.clearButton}
                    onClick={clearCanvas}
                    disabled={!hasContent}
                    title="消去"
                >
                    🗑️ 全部消す
                </button>
            </div>
        </div>
    );
}

export default HandwritingCanvas;
