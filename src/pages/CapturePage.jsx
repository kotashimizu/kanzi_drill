import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Search,
    BookOpen,
    PencilLine,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { findKanji } from '../data/kanjiDatabase.js';
import styles from './CapturePage.module.css';

/**
 * テキストから漢字文字を抽出するユーティリティ
 * 波線（~, 〰, ～）や記号が近くにある漢字を優先する
 * @param {string} text - OCRなどで取得したテキスト
 * @returns {Array} - 見つかった漢字と、データベースに存在するかどうかの情報
 */
function extractKanjiFromText(text) {
    // 漢字の周辺にある「波線」や「下線」に見える記号
    const targetIndicatorRegex = /[~〰～\-_=＝]/;
    const kanjiRegex = /[\u4E00-\u9FFF]/g;

    // テキストを1文字ずつ見て、記号の隣にある漢字を特定する
    const chars = [...text];
    const targetKanji = new Set();

    for (let i = 0; i < chars.length; i++) {
        if (targetIndicatorRegex.test(chars[i])) {
            // 前後の文字をチェック
            if (i > 0 && /[\u4E00-\u9FFF]/.test(chars[i - 1])) targetKanji.add(chars[i - 1]);
            if (i < chars.length - 1 && /[\u4E00-\u9FFF]/.test(chars[i + 1])) targetKanji.add(chars[i + 1]);
        }
    }

    const allKanjiFound = [...new Set(text.match(kanjiRegex) || [])];
    return allKanjiFound.map((char) => ({
        character: char,
        data: findKanji(char),
        isStudyTarget: targetKanji.has(char)
    }));
}

/**
 * 写真からドリルを作るページ
 * カメラ/ファイルから画像を取得し、Tesseract.jsでOCRを実行して漢字を抽出する
 */
