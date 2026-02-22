/**
 * 間隔反復（Spaced Repetition System）ロジック
 * Leitnerシステムを元に5つのボックスで学習管理する
 * @param {Array} initialKanjiList - 初期漢字リスト
 */
import { useState, useCallback } from 'react';

// 各ボックスの復習間隔（日数）
const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

/**
 * Leitner式SRSの状態を初期化する
 * @param {Array} kanjiList - 初期化する漢字の配列
 */
function initializeSrsState(kanjiList) {
    return kanjiList.map((kanjiItem) => ({
        ...kanjiItem,
        // ボックス1からスタート（0が一番苦手）
        boxLevel: 0,
        // 最後に復習した日時（null=未学習）
        lastReviewedAt: null,
        // 次に復習すべき日時
        nextReviewAt: new Date().toISOString(),
        // 正解した回数
        correctCount: 0,
        // 間違えた回数
        incorrectCount: 0,
    }));
}

/**
 * 次の復習日時を計算する（ボックスレベルに応じた間隔）
 * @param {number} boxLevel - 現在のボックスレベル（0〜5）
 */
function calculateNextReviewDate(boxLevel) {
    const intervalDays = BOX_INTERVALS_DAYS[Math.min(boxLevel, BOX_INTERVALS_DAYS.length - 1)];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    return nextDate.toISOString();
}

/**
 * 間隔反復学習を管理するカスタムフック
 * @param {Array} kanjiList - 学習する漢字のリスト
 */
export function useSRS(kanjiList) {
    const [srsCards, setSrsCards] = useState(() => initializeSrsState(kanjiList));

    /**
     * 正解・不正解に応じてカードのボックスレベルを更新する
     * @param {string} kanjiCharacter - 更新する漢字の文字
     * @param {boolean} isCorrect - 正解かどうか
     */
    const updateCardResult = useCallback((kanjiCharacter, isCorrect) => {
        setSrsCards((prevCards) =>
            prevCards.map((card) => {
                if (card.kanji !== kanjiCharacter) return card;

                const newBoxLevel = isCorrect
                    ? Math.min(card.boxLevel + 1, BOX_INTERVALS_DAYS.length - 1)
                    : 0; // 不正解はボックス0（最初）に戻す

                return {
                    ...card,
                    boxLevel: newBoxLevel,
                    lastReviewedAt: new Date().toISOString(),
                    nextReviewAt: calculateNextReviewDate(newBoxLevel),
                    correctCount: card.correctCount + (isCorrect ? 1 : 0),
                    incorrectCount: card.incorrectCount + (isCorrect ? 0 : 1),
                };
            })
        );
    }, []);

    /**
     * 今日復習すべきカードを返す（期限切れのもの）
     */
    const getDueCards = useCallback(() => {
        const now = new Date();
        return srsCards.filter((card) => new Date(card.nextReviewAt) <= now);
    }, [srsCards]);

    /**
     * 学習の全体的な進捗率を0〜100で返す
     */
    const getProgressPercentage = useCallback(() => {
        if (srsCards.length === 0) return 0;
        const masteredCount = srsCards.filter((card) => card.boxLevel >= 4).length;
        return Math.round((masteredCount / srsCards.length) * 100);
    }, [srsCards]);

    return {
        srsCards,
        updateCardResult,
        getDueCards,
        getProgressPercentage,
    };
}
