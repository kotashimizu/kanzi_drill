import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Target,
    PencilLine,
    Camera,
    BookOpen,
    Trophy,
    Lightbulb,
    Flame,
    GraduationCap,
    Pencil
} from 'lucide-react';
import styles from './HomePage.module.css';

/**
 * ホームページコンポーネント
 * アプリの玄関口。ユーザーへの挨拶と各機能へのナビゲーションを表示する
 */
function HomePage() {
    const navigate = useNavigate();
    const {
        userName,
        setUserName,
        selectedGrade,
        todayCorrectCount,
        currentStreak,
        extractedKanjiList,
        setIsPhotoDrill
    } = useAppStore();

    // 名前登録モーダルの表示状態
    const [showNameModal, setShowNameModal] = useState(false);
    // 入力中の名前
    const [tempName, setTempName] = useState(userName);

    // 名前が登録されていない場合はモーダルを表示
    useEffect(() => {
        if (!userName) {
            setShowNameModal(true);
        }
    }, [userName]);

    /**
     * 名前の保存処理
     */
    const handleSaveName = () => {
        if (tempName.trim()) {
            setUserName(tempName.trim());
            setShowNameModal(false);
        }
    };

    const displayName = userName || 'なまえ未登録';

    return (
        <div className={styles.container}>
            {/* 名前登録モーダル */}
            <AnimatePresence>
                {showNameModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                        >
                            <div className={styles.modalMascot}>
                                <img src="/src/assets/study_mascot_helper.png" alt="マスコット" className={styles.mascotImage} style={{ animation: 'float 3s ease-in-out infinite' }} />
                            </div>
                            <h2 className={styles.modalTitle}>こんにちは！</h2>
                            <p className={styles.modalSubtitle}>あなたの おなまえを おしえてね</p>
                            <input
                                type="text"
                                className={styles.nameInput}
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                placeholder="おなまえ"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            />
                            <div className={styles.modalActions}>
                                <button
                                    className="btn-primary"
                                    onClick={handleSaveName}
                                    disabled={!tempName.trim()}
                                >
                                    きめる！
                                </button>
                                {userName && (
                                    <button
                                        className="btn-secondary"
                                        onClick={() => { setShowNameModal(false); setTempName(userName); }}
                                    >
                                        キャンセル
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={styles.greetingSection}>
                        <div className={styles.mascotWrapper}>
                            <img src="/src/assets/study_mascot_helper.png" alt="マスコット" className={styles.mascotImage} style={{ animation: 'float 3s ease-in-out infinite' }} />
                        </div>
                        <div className={styles.greetingContent}>
                            <p className={styles.greetingText}>いっしょに おべんきょう しよう！</p>
                            <div
                                className={styles.userNameContainer}
                                onClick={() => { setTempName(userName); setShowNameModal(true); }}
                                title="なまえをかえる"
                            >
                                <h1 className={styles.userName}>{displayName} ちゃん・くん</h1>
                                <Pencil size={18} className={styles.editIcon} />
                            </div>
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
                    <h2 className={styles.scoreTitle}>
                        <BarChart3 size={20} style={{ color: 'var(--color-text-secondary)' }} />
                        今日のきろく
                    </h2>
                    <div className={styles.scoreGrid}>
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreNumber} style={{ color: '#059669' }}>{todayCorrectCount}</span>
                            <span className={styles.scoreLabel}>せいかい</span>
                        </div>
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreNumber} style={{ color: '#D97706' }}>
                                <Flame size={20} fill="#F59E0B" style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                                {currentStreak}
                            </span>
                            <span className={styles.scoreLabel}>れんぞく</span>
                        </div>
                        <div className={styles.scoreItem}>
                            <span className={styles.scoreNumber} style={{ color: '#7C3AED' }}>
                                <GraduationCap size={20} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                {selectedGrade || '全'}
                            </span>
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
                    {/* 写真から抽出した漢字がある場合のみ表示されるテスト対策ドリル */}
                    {extractedKanjiList.length > 0 && (
                        <button
                            className={`${styles.actionCard} ${styles.actionCardHighlight}`}
                            onClick={() => {
                                setIsPhotoDrill(true);
                                navigate('/drill');
                            }}
                            id="btn-start-test-prep"
                            aria-label="テスト対策ドリルを始める"
                        >
                            <div className={styles.badgeTop}>テストにでる！</div>
                            <span className={styles.actionIcon}><Target size={40} strokeWidth={2.5} color="#D97706" /></span>
                            <span className={styles.actionTitle}>テスト対策ドリル</span>
                            <span className={styles.actionDesc}>撮った {extractedKanjiList.length} 文字を完璧にしよう！</span>
                        </button>
                    )}

                    {/* ドリル開始 */}
                    <button
                        className={styles.actionCard}
                        onClick={() => navigate('/grade')}
                        id="btn-start-drill"
                        aria-label="漢字ドリルを始める"
                        style={{ backgroundColor: 'var(--color-primary)', borderColor: '#F5D142' }}
                    >
                        <span className={styles.actionIcon}><PencilLine size={40} strokeWidth={2.5} color="#B45309" /></span>
                        <span className={styles.actionTitle}>ドリルをする</span>
                        <span className={styles.actionDesc}>問題をといてレベルアップ！</span>
                    </button>

                    {/* 写真から問題を作る */}
                    <button
                        className={styles.actionCard}
                        onClick={() => navigate('/capture')}
                        id="btn-capture-drill"
                        aria-label="写真からドリルを作る"
                        style={{ backgroundColor: 'var(--color-cyan)', borderColor: '#4ECDC4' }}
                    >
                        <span className={styles.actionIcon}><Camera size={40} strokeWidth={2.5} color="#0891B2" /></span>
                        <span className={styles.actionTitle}>写真からドリル</span>
                        <span className={styles.actionDesc}>ドリルを撮って問題を作ろう</span>
                    </button>

                    {/* 漢字を学ぶ */}
                    <button
                        className={styles.actionCard}
                        onClick={() => navigate('/study')}
                        id="btn-study-kanji"
                        aria-label="漢字を学ぶ"
                        style={{ backgroundColor: 'var(--color-success)', borderColor: '#1DD1A1' }}
                    >
                        <span className={styles.actionIcon}><BookOpen size={40} strokeWidth={2.5} color="#059669" /></span>
                        <span className={styles.actionTitle}>漢字を学ぶ</span>
                        <span className={styles.actionDesc}>物語で漢字の意味を理解しよう</span>
                    </button>

                    {/* 進捗を見る */}
                    <button
                        className={styles.actionCard}
                        onClick={() => navigate('/progress')}
                        id="btn-view-progress"
                        aria-label="がんばりをみる"
                        style={{ backgroundColor: 'var(--color-accent)', borderColor: '#FF8FAB' }}
                    >
                        <span className={styles.actionIcon}><Trophy size={40} strokeWidth={2.5} color="#BE185D" /></span>
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
                    <p className={styles.tipText}>
                        <Lightbulb size={20} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#F59E0B' }} />
                        <strong>まいにちすこしずつ</strong>が一番効果的！間隔をあけてくり返すと記憶に残りやすいよ。
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default HomePage;
