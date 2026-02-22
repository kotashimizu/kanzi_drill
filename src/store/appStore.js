/**
 * アプリ全体の状態管理ストア（Zustand）
 * ユーザーの学習進捗、設定、現在のセッション情報を管理する
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * アプリのグローバル状態ストア
 * LocalStorageに永続化される
 */
export const useAppStore = create(
    persist(
        (set, get) => ({
            // --- ユーザー設定 ---
            // 選択中の学年（1〜6、nullは全学年）
            selectedGrade: 1,
            // ユーザー名
            userName: '',
            // ユーザー敬称（ちゃん / くん）
            userHonorific: 'ちゃん',

            // --- 学習進捗データ ---
            // 各漢字のSRS状態（kanjiCharacter -> SRSカードデータ）
            kanjiProgress: {},

            // --- 現在のセッション情報 ---
            // 現在の問題モード（'reading'=読み | 'writing'=書き | 'story'=物語）
            currentMode: 'reading',
            // 現在の問題リスト
            currentQuizQueue: [],
            // 今日の正解数
            todayCorrectCount: 0,
            // 今日の不正解数
            todayIncorrectCount: 0,
            // 連続正解数（ストリーク）
            currentStreak: 0,
            // 最大ストリーク数
            maxStreak: 0,

            // --- OCR/写真取り込み ---
            // 写真から抽出した漢字のリスト
            extractedKanjiList: [],
            // 現在のセッションが写真ドリルかどうか
            isPhotoDrill: false,
            // 現在のセッションが特訓モードかどうか
            isFocusedDrill: false,
            // 学校小テストで間違えた漢字（{ kanji, targetGrade } の配列）
            schoolMistakeKanjiList: [],
            // ドリルで間違えた漢字（1文字配列）
            drillMistakeKanjiList: [],

            // --- アクション ---
            /**
             * 選択学年を変更する
             * @param {number} grade - 新しい学年（1〜6）
             */
            setSelectedGrade: (grade) => set({ selectedGrade: grade, isPhotoDrill: false, isFocusedDrill: false }),

            /**
             * 写真ドリルモードを設定する
             * @param {boolean} active - 写真ドリルを有効にするか
             */
            setIsPhotoDrill: (active) => set({ isPhotoDrill: active, isFocusedDrill: active ? false : get().isFocusedDrill }),

            /**
             * 特訓モードを設定する
             * @param {boolean} active - 特訓モードを有効にするか
             */
            setIsFocusedDrill: (active) => set({ isFocusedDrill: active, isPhotoDrill: active ? false : get().isPhotoDrill }),

            /**
             * ユーザー名を設定する
             * @param {string} name - ユーザー名
             */
            setUserName: (name) => set({ userName: name }),

            /**
             * ユーザー敬称を設定する
             * @param {string} honorific - 'ちゃん' | 'くん'
             */
            setUserHonorific: (honorific) => set({ userHonorific: honorific }),

            /**
             * 問題モードを切り替える
             * @param {string} mode - 'reading' | 'writing' | 'story'
             */
            setCurrentMode: (mode) => set({ currentMode: mode }),

            /**
             * SRS進捗データを更新する
             * @param {string} kanjiCharacter - 更新する漢字
             * @param {Object} progressData - 更新するSRSデータ
             */
            updateKanjiProgress: (kanjiCharacter, progressData) =>
                set((state) => ({
                    kanjiProgress: {
                        ...state.kanjiProgress,
                        [kanjiCharacter]: progressData,
                    },
                })),

            /**
             * 今日のスコアを更新する
             * @param {boolean} isCorrect - 正解かどうか
             */
            recordAnswer: (isCorrect) =>
                set((state) => {
                    const newStreak = isCorrect ? state.currentStreak + 1 : 0;
                    return {
                        todayCorrectCount: state.todayCorrectCount + (isCorrect ? 1 : 0),
                        todayIncorrectCount: state.todayIncorrectCount + (isCorrect ? 0 : 1),
                        currentStreak: newStreak,
                        maxStreak: Math.max(state.maxStreak, newStreak),
                    };
                }),

            /**
             * OCRで抽出した漢字リストを保存する
             * @param {Array} kanjiList - 抽出した漢字の配列
             */
            setExtractedKanji: (kanjiList) => set({ extractedKanjiList: kanjiList }),

            /**
             * 学校小テストで間違えた漢字を追加する（同じ漢字は上書き）
             * @param {Array<string>} kanjiList - 追加する漢字配列
             * @param {number|null} targetGrade - 保存する対象学年（プロフィール学年）
             */
            addSchoolMistakeKanji: (kanjiList, targetGrade) =>
                set((state) => {
                    const normalizedKanjiList = (kanjiList || [])
                        .filter((item) => typeof item === 'string')
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0);

                    const existingEntries = (state.schoolMistakeKanjiList || []).map((entry) =>
                        typeof entry === 'string' ? { kanji: entry, targetGrade: state.selectedGrade ?? null } : entry
                    );
                    const entryMap = new Map(existingEntries.map((entry) => [entry.kanji, entry]));

                    normalizedKanjiList.forEach((kanji) => {
                        entryMap.set(kanji, { kanji, targetGrade: targetGrade ?? state.selectedGrade ?? null });
                    });

                    return { schoolMistakeKanjiList: Array.from(entryMap.values()) };
                }),

            /**
             * ドリルで間違えた漢字を記録する（重複は除外）
             * @param {string} kanji - 間違えた漢字
             */
            addDrillMistakeKanji: (kanji) =>
                set((state) => ({
                    drillMistakeKanjiList: state.drillMistakeKanjiList.includes(kanji)
                        ? state.drillMistakeKanjiList
                        : [...state.drillMistakeKanjiList, kanji],
                })),

            /**
             * 学校小テストの不正解リストをクリア
             */
            clearSchoolMistakeKanji: () => set({ schoolMistakeKanjiList: [] }),

            /**
             * 今日のスコアをリセットする（翌日・新セッション）
             */
            resetTodayScore: () =>
                set({ todayCorrectCount: 0, todayIncorrectCount: 0, currentStreak: 0 }),
        }),
        {
            name: 'kanzi-drill-storage', // LocalStorageのキー名
            version: 2,
            migrate: (persistedState, version) => {
                if (!persistedState) return persistedState;
                if (version < 2 && Array.isArray(persistedState.schoolMistakeKanjiList)) {
                    const selectedGrade = persistedState.selectedGrade ?? null;
                    persistedState.schoolMistakeKanjiList = persistedState.schoolMistakeKanjiList.map((entry) =>
                        typeof entry === 'string' ? { kanji: entry, targetGrade: selectedGrade } : entry
                    );
                }
                return persistedState;
            },
            // 学習に必要な永続データのみ保存（一時セッション状態は除外）
            partialize: (state) => ({
                selectedGrade: state.selectedGrade,
                userName: state.userName,
                userHonorific: state.userHonorific,
                kanjiProgress: state.kanjiProgress,
                maxStreak: state.maxStreak,
                extractedKanjiList: state.extractedKanjiList,
                schoolMistakeKanjiList: state.schoolMistakeKanjiList,
                drillMistakeKanjiList: state.drillMistakeKanjiList,
            }),
        }
    )
);
