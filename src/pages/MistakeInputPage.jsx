import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Trash2, CircleCheckBig } from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import styles from './MistakeInputPage.module.css';

function parseKanjiInput(text) {
    const hanChars = (text || '').match(/\p{Script=Han}/gu) || [];
    return Array.from(new Set(hanChars));
}

function MistakeInputPage() {
    const navigate = useNavigate();
    const {
        selectedGrade,
        schoolMistakeKanjiList,
        addSchoolMistakeKanji,
        clearSchoolMistakeKanji,
    } = useAppStore();

    const [inputText, setInputText] = useState('');
    const parsedKanjiList = useMemo(() => parseKanjiInput(inputText), [inputText]);
    const profileGradeLabel = selectedGrade ? `${selectedGrade}年` : '全学年';

    const savedKanjiDetails = useMemo(() => {
        return (schoolMistakeKanjiList || [])
            .map((entry) => (typeof entry === 'string' ? { kanji: entry, targetGrade: selectedGrade ?? null } : entry))
            .map((entry) => ({
                kanji: entry.kanji,
                targetGrade: entry.targetGrade ?? selectedGrade ?? null,
            }));
    }, [schoolMistakeKanjiList, selectedGrade]);

    const handleSave = () => {
        if (parsedKanjiList.length === 0) return;
        addSchoolMistakeKanji(parsedKanjiList, selectedGrade ?? null);
        setInputText('');
    };

    return (
        <div style={{ padding: '60px 0 20px' }}>
            <div className="app-container">
                <button
                    className="btn-secondary"
                    onClick={() => navigate('/')}
                    id="btn-back-home-from-mistakes"
                    style={{ marginBottom: '16px', fontSize: '0.875rem', padding: '8px 16px' }}
                >
                    <ChevronLeft size={16} /> もどる
                </button>

                <div className={`glass-card ${styles.card}`}>
                    <h1 className={styles.title}>不正解入力</h1>
                    <p className={styles.subtitle}>
                        学校の小テストでまちがえた漢字を入力してね（まとめて入力OK）
                    </p>

                    <textarea
                        className={styles.textarea}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="例：遠近法の『遠』をまちがえたら「遠」と入力"
                        rows={5}
                    />

                    <div className={styles.actions}>
                        <button
                            className="btn-primary"
                            onClick={handleSave}
                            id="btn-save-school-mistakes"
                            disabled={parsedKanjiList.length === 0}
                        >
                            <Save size={16} /> 保存する
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={clearSchoolMistakeKanji}
                            id="btn-clear-school-mistakes"
                            disabled={schoolMistakeKanjiList.length === 0}
                        >
                            <Trash2 size={16} /> 保存済みをクリア
                        </button>
                    </div>

                    <div className={styles.previewArea}>
                        <div className={styles.previewBlock}>
                            <h2 className={styles.previewTitle}>
                                <CircleCheckBig size={16} /> 保存対象
                            </h2>
                            <div className={styles.chips}>
                                {parsedKanjiList.length > 0 ? parsedKanjiList.map((kanji) => (
                                    <span key={kanji} className={styles.chip}>
                                        {kanji}（{profileGradeLabel}）
                                    </span>
                                )) : <span className={styles.emptyText}>入力中の漢字はまだありません</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`glass-card ${styles.savedCard}`}>
                    <h2 className={styles.savedTitle}>保存済みの不正解（学校）</h2>
                    <div className={styles.chips}>
                        {savedKanjiDetails.length > 0 ? savedKanjiDetails.map((item) => (
                            <span key={item.kanji} className={styles.savedChip}>
                                {item.kanji}（{item.targetGrade ? `${item.targetGrade}年` : profileGradeLabel}）
                            </span>
                        )) : <span className={styles.emptyText}>まだ保存されていません</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MistakeInputPage;
