import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    CheckCircle2,
    XCircle,
    Trophy,
    Star,
    ThumbsUp,
    ChevronRight,
    RotateCcw,
    Home,
    Search,
    BookOpen,
    Pencil
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { getKanjiByGrade, getAllKanji } from '../data/kanjiDatabase.js';
import HandwritingCanvas from '../components/HandwritingCanvas.jsx';
import confetti from 'canvas-confetti';
import styles from './DrillPage.module.css';

// 問題の種類
const QUESTION_MODES = {
    READING: 'reading',  // 読み方問題
    MEANING: 'meaning',  // 意味当て問題
    WRITING: 'writing',  // 書き取り問題（NEW）
};

/**
 * ランダムに配列をシャッフルする（Fisher-Yatesアルゴリズム）
 * @param {Array} array - シャッフルする配列
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 選択肢（正解1つ＋ダミー3つ）を生成する
 * @param {Object} correctKanji - 正解の漢字データ
 * @param {Array} allKanjiList - 全漢字リスト（ダミー選択肢用）
 * @param {string} mode - 問題モード
 */
function generateChoices(correctKanji, allKanjiList, mode) {
    const correctAnswer = mode === QUESTION_MODES.READING
        ? [...correctKanji.on, ...correctKanji.kun][0] || '?'
        : correctKanji.meaning;

    // ダミー選択肢を作る（正解と重複しないものを3つ）
    const distractors = allKanjiList
        .filter((k) => k.kanji !== correctKanji.kanji)
        .map((k) => mode === QUESTION_MODES.READING ? [...k.on, ...k.kun][0] : k.meaning)
        .filter((answer, index, self) => answer && answer !== correctAnswer && self.indexOf(answer) === index)
        .slice(0, 3);

    return shuffleArray([correctAnswer, ...distractors]);
}

/**
 * 漢字ドリルの問題出題ページ（メインのゲーム画面）
 * SRSに基づいて問題を出題し、正解・不正解に応じてレベル管理する
 */
