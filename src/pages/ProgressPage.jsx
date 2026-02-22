import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Trophy,
    BarChart3,
    Flame,
    Zap,
    Crown,
    Gem,
    Sprout,
    Bird,
    Target,
    LineChart,
    Pencil,
    ChevronLeft
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { getKanjiByGrade, getAllKanji } from '../data/kanjiDatabase.js';
import styles from './ProgressPage.module.css';

// ボックスレベルに対応するラベルと色とアイコン
const BOX_LEVEL_INFO = [
    { label: 'スタート！', color: '#B2BEC3', icon: <Sprout size={18} /> },
    { label: 'みならい', color: '#FF9F43', icon: <Bird size={18} /> },
    { label: 'がんばり屋', color: '#54A0FF', icon: <Target size={18} /> },
    { label: 'おぼえた！', color: '#1DD1A1', icon: <Zap size={18} /> },
    { label: 'かんぺき', color: '#5F27CD', icon: <Crown size={18} /> },
    { label: '漢字マスター', color: '#EE5253', icon: <Gem size={18} /> },
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
                        <ChevronLeft size={16} /> もどる
                    </button>
                    <h1 className={styles.title}>
                        <Trophy size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                        がんばりをみる
                    </h1>
                    <p className={styles.subtitle}>{userName ? `${userName} さんの記録` : '学習記録'}</p>
                </div>

                {/* 今日のスコアカード */}
                <motion.div
                    className={`glass-card ${styles.statsCard}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className={styles.cardTitle}>
                        <BarChart3 size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        今日のきろく
                    </h2>
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
                            <span className={styles.statValue} style={{ color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <Flame size={20} fill="#A78BFA" /> {currentStreak}
                            </span>
                            <span className={styles.statLabel}>れんぞく</span>
                        </div>
                    </div>
                    <div className={styles.maxStreak}>
                        最大ストリーク：<Flame size={14} style={{ verticalAlign: 'middle' }} /> {maxStreak} 連続
                    </div>
                </motion.div>

                {/* マスター達成率 */}
                <motion.div
                    className={`glass-card ${styles.masteryCard}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className={styles.masteryHeader}>
                        <h2 className={styles.cardTitle}>
                            <Zap size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            マスター率
                        </h2>
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
                    <h2 className={styles.cardTitle}>
                        <LineChart size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        ボックス別の漢字
                    </h2>
                    <div className={styles.levelList}>
                        {BOX_LEVEL_INFO.map((levelInfo, level) => (
                            <div key={level} className={styles.levelItem}>
                                <span className={styles.levelEmoji} style={{ color: levelInfo.color }}>{levelInfo.icon}</span>
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
                    <Pencil size={18} /> ドリルをやってレベルアップ！
                </motion.button>
            </div>
        </div>
    );
}

export default ProgressPage;
