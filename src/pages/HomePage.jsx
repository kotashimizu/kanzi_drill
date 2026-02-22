import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore.js';
import { motion } from 'framer-motion';
import styles from './HomePage.module.css';

/**
 * ホームページコンポーネント
 * アプリの玄関口。ユーザーへの挨拶と各機能へのナビゲーションを表示する
 */
function HomePage() {
    const navigate = useNavigate();
    const { userName, selectedGrade, todayCorrectCount, currentStreak } = useAppStore();

    const displayName = userName || 'なまえ未登録';

    return (
        <div className={styles.container}>
            {/* 背景の星アニメーション */}
            <div className={styles.starsBackground} aria-hidden="true">
                {[...Array(20)].map((_, index) => (
                    <div key={index} className={styles.star} style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                    }} />
                ))}
            </div>

            <div className="app-container" style={{ paddingTop: '60px' }}>
                {/* ヘッダー（挨拶） */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={styles.greetingSection}>
                        <div className={styles.avatarCircle}>✨</div>
                        <div>
                            <p className={styles.greetingText}>こんにちは！</p>
                            <h1 className={styles.userName}>{displayName} さん</h1>
                        </div>
                    </div>
                </motion.div>

                {/* 今日のスコアカード */}
                <motion.div
                    className={`glass-card ${styles.scoreCard}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h2 className={styles.scoreTitle}>📊 今日のきろく</h2>
                    <div className={styles.scoreGrid}>
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreNumber} style={{ color: '#10B981' }}>{todayCorrectCount}</span>
                            <span className={styles.scoreLabel}>せいかい</span>
                        </div>
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreNumber} style={{ color: '#F59E0B' }}>🔥 {currentStreak}</span>
                            <span className={styles.scoreLabel}>れんぞく</span>
                        </div>
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreNumber} style={{ color: '#A78BFA' }}>{selectedGrade}年</span>
                            <span className={styles.scoreLabel}>がくねん</span>
                        </div>
                    </div>
                </motion.div>

                {/* メインアクションボタン */}
                <motion.div
                    className={styles.actionGrid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {/* ドリル開始 */}
                    <button
                        className={styles.actionCard}
                        onClick={() => navigate('/grade')}
                        id="btn-start-drill"
                        aria-label="漢字ドリルを始める"
                    >
                        <span className={styles.actionIcon}>📝</span>
                        <span className={styles.actionTitle}>ドリルをする</span>
                        <span className={styles.actionDesc}>問題をといてレベルアップ！</span>
                    </button>

                    {/* 写真から問題を作る */}
                    <button
                        className={styles.actionCard}
                        onClick={() => navigate('/capture')}
                        id="btn-capture-drill"
                        aria-label="写真からドリルを作る"
                        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))' }}
                    >
                        <span className={styles.actionIcon}>📷</span>
                        <span className={styles.actionTitle}>写真からドリル</span>
                        <span className={styles.actionDesc}>ドリルを撮って問題を作ろう</span>
                    </button>

                    {/* 漢字を学ぶ */}
                    <button
                        className={styles.actionCard}
                        onClick={() => navigate('/study')}
                        id="btn-study-kanji"
                        aria-label="漢字を学ぶ"
                        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))' }}
                    >
                        <span className={styles.actionIcon}>📚</span>
                        <span className={styles.actionTitle}>漢字を学ぶ</span>
                        <span className={styles.actionDesc}>物語で漢字の意味を理解しよう</span>
                    </button>

                    {/* 進捗を見る */}
                    <button
                        className={styles.actionCard}
                        onClick={() => navigate('/progress')}
                        id="btn-view-progress"
                        aria-label="がんばりをみる"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))' }}
                    >
                        <span className={styles.actionIcon}>🏆</span>
                        <span className={styles.actionTitle}>がんばりをみる</span>
                        <span className={styles.actionDesc}>これまでの記録を確認しよう</span>
                    </button>
                </motion.div>

                {/* 科学的学習のヒント */}
                <motion.div
                    className={`glass-card ${styles.tipCard}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <p className={styles.tipText}>💡 <strong>まいにちすこしずつ</strong>が一番効果的！間隔をあけてくり返すと記憶に残りやすいよ。</p>
                </motion.div>
            </div>
        </div>
    );
}

export default HomePage;
