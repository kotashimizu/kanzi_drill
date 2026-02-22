import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore.js';
import { motion } from 'framer-motion';
import styles from './GradeSelectPage.module.css';

// 学年の情報定義
const GRADE_OPTIONS = [
    { grade: 1, label: '1年生', kanji: '一', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', count: '80字' },
    { grade: 2, label: '2年生', kanji: '二', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', count: '160字' },
    { grade: 3, label: '3年生', kanji: '三', color: '#10B981', bg: 'rgba(16,185,129,0.15)', count: '200字' },
    { grade: 4, label: '4年生', kanji: '四', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', count: '202字' },
    { grade: 5, label: '5年生', kanji: '五', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', count: '193字' },
    { grade: 6, label: '6年生', kanji: '六', color: '#EC4899', bg: 'rgba(236,72,153,0.15)', count: '191字' },
];

/**
 * 学年選択ページ
 * 学年を選んでドリルに進む。選択した学年はグローバルストアに保存される。
 */
function GradeSelectPage() {
    const navigate = useNavigate();
    const { selectedGrade, setSelectedGrade } = useAppStore();

    /**
     * 学年を選択してドリルページに遷移する
     * @param {number} grade - 選択した学年
     */
    const handleGradeSelect = (grade) => {
        setSelectedGrade(grade);
        navigate('/drill');
    };

    return (
        <div style={{ padding: '60px 0 20px' }}>
            <div className="app-container">
                {/* ヘッダー */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.header}
                >
                    <button className="btn-secondary" onClick={() => navigate('/')} id="btn-back-home" style={{ marginBottom: '16px', fontSize: '0.875rem', padding: '8px 16px' }}>
                        ← もどる
                    </button>
                    <h1 className={styles.title}>📚 学年を選ぼう</h1>
                    <p className={styles.subtitle}>学習する漢字の学年を選んでね</p>
                </motion.div>

                {/* 学年グリッド */}
                <div className={styles.gradeGrid}>
                    {GRADE_OPTIONS.map((option, index) => (
                        <motion.button
                            key={option.grade}
                            className={styles.gradeCard}
                            style={{
                                background: option.bg,
                                borderColor: selectedGrade === option.grade ? option.color : 'rgba(255,255,255,0.12)',
                                boxShadow: selectedGrade === option.grade ? `0 0 20px ${option.color}44` : 'none',
                            }}
                            onClick={() => handleGradeSelect(option.grade)}
                            id={`btn-grade-${option.grade}`}
                            aria-label={`${option.label}を選択`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.08 }}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {/* 大きな漢字 */}
                            <span className={styles.kanjiDisplay} style={{ color: option.color }}>
                                {option.kanji}
                            </span>
                            <span className={styles.gradeLabel}>{option.label}</span>
                            <span className={styles.kanjiCount} style={{ color: option.color }}>{option.count}</span>

                            {/* 選択中インジケーター */}
                            {selectedGrade === option.grade && (
                                <div className={styles.selectedBadge} style={{ background: option.color }}>
                                    ✓ 選択中
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* 全学年モード */}
                <motion.button
                    className={`${styles.allGradeButton} glass-card`}
                    onClick={() => { setSelectedGrade(null); navigate('/drill'); }}
                    id="btn-all-grades"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span style={{ fontSize: '1.5rem' }}>🌟</span>
                    <div>
                        <div style={{ fontWeight: 700 }}>全学年ミックス</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>すべての漢字から出題</div>
                    </div>
                </motion.button>
            </div>
        </div>
    );
}

export default GradeSelectPage;
