import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Camera, Clock3, CheckCircle2 } from 'lucide-react';
import styles from './LandingPage.module.css';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>
            <div className={styles.bgGlowTop} aria-hidden="true" />
            <div className={styles.bgGlowBottom} aria-hidden="true" />

            <main className={styles.container}>
                <section className={styles.hero}>
                    <p className={styles.badge}>小学生の保護者向け</p>
                    <h1 className={styles.title}>
                        毎日の漢字宿題が
                        <br />
                        <span>「続かない」</span>を変える
                    </h1>
                    <p className={styles.subtitle}>
                        無料で使えて、記録はこのスマホ・タブレットの中だけ。
                        <br />
                        1日3分から、子どもが自分で進められます。
                    </p>
                    <div className={styles.heroActions}>
                        <button className="btn-primary" onClick={() => navigate('/')}>
                            無料で始める
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/capture')}>
                            今日の宿題から始める
                        </button>
                    </div>
                </section>

                <section className={styles.problemCard}>
                    <h2>こんな悩み、ありませんか？</h2>
                    <ul>
                        <li>毎日宿題は出るのに、なかなか机に向かわない</li>
                        <li>声をかけるほど、親子で言い合いになってしまう</li>
                        <li>やったのか、できたのか、見えにくい</li>
                    </ul>
                </section>

                <section className={styles.features}>
                    <h2>このアプリでできること</h2>
                    <div className={styles.featureGrid}>
                        <article className={styles.feature}>
                            <Camera size={22} />
                            <h3>宿題からそのまま練習</h3>
                            <p>教科書やドリルを撮るだけ。今日やる漢字から問題を作れます。</p>
                        </article>
                        <article className={styles.feature}>
                            <Clock3 size={22} />
                            <h3>短時間で終わる流れ</h3>
                            <p>「読む・意味・書く」を順番に進めるだけ。迷わず取り組めます。</p>
                        </article>
                        <article className={styles.feature}>
                            <CheckCircle2 size={22} />
                            <h3>がんばりが見える</h3>
                            <p>今日の正解数や続いた日数が見えるので、続けるきっかけになります。</p>
                        </article>
                    </div>
                </section>

                <section className={styles.safetyCard}>
                    <div className={styles.safetyIcon}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2>この端末だけで使えます</h2>
                        <p>ログイン不要。写真や学習内容は外に送りません。</p>
                        <p>記録はこの端末の中に保存されます。</p>
                        <p className={styles.note}>※ 端末を変えると記録の引きつぎはできません。</p>
                    </div>
                </section>

                <section className={styles.cta}>
                    <h2>今日の宿題、まずは3分から</h2>
                    <button className="btn-primary" onClick={() => navigate('/')}>
                        無料で始める
                    </button>
                </section>
            </main>
        </div>
    );
}

export default LandingPage;
