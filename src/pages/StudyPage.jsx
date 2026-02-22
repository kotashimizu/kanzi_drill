import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Lightbulb,
    Sparkles,
    PencilLine,
    XCircle,
    ChevronLeft
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { getKanjiByGrade, getAllKanji, findKanji } from '../data/kanjiDatabase.js';
import HandwritingCanvas from '../components/HandwritingCanvas.jsx';
import styles from './StudyPage.module.css';

/**
 * AIを使って漢字の覚え方ストーリーを生成する（ローカルのルールベース）
 * LLM API不使用のため、テンプレートベースのストーリー生成を実装
 * @param {Object} kanjiData - 漢字のデータオブジェクト
 * @returns {string} - 漢字の覚え方ストーリー
 */
function generateKanjiStory(kanjiData) {
    const { kanji, meaning, bushu, on, kun } = kanjiData;
    const mainKun = kun[0] || on[0] || '';
    const mainOn = on[0] || '';

    const storyTemplates = [
        `「${kanji}」という字は、昔の人が「${meaning}」を絵に描いたことから生まれました。部首の「${bushu}」は、この漢字のもとになっている大切な部分です。「${mainKun || mainOn}」と読むこの字を使って、「${kanji}が大きい」「${kanji}を見る」のように使ってみよう！`,
        `「${kanji}」を見てください。部首は「${bushu}」で、${meaning}に関係しています。昔の中国では、この字は絵から作られました。音読みは「${mainOn}」、訓読みは「${mainKun}」です。毎日この字を使う場面を探してみよう！`,
        `${meaning}のことを「${kanji}」と書きます。音読みで「${mainOn}」、訓読みで「${mainKun}」と読みます。部首「${bushu}」が、この漢字のカギになっています。この字が入っている言葉を5つ見つけてみよう！`,
    ];

    return storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
}

/**
 * 漢字の学習ページ（ストーリー・詳細解説）
 * 漢字を選んで部首・読み・AIストーリーで深く学ぶ
 */
function StudyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedGrade } = useAppStore();

    // 表示する漢字リスト（遷移元からの指定があればそれを使い、なければ学年別）
    const initialKanjiList = (location.state?.kanjiList && location.state.kanjiList.length > 0)
        ? location.state.kanjiList
        : (selectedGrade ? getKanjiByGrade(selectedGrade) : getAllKanji().slice(0, 40));

    const [kanjiList, setKanjiList] = useState(initialKanjiList);
    // 選択中の漢字インデックス
    const [selectedIndex, setSelectedIndex] = useState(0);
    // 生成されたストーリー
    const [story, setStory] = useState('');
    // ストーリー生成中フラグ
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    // 練習モード中フラグ
    const [isPracticeMode, setIsPracticeMode] = useState(false);

    // 遷移時に特定の漢字が指定されている場合の処理
    useEffect(() => {
        if (location.state?.initialKanji) {
            const index = kanjiList.findIndex(k => k.kanji === location.state.initialKanji);
            if (index !== -1) {
                setSelectedIndex(index);
            }
        }
    }, [location.state, kanjiList]);

    const selectedKanji = kanjiList[selectedIndex];

    /**
     * 漢字を選んで詳細を表示する
     * @param {number} index - 選択した漢字のインデックス
     */
    const handleSelectKanji = (index) => {
        setSelectedIndex(index);
        setStory('');
        setIsPracticeMode(false); // 漢字を変えたら練習モードは一度オフにする
    };

    /**
     * ストーリー生成ボタンのクリック処理
     */
    const handleGenerateStory = async () => {
        if (!selectedKanji) return;
        setIsGeneratingStory(true);
        setStory('');

        // ローディング演出（テンプレートは即時ですがAPIを呼ぶ場合に備えて）
        await new Promise((resolve) => setTimeout(resolve, 800));
        const generatedStory = generateKanjiStory(selectedKanji);
        setStory(generatedStory);
        setIsGeneratingStory(false);
    };

    if (!selectedKanji) {
        return <div style={{ padding: '100px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>漢字が見つかりません</div>;
    }

    return (
        <div style={{ padding: '60px 0 20px' }}>
            <div className="app-container">
                {/* ヘッダー */}
                <div className={styles.header}>
                    <button className="btn-secondary" onClick={() => navigate('/')} id="btn-back-from-study" style={{ fontSize: '0.8rem', padding: '8px 14px', marginBottom: '12px' }}>
                        <ChevronLeft size={16} /> もどる
                    </button>
                    <h1 className={styles.title}>
                        <BookOpen size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                        漢字を学ぼう
                    </h1>
                    <p className={styles.subtitle}>{selectedGrade ? `${selectedGrade}年生の漢字` : '全学年'}</p>
                </div>

                {/* 漢字詳細カード */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedIndex}
                        className={`glass-card ${styles.detailCard}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                    >
                        {isPracticeMode ? (
                            /* 手書き練習モード */
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key="practice-mode"
                            >
                                <div className={styles.practiceHeader}>
                                    <p className={styles.practiceHint}>「{selectedKanji.kanji}」をなぞって書いてみよう！</p>
                                    <button
                                        className={styles.exitPracticeBtn}
                                        onClick={() => setIsPracticeMode(false)}
                                        id="btn-exit-practice"
                                    >
                                        <XCircle size={20} /> とじる
                                    </button>
                                </div>
                                <HandwritingCanvas kanji={selectedKanji.kanji} />
                                <p className={styles.practiceTip}>指やペンで画面をなぞって練習してね</p>
                            </motion.div>
                        ) : (
                            /* 詳細表示モード */
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key="detail-mode"
                            >
                                {/* メインの大きな漢字 */}
                                <div className={styles.kanjiHero}>{selectedKanji.kanji}</div>

                                {/* 基本情報グリッド */}
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>音読み</span>
                                        <span className={styles.infoValue}>{selectedKanji.on.join('・') || 'なし'}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>訓読み</span>
                                        <span className={styles.infoValue}>{selectedKanji.kun.join('・') || 'なし'}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>部首</span>
                                        <span className={styles.infoValue}>{selectedKanji.bushu}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>画数</span>
                                        <span className={styles.infoValue}>{selectedKanji.strokes}画</span>
                                    </div>
                                </div>

                                {/* 意味 */}
                                <div className={styles.meaningSection}>
                                    <span className={styles.meaningLabel}><Lightbulb size={18} /> 意味</span>
                                    <p className={styles.meaningText}>{selectedKanji.meaning}</p>
                                </div>

                                <div className={styles.studyActions}>
                                    <button
                                        className="btn-primary"
                                        onClick={handleGenerateStory}
                                        id="btn-generate-story"
                                        disabled={isGeneratingStory}
                                        style={{ flex: 1 }}
                                    >
                                        {isGeneratingStory ? <Sparkles size={18} className="spin" /> : <Sparkles size={18} />}
                                        {isGeneratingStory ? '作成中...' : '物語で覚える'}
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setIsPracticeMode(true)}
                                        id="btn-start-practice"
                                        style={{ flex: 1, background: 'rgba(255, 235, 153, 0.3)', borderColor: 'var(--color-primary-dark)' }}
                                    >
                                        <PencilLine size={18} /> 手書き練習
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {story && (
                                        <motion.div
                                            className={styles.storyBox}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <p className={styles.storyText}>
                                                <BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                                {story}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* 漢字一覧（横スクロール） */}
                <h2 className={styles.listTitle}>漢字いちらん</h2>
                <div className={styles.kanjiListWrapper}>
                    <div className={styles.kanjiList}>
                        {kanjiList.map((kanjiItem, index) => (
                            <motion.button
                                key={kanjiItem.kanji}
                                className={`${styles.kanjiListItem} ${selectedIndex === index ? styles.kanjiListItemActive : ''}`}
                                onClick={() => handleSelectKanji(index)}
                                id={`btn-study-kanji-${kanjiItem.kanji}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {kanjiItem.kanji}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudyPage;