function CapturePage() {
    const navigate = useNavigate();
    const { setExtractedKanji, setIsPhotoDrill } = useAppStore();
    const fileInputRef = useRef(null);

    // アップロードされた画像のURL
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    // OCRの状態（'idle' | 'processing' | 'done' | 'error'）
    const [ocrStatus, setOcrStatus] = useState('idle');
    // OCRの進捗（0〜100）
    const [ocrProgress, setOcrProgress] = useState(0);
    // 抽出した漢字のリスト
    const [foundKanjiList, setFoundKanjiList] = useState([]);
    // OCRエラーメッセージ
    const [errorMessage, setErrorMessage] = useState('');
    // ドリルに追加した漢字のセット
    const [addedKanjiSet, setAddedKanjiSet] = useState(new Set());

    /**
     * ファイル読み込みの処理（画像プレビュー表示）
     * @param {File} imageFile - アップロードされた画像ファイル
     */
    const handleFileLoad = (imageFile) => {
        if (!imageFile || !imageFile.type.startsWith('image/')) return;
        const imageUrl = URL.createObjectURL(imageFile);
        setUploadedImageUrl(imageUrl);
        setOcrStatus('idle');
        setFoundKanjiList([]);
        setAddedKanjiSet(new Set());
    };

    /**
     * Tesseract.jsを動的インポートしてOCRを実行する
     */
    const handleStartOcr = async () => {
        if (!uploadedImageUrl) return;
        setOcrStatus('processing');
        setOcrProgress(0);
        setErrorMessage('');

        try {
            // 動的インポートでTesseract.jsを読み込む
            const Tesseract = await import('tesseract.js');
            const { data: { text } } = await Tesseract.recognize(
                uploadedImageUrl,
                'jpn', // 日本語
                {
                    logger: (progressInfo) => {
                        if (progressInfo.progress) {
                            setOcrProgress(Math.round(progressInfo.progress * 100));
                        }
                    },
                }
            );

            const extractedList = extractKanjiFromText(text);
            setFoundKanjiList(extractedList);

            // 波線の近くにあった漢字を自動選択する
            const autoSelected = new Set();
            extractedList.forEach(item => {
                if (item.isStudyTarget && item.data) {
                    autoSelected.add(item.character);
                }
            });
            setAddedKanjiSet(autoSelected);

            // ストアも更新
            const selectedList = [...autoSelected].map(findKanji).filter(Boolean);
            setExtractedKanji(selectedList);

            setOcrStatus('done');
        } catch (error) {
            console.error('OCRエラー:', error);
            setOcrStatus('error');
            setErrorMessage('文字の読み取りに失敗しました。別の画像をお試しください。');
        }
    };

    /**
     * 選択した漢字をドリルリストに追加する
     * @param {string} kanjiCharacter - 追加する漢字
     */
    const handleAddKanji = (kanjiCharacter) => {
        const kanjiData = findKanji(kanjiCharacter);
        if (!kanjiData) return;

        const newSet = new Set(addedKanjiSet);
        if (newSet.has(kanjiCharacter)) {
            newSet.delete(kanjiCharacter);
        } else {
            newSet.add(kanjiCharacter);
        }
        setAddedKanjiSet(newSet);

        // ストアを更新
        const selectedList = [...newSet].map(findKanji).filter(Boolean);
        setExtractedKanji(selectedList);
    };

    return (
        <div style={{ padding: '60px 0 20px' }}>
            <div className="app-container">
                {/* ヘッダー */}
                <div className={styles.header}>
                    <button className="btn-secondary" onClick={() => navigate('/')} id="btn-back-from-capture" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                        ← もどる
                    </button>
                    <h1 className={styles.title}>
                        <Camera size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                        写真からドリル
                    </h1>
                    <p className={styles.subtitle}>学校のドリルや教科書を撮影して問題を作ろう！</p>
                </div>

                {/* 画像アップロードエリア */}
                <div
                    className={styles.uploadArea}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFileLoad(e.dataTransfer.files[0]); }}
                    id="upload-area"
                    role="button"
                    aria-label="画像をアップロード"
                    tabIndex={0}
                >
                    {uploadedImageUrl ? (
                        <div className={styles.imagePreviewWrapper}>
                            <img src={uploadedImageUrl} alt="アップロードした写真" className={styles.imagePreview} />
                            <div className={styles.imageOverlay}>
                                <span>タップして変更</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.uploadPlaceholder}>
                            <Camera size={64} color="var(--color-text-secondary)" />
                            <p className={styles.uploadText}>ドリルの写真をアップロード</p>
                            <p className={styles.uploadHint}>タップまたはドラッグ＆ドロップ</p>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileLoad(e.target.files[0])}
                        id="file-input-camera"
                    />
                </div>

                {/* OCR実行ボタン */}
                {uploadedImageUrl && ocrStatus !== 'processing' && (
                    <motion.button
                        className="btn-primary"
                        onClick={handleStartOcr}
                        id="btn-start-ocr"
                        style={{ width: '100%', marginBottom: '16px' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Search size={18} /> 漢字を読み取る
                    </motion.button>
                )}

                {/* OCR処理中 */}
                {ocrStatus === 'processing' && (
                    <motion.div className={`glass-card ${styles.progressCard}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className={styles.processingText}>
                            <Loader2 size={18} className="spin" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            読み取り中... {ocrProgress}%
                        </p>
                        <div className={styles.ocrProgressBar}>
                            <motion.div
                                className={styles.ocrProgressFill}
                                animate={{ width: `${ocrProgress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* エラー表示 */}
                {ocrStatus === 'error' && (
                    <div className={styles.errorCard}>{errorMessage}</div>
                )}

                {/* 抽出された漢字リスト */}
                {ocrStatus === 'done' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className={styles.resultTitle}>
                            見つかった漢字：{foundKanjiList.length}文字
                        </h2>

                        {foundKanjiList.length === 0 ? (
                            <div className={`glass-card ${styles.noKanjiCard}`}>
                                <p>漢字が見つかりませんでした。<br />はっきりした写真で再チャレンジしてみてください。</p>
                            </div>
                        ) : (
                            <div className={styles.kanjiGrid}>
                                {foundKanjiList.map(({ character, data }) => (
                                    <motion.button
                                        key={character}
                                        className={`${styles.kanjiChip} ${addedKanjiSet.has(character) ? styles.kanjiChipSelected : ''} ${!data ? styles.kanjiChipUnknown : ''}`}
                                        onClick={() => data && handleAddKanji(character)}
                                        id={`btn-kanji-${character}`}
                                        disabled={!data}
                                        title={data ? `${character}（${data.grade}年生）` : '学習漢字ではありません'}
                                        whileHover={data ? { scale: 1.1 } : {}}
                                        whileTap={data ? { scale: 0.9 } : {}}
                                    >
                                        <span className={styles.kanjiChipChar}>{character}</span>
                                        {data && <span className={styles.kanjiChipGrade}>{data.grade}年</span>}
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* ドリル開始ボタン */}
                        {addedKanjiSet.size > 0 && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <motion.button
                                    className="btn-primary"
                                    onClick={() => {
                                        setIsPhotoDrill(true);
                                        navigate('/drill');
                                    }}
                                    id="btn-start-extracted-drill"
                                    style={{ flex: 1.5 }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    選んだ {addedKanjiSet.size} 文字でドリル開始 <ChevronRight size={18} />
                                </motion.button>
                                <motion.button
                                    className="btn-secondary"
                                    onClick={() => {
                                        const selectedList = [...addedKanjiSet].map(findKanji).filter(Boolean);
                                        navigate('/study', { state: { kanjiList: selectedList, initialKanji: selectedList[0]?.kanji } });
                                    }}
                                    id="btn-study-extracted"
                                    style={{ flex: 1, background: 'rgba(255, 235, 153, 0.3)', borderColor: 'var(--color-primary-dark)' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <PencilLine size={18} /> さっそく覚える
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default CapturePage;
