import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore.js';
import { getKanjiByGrade, getAllKanji } from '../data/kanjiDatabase.js';
import styles from './ProgressPage.module.css';

// ボックスレベルに対応するラベルと色
const BOX_LEVEL_INFO = [
    { label: '学習前', color: '#6B7280', emoji: '⬜' },
    { label: 'みならい', color: '#F59E0B', emoji: '🟡' },
    { label: 'れんしゅう中', color: '#3B82F6', emoji: '🔵' },
    { label: 'おぼえた！', color: '#10B981', emoji: '🟢' },
    { label: 'かんぺき！', color: '#8B5CF6', emoji: '🟣' },
    { label: '達人！', color: '#EC4899', emoji: '⭐' },
];

/**
 * 学習進捗ページ
 * 漢字ごとのSRSレベル、今日のスコア、全体の達成率を表示する
 */
function ProgressPage() {
    const navigate = useNavigate();
    const {
        selectedGrade,
        kanjiProgress,
        todayCorrectCount,
        todayIncorrectCount,
        currentStreak,
        maxStreak,
        userName,
    } = useAppStore();

    // 全漢字リスト
    const kanjiList = selectedGrade ? getKanjiByGrade(selectedGrade) : getAllKanji().slice(0, 40);

    // 各ボックスレベルの漢字数をカウントする
    const levelCounts = BOX_LEVEL_INFO.map((_, level) =>
        kanjiList.filter((k) => (kanjiProgress[k.kanji]?.boxLevel ?? 0) === level).length
    );

    // マスター済み（ボックス4以上）の数
    const masteredCount = kanjiList.filter((k) => (kanjiProgress[k.kanji]?.boxLevel ?? 0) >= 4).length;
    const masteredPercentage = kanjiList.length > 0 ? Math.round((masteredCount / kanjiList.length) * 100) : 0;

    // 総解答数
    const totalAnswers = todayCorrectCount + todayIncorrectCount;
    const accuracyRate = totalAnswers > 0 ? Math.round((todayCorrectCount / totalAnswers) * 100) : 0;

    return (
        <div style={{ padding: '60px 0 20px' }}>
            <div className="app-container">
                {/* ヘッダー */}
                <div className={styles.header}>
                    <button className="btn-secondary" onClick={() => navigate('/')} id="btn-back-from-progress" style={{ fontSize: '0.8rem', padding: '8px 14px', marginBottom: '12px' }}>
                        ← もどる
                    </button>
                    <h1 className={styles.title}>🏆 がんばりをみる</h1>
                    <p className={styles.subtitle}>{userName ? `${userName} さんの記録` : '学習記録'}</p>
                </div>

                {/* 今日のスコアカード */}
                <motion.div
                    className={`glass-card ${styles.statsCard}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className={styles.cardTitle}>📊 今日のきろく</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue} style={{ color: '#10B981' }}>{todayCorrectCount}</span>
                            <span className={styles.statLabel}>せいかい</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue} style={{ color: '#EF4444' }}>{todayIncorrectCount}</span>
                            <span className={styles.statLabel}>まちがい</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue} style={{ color: '#F59E0B' }}>{accuracyRate}%</span>
                            <span className={styles.statLabel}>せいかいりつ</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue} style={{ color: '#A78BFA' }}>🔥 {currentStreak}</span>
                            <span className={styles.statLabel}>れんぞく</span>
                        </div>
                    </div>
                    <div className={styles.maxStreak}>最大ストリーク：🔥 {maxStreak} 連続</div>
                </motion.div>

                {/* マスター達成率 */}
                <motion.div
                    className={`glass-card ${styles.masteryCard}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className={styles.masteryHeader}>
                        <h2 className={styles.cardTitle}>⚡ マスター率</h2>
                        <span className={styles.masteryPercentage}>{masteredPercentage}%</span>
                    </div>
                    <div className={styles.masteryBar}>
                        <motion.div
                            className={styles.masteryFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${masteredPercentage}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                        />
                    </div>
                    <p className={styles.masteryDetail}>{masteredCount} / {kanjiList.length} 文字がかんぺき！</p>
                </motion.div>

                {/* SRSレベル別内訳 */}
                <motion.div
                    className={`glass-card ${styles.levelCard}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className={styles.cardTitle}>📈 ボックス別の漢字</h2>
                    <div className={styles.levelList}>
                        {BOX_LEVEL_INFO.map((levelInfo, level) => (
                            <div key={level} className={styles.levelItem}>
                                <span className={styles.levelEmoji}>{levelInfo.emoji}</span>
                                <div className={styles.levelInfo}>
                                    <span className={styles.levelLabel}>{levelInfo.label}</span>
                                    <div className={styles.levelBar}>
                                        <motion.div
                                            className={styles.levelBarFill}
                                            style={{ background: levelInfo.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: kanjiList.length > 0 ? `${(levelCounts[level] / kanjiList.length) * 100}%` : '0%' }}
                                            transition={{ duration: 0.8, delay: 0.3 + level * 0.08 }}
                                        />
                                    </div>
                                </div>
                                <span className={styles.levelCount} style={{ color: levelInfo.color }}>{levelCounts[level]}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ドリルを始めるCTAボタン */}
                <motion.button
                    className="btn-primary"
                    onClick={() => navigate('/grade')}
                    id="btn-start-from-progress"
                    style={{ width: '100%', marginTop: '8px' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    📝 ドリルをやってレベルアップ！
                </motion.button>
            </div>
        </div>
    );
}

export default ProgressPage;
