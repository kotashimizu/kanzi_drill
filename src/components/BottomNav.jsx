import { useLocation, useNavigate } from 'react-router-dom';
import styles from './BottomNav.module.css';

// ナビゲーションアイテムの定義
const NAV_ITEMS = [
    { path: '/', icon: '🏠', label: 'ホーム', id: 'nav-home' },
    { path: '/capture', icon: '📷', label: '写真', id: 'nav-capture' },
    { path: '/study', icon: '📚', label: '学ぶ', id: 'nav-study' },
    { path: '/progress', icon: '🏆', label: '記録', id: 'nav-progress' },
];

/**
 * 画面下部の固定ナビゲーションバー
 * 現在のページに応じてアクティブなアイテムをハイライトする
 */
function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className={styles.nav} role="navigation" aria-label="メインナビゲーション">
            {NAV_ITEMS.map((navItem) => {
                // 現在のページかどうかを判定（ホームは完全一致、他は前方一致）
                const isActive = navItem.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(navItem.path);

                return (
                    <button
                        key={navItem.path}
                        className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                        onClick={() => navigate(navItem.path)}
                        id={navItem.id}
                        aria-label={navItem.label}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <span className={styles.navIcon}>{navItem.icon}</span>
                        <span className={styles.navLabel}>{navItem.label}</span>
                        {isActive && <span className={styles.activeIndicator} />}
                    </button>
                );
            })}
        </nav>
    );
}

export default BottomNav;
