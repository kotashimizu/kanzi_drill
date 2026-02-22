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

            // --- アクション ---
            /**
             * 選択学年を変更する
             * @param {number} grade - 新しい学年（1〜6）
             */
            setSelectedGrade: (grade) => set({ selectedGrade: grade, isPhotoDrill: false }),

            /**
             * 写真ドリルモードを設定する
             * @param {boolean} active - 写真ドリルを有効にするか
             */
            setIsPhotoDrill: (active) => set({ isPhotoDrill: active }),

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
             * 今日のスコアをリセットする（翌日・新セッション）
             */
            resetTodayScore: () =>
                set({ todayCorrectCount: 0, todayIncorrectCount: 0, currentStreak: 0 }),
        }),
        {
            name: 'kanzi-drill-storage', // LocalStorageのキー名
            // kanjiProgressのみ永続化（一時データは除外）
            partialize: (state) => ({
                selectedGrade: state.selectedGrade,
                userName: state.userName,
                userHonorific: state.userHonorific,
                kanjiProgress: state.kanjiProgress,
                maxStreak: state.maxStreak,
                extractedKanjiList: state.extractedKanjiList,
            }),
        }
    )
);