function DrillPage() {
    const navigate = useNavigate();
    const { selectedGrade, recordAnswer, updateKanjiProgress, kanjiProgress, extractedKanjiList, isPhotoDrill } = useAppStore();

    // キャンバス操作用のref
    const handwritingRef = useRef(null);

    // 問題リスト（シャッフル済み）
    const [questionQueue, setQuestionQueue] = useState([]);
    // 現在の問題インデックス
    const [currentIndex, setCurrentIndex] = useState(0);
    // 選択した答え（null=未選択）
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    // 正解かどうか
    const [isCorrect, setIsCorrect] = useState(null);
    // 選択肢リスト
    const [choices, setChoices] = useState([]);
    // 現在の問題モード
    const [questionMode, setQuestionMode] = useState(QUESTION_MODES.READING);
    // セッション内のスコア
    const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
    // セッション終了フラグ
    const [isSessionComplete, setIsSessionComplete] = useState(false);
    // AI判定中フラグ
    const [isCheckingAI, setIsCheckingAI] = useState(false);

    // 漢字リストを初期化する
    const allKanjiList = isPhotoDrill ? extractedKanjiList : (selectedGrade ? getKanjiByGrade(selectedGrade) : getAllKanji());

    useEffect(() => {
        if (allKanjiList.length === 0) return;

        if (isPhotoDrill) {
            // 写真ドリルの場合は抽出されたものすべて（シャッフルのみ）
            setQuestionQueue(shuffleArray(allKanjiList));
            setQuestionMode(QUESTION_MODES.WRITING); // テスト対策なので書き取りをデフォルトに
        } else {
            // 通常は最大15問にシャッフル
            const shuffled = shuffleArray(allKanjiList).slice(0, 15);
            setQuestionQueue(shuffled);
        }
    }, [selectedGrade, isPhotoDrill]);

    // 現在の問題の選択肢を生成する
    useEffect(() => {
        if (questionQueue.length === 0 || currentIndex >= questionQueue.length) return;
        const currentKanji = questionQueue[currentIndex];
        const newChoices = generateChoices(currentKanji, allKanjiList, questionMode);
        setChoices(newChoices);
        setSelectedAnswer(null);
        setIsCorrect(null);
    }, [currentIndex, questionQueue, questionMode]);

    // 現在の問題データ
    const currentKanji = questionQueue[currentIndex];
    const correctAnswer = currentKanji
        ? questionMode === QUESTION_MODES.READING
            ? [...currentKanji.on, ...currentKanji.kun][0]
            : currentKanji.meaning
        : null;

    /**
     * AI（Tesseract.js）を使って手書き文字を判定する
     */
    const handleCheckWithAI = async () => {
        if (!handwritingRef.current || !currentKanji) return;

        const imageData = handwritingRef.current.getDataURL();
        if (!imageData) return;

        setIsCheckingAI(true);
        setSelectedAnswer('checked'); // 判定モードへ

        try {
            const Tesseract = await import('tesseract.js');
            const { data: { text } } = await Tesseract.recognize(imageData, 'jpn');

            // 抽出されたテキストに正解の漢字が含まれているかチェック
            const isAiCorrect = text.includes(currentKanji.kanji);

            if (isAiCorrect) {
                setIsCorrect(true);
                recordAnswer(true);
                setSessionScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
                confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#6C63FF', '#EC4899', '#F59E0B'] });
            } else {
                // 自動判定で間違っていた場合は、セルフ採点ボタンを出すために isCorrect は null のままにする
                setIsCorrect(null);
            }
        } catch (error) {
            console.error('AI判定エラー:', error);
        } finally {
            setIsCheckingAI(false);
        }
    };

    /**
     * 選択肢を選んだときの処理
     * @param {string} answer - 選んだ答え
     */
    const handleAnswerSelect = useCallback((answer) => {
        if (selectedAnswer !== null) return; // 既に回答済みなら無視

        const correct = answer === correctAnswer;
        setSelectedAnswer(answer);
        setIsCorrect(correct);
        recordAnswer(correct);
        setSessionScore((prev) => ({
            correct: prev.correct + (correct ? 1 : 0),
            total: prev.total + 1,
        }));

        // 正解ならconfettiを発射
        if (correct) {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#6C63FF', '#EC4899', '#F59E0B'] });
        } else if (isPhotoDrill) {
            // 写真ドリル（テスト対策）で間違えた場合は、キューの最後に追加してもう一度出題
            setQuestionQueue(prev => [...prev, currentKanji]);
        }
    }, [selectedAnswer, correctAnswer, recordAnswer, isPhotoDrill, currentKanji]);

    /**
     * 次の問題に進む
     */
    const handleNextQuestion = useCallback(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= questionQueue.length) {
            setIsSessionComplete(true);
        } else {
            setCurrentIndex(nextIndex);
        }
    }, [currentIndex, questionQueue.length]);

    // セッション終了画面
    if (isSessionComplete) {
        const scoreRatio = sessionScore.correct / sessionScore.total;

        return (
            <div style={{ padding: '60px 0' }}>
                <div className="app-container">
                    <motion.div
                        className={`glass-card ${styles.resultCard}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                    >
                        <div className={styles.resultEmoji}>
                            {scoreRatio >= 0.8 ? <Trophy size={80} color="#F59E0B" /> :
                                scoreRatio >= 0.5 ? <Star size={80} color="#F59E0B" /> :
                                    <ThumbsUp size={80} color="#3B82F6" />}
                        </div>
                        <h2 className={styles.resultTitle}>
                            {isPhotoDrill ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Camera size={24} /> テスト対策かんりょう！
                                </span>
                            ) : 'ドリルかんりょう！'}
                        </h2>
                        <div className={styles.resultScore}>
                            <span className={styles.resultNumber}>{sessionScore.correct}</span>
                            <span className={styles.resultDivider}>/</span>
                            <span className={styles.resultTotal}>{sessionScore.total}</span>
                            <span className={styles.resultUnit}>問正解</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn-primary" onClick={() => { setCurrentIndex(0); setSessionScore({ correct: 0, total: 0 }); setIsSessionComplete(false); const shuffled = shuffleArray(allKanjiList).slice(0, 15); setQuestionQueue(shuffled); }} id="btn-retry-drill">
                                <RotateCcw size={18} /> もう一度
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/')} id="btn-home-from-result">
                                <Home size={18} /> ホームへ
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!currentKanji) {
        return <div style={{ padding: '100px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>読み込み中...</div>;
    }

    const progressRatio = (currentIndex / questionQueue.length) * 100;

    return (
        <div style={{ padding: '60px 0 20px' }}>
            <div className="app-container">
                {/* ヘッダー・進捗バー */}
                <div className={styles.header}>
                    <button className="btn-secondary" onClick={() => navigate('/grade')} id="btn-back-grade" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                        ← もどる
                    </button>
                    <div className={styles.progressInfo}>
                        <span className={styles.progressText}>{currentIndex + 1} / {questionQueue.length}</span>
                        <span className={styles.modeSelector}>
                            <button
                                className={questionMode === QUESTION_MODES.READING ? styles.modeActive : styles.modeInactive}
                                onClick={() => { setQuestionMode(QUESTION_MODES.READING); setSelectedAnswer(null); setIsCorrect(null); }}
                                id="btn-mode-reading"
                            >読み</button>
                            <button
                                className={questionMode === QUESTION_MODES.MEANING ? styles.modeActive : styles.modeInactive}
                                onClick={() => { setQuestionMode(QUESTION_MODES.MEANING); setSelectedAnswer(null); setIsCorrect(null); }}
                                id="btn-mode-meaning"
                            >意味</button>
                            <button
                                className={questionMode === QUESTION_MODES.WRITING ? styles.modeActive : styles.modeInactive}
                                onClick={() => { setQuestionMode(QUESTION_MODES.WRITING); setSelectedAnswer(null); setIsCorrect(null); }}
                                id="btn-mode-writing"
                            >書き</button>
                        </span>
                    </div>
                </div>

                {/* プログレスバー */}
                <div className={styles.progressBar}>
                    <motion.div
                        className={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressRatio}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                {/* 問題カード */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${currentIndex}-${questionMode}`}
                        className={`glass-card ${styles.questionCard} ${questionMode === QUESTION_MODES.WRITING ? styles.writingCard : ''}`}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* 学年バッジ / モードバッジ */}
                        <div className={`grade-badge ${isPhotoDrill ? 'grade-badge-test' : `grade-badge-${currentKanji.grade || selectedGrade || 1}`}`}>
                            {isPhotoDrill && <Camera size={14} style={{ marginRight: '4px' }} />}
                            {isPhotoDrill ? 'テスト対策モード' : `${currentKanji.grade || selectedGrade}年生`}
                        </div>

                        {/* 問題文 */}
                        <p className={styles.questionLabel}>
                            {questionMode === QUESTION_MODES.READING ? 'この漢字の読みかたは？' :
                                questionMode === QUESTION_MODES.MEANING ? 'この漢字の意味は？' :
                                    '読みから漢字を書いてみよう！'}
                        </p>

                        {questionMode === QUESTION_MODES.WRITING ? (
                            /* 書き取りモードのメイン表示（穴埋め形式） */
                            <div className={styles.writingPrompt}>
                                <div className={styles.writingReadings}>
                                    <span className={styles.onReading}>{currentKanji.on.join('・')}</span>
                                    <span className={styles.kunReading}>{currentKanji.kun.join('・')}</span>
                                </div>
                                <div className={styles.writingBracketWrapper}>
                                    <span className={styles.bracket}>（</span>
                                    <span className={styles.bracketGap}>&nbsp;</span>
                                    <span className={styles.bracket}>）</span>
                                </div>
                                <div className={styles.writingMeaning}>{currentKanji.meaning}</div>
                            </div>
                        ) : (
                            /* 読み・意味モードのメイン表示（漢字） */
                            <div
                                className={styles.kanjiMain}
                                style={{
                                    animation: isCorrect === false ? 'shake 0.4s ease' : 'none',
                                }}
                            >
                                {currentKanji.kanji}
                            </div>
                        )}

                        {/* 部首情報（書き取りモードでは答えが出るまで隠す） */}
                        {(questionMode !== QUESTION_MODES.WRITING || selectedAnswer === 'checked') && (
                            <p className={styles.bushuInfo}>部首：{currentKanji.bushu}　{currentKanji.strokes}画</p>
                        )}
                    </motion.div>
                </AnimatePresence>

                {questionMode === QUESTION_MODES.WRITING ? (
                    /* 書き取り用キャンバスと操作エリア */
                    <div className={styles.writingArea}>
                        <div className={styles.canvasWrapper}>
                            {/* keyを currentIndex と questionMode にすることで、確実にリセットされる */}
                            <HandwritingCanvas
                                key={`${currentIndex}-${questionMode}`}
                                ref={handwritingRef}
                                kanji={currentKanji.kanji}
                                hideExample={selectedAnswer !== 'checked'}
                            />
                        </div>

                        <div className={styles.writingActions}>
                            {selectedAnswer === null ? (
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', position: 'relative' }}
                                    onClick={handleCheckWithAI}
                                    id="btn-check-ai"
                                    disabled={isCheckingAI}
                                >
                                    <Search size={18} /> {isCheckingAI ? 'AI判定中...' : 'AIで答え合わせ'}
                                </button>
                            ) : (selectedAnswer === 'checked' && isCorrect === null) ? (
                                <div className={styles.selfGradeButtons}>
                                    <button
                                        className={styles.gradeButtonWrong}
                                        onClick={() => {
                                            setIsCorrect(false);
                                            recordAnswer(false);
                                            setSessionScore(prev => ({ ...prev, total: prev.total + 1 }));
                                            if (isPhotoDrill) {
                                                // キューの最後に追加して復習
                                                setQuestionQueue(prev => [...prev, currentKanji]);
                                            }
                                        }}
                                        id="btn-grade-wrong"
                                    >
                                        <XCircle size={18} /> わすれた
                                    </button>
                                    <button
                                        className={styles.gradeButtonCorrect}
                                        onClick={() => {
                                            setIsCorrect(true);
                                            recordAnswer(true);
                                            setSessionScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
                                            confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#6C63FF', '#EC4899', '#F59E0B'] });
                                        }}
                                        id="btn-grade-correct"
                                    >
                                        <CheckCircle2 size={18} /> できた！
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {/* 「わからなかったら答えを見る」の補助オプション */}
                        {selectedAnswer === null && !isCheckingAI && (
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    className={styles.showAnswerLink}
                                    onClick={() => setSelectedAnswer('checked')}
                                >
                                    <BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                    答えをみる
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 選択肢ボタン（読み・意味モード用） */
                    <div className={styles.choicesGrid}>
                        {choices.map((choice, index) => {
                            let buttonStyle = '';
                            if (selectedAnswer !== null) {
                                if (choice === correctAnswer) buttonStyle = styles.choiceCorrect;
                                else if (choice === selectedAnswer) buttonStyle = styles.choiceWrong;
                                else buttonStyle = styles.choiceDisabled;
                            }

                            return (
                                <motion.button
                                    key={`${currentIndex}-${index}`}
                                    className={`${styles.choiceButton} ${buttonStyle}`}
                                    onClick={() => handleAnswerSelect(choice)}
                                    id={`btn-choice-${index}`}
                                    disabled={selectedAnswer !== null}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.06 }}
                                    whileHover={selectedAnswer === null ? { scale: 1.03 } : {}}
                                    whileTap={selectedAnswer === null ? { scale: 0.97 } : {}}
                                >
                                    <span className={styles.choiceIndex}>{['A', 'B', 'C', 'D'][index]}</span>
                                    <span className={styles.choiceText}>{choice}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                )}

                {/* 正解・不正解フィードバック */}
                <AnimatePresence>
                    {((selectedAnswer !== null && questionMode !== QUESTION_MODES.WRITING) || isCorrect !== null) && (
                        <motion.div
                            className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className={styles.feedbackIcon}>
                                {isCorrect ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <CheckCircle2 size={24} /> せいかい！
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <XCircle size={24} /> ざんねん...
                                    </span>
                                )}
                            </div>

                            {/* おぼえるための仕掛け：テスト対策モード時は詳細情報を表示 */}
                            {isPhotoDrill && (
                                <div className={styles.studyTip}>
                                    <div className={styles.tipRow}>
                                        <span className={styles.tipLabel}>部首</span>
                                        <span className={styles.tipValue}>{currentKanji.bushu}</span>
                                        <span className={styles.tipLabel} style={{ marginLeft: '12px' }}>画数</span>
                                        <span className={styles.tipValue}>{currentKanji.strokes}画</span>
                                    </div>
                                    <div className={styles.tipMeaning}>{currentKanji.meaning}</div>
                                </div>
                            )}

                            {questionMode !== QUESTION_MODES.WRITING && !isCorrect && (
                                <div className={styles.feedbackAnswer}>正解は「{correctAnswer}」</div>
                            )}
                            <button className="btn-primary" onClick={handleNextQuestion} id="btn-next-question" style={{ marginTop: '12px', width: '100%' }}>
                                {currentIndex + 1 >= questionQueue.length ? 'けっかをみる' : 'つぎの問題'}
                                <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default DrillPage;
