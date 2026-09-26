import { Link } from "@tanstack/react-router";
import logoTransparent from "@/assets/lockhabit-logo-transparent.png";

export function IslandFooter() {
  return (
    <footer className="island-footer">
      <section className="island-footer-scene" aria-label="A sunny LockHabit island scene">
        <div className="island-footer-paper-noise" aria-hidden="true" />
        <svg className="island-palm island-palm-left" viewBox="0 0 280 360" aria-hidden="true">
          <path d="M74 360C91 276 102 196 118 102" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
          <path d="M116 111C74 91 36 90 4 107C38 119 72 128 113 127Z" fill="currentColor" />
          <path d="M120 104C82 61 46 39 8 35C35 65 65 91 111 119Z" fill="currentColor" />
          <path d="M124 104C123 54 141 20 173 0C168 37 154 76 128 116Z" fill="currentColor" />
          <path d="M126 109C166 64 206 48 252 55C214 76 178 98 132 123Z" fill="currentColor" />
          <path d="M125 116C174 104 221 112 270 143C221 143 179 137 126 129Z" fill="currentColor" />
        </svg>
        <svg className="island-palm island-palm-right" viewBox="0 0 260 250" aria-hidden="true">
          <path d="M260 239C196 195 158 151 127 98" fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="round" />
          <path d="M127 101C94 77 60 67 19 72C51 91 83 104 124 114Z" fill="currentColor" />
          <path d="M128 96C102 60 78 35 42 17C61 50 83 76 122 108Z" fill="currentColor" />
          <path d="M132 94C137 52 155 22 185 3C180 38 164 68 137 105Z" fill="currentColor" />
          <path d="M136 100C174 72 209 64 248 72C214 88 181 101 139 113Z" fill="currentColor" />
        </svg>
        <div className="island-cloud island-cloud-one" aria-hidden="true"><i /><i /><i /></div>
        <div className="island-cloud island-cloud-two" aria-hidden="true"><i /><i /><i /></div>
        <div className="island-footer-copy">
          <p className="island-footer-script">Thanks for<br />being here <span>♡</span></p>
          <p className="island-footer-memo">SLOWER DAYS<br />BRIGHTER SKIN<br />A KINDER WORLD.</p>
        </div>
        <svg className="island-sun" viewBox="0 0 220 220" aria-label="Smiling sun">
          <g className="island-sun-rays" stroke="currentColor" strokeWidth="15" strokeLinecap="round">
            <path d="M110 8V34" /><path d="M110 186V212" /><path d="M8 110H34" /><path d="M186 110H212" />
            <path d="M38 38L57 57" /><path d="M163 163L182 182" /><path d="M182 38L163 57" /><path d="M57 163L38 182" />
          </g>
          <circle cx="110" cy="110" r="70" fill="currentColor" />
          <g fill="none" stroke="var(--foreground)" strokeWidth="7" strokeLinecap="round">
            <path d="M76 102c6 9 15 9 21 0" /><path d="M123 102c6 9 15 9 21 0" /><path d="M82 127c16 24 41 24 57 0" />
          </g>
        </svg>
        <p className="island-footer-sun-note">See you<br />in the sunshine ♡</p>
        <svg className="island-mountains" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 245L0 211L92 180L168 192L258 137L323 167L418 81L485 148L555 111L644 189L729 164L802 205L900 176L1000 203L1102 174L1200 209L1200 260Z" fill="currentColor" />
          <path d="M237 167L418 81L485 148L555 111L644 189L572 170L528 147L487 173L442 126L390 167L327 184Z" fill="var(--island-mountain-light)" opacity=".78" />
        </svg>
        <div className="island-boat" aria-label="A small LockHabit sailboat">
          <svg viewBox="0 0 180 190">
            <path d="M90 18V143" stroke="var(--foreground)" strokeWidth="5" />
            <path d="M86 30L86 137L24 137Z" fill="var(--paper)" stroke="var(--foreground)" strokeWidth="3" />
            <path d="M95 52L95 137L145 137Z" fill="var(--paper)" stroke="var(--foreground)" strokeWidth="3" />
            <path d="M25 142H154L135 170H47Z" fill="var(--sun)" stroke="var(--foreground)" strokeWidth="4" />
            <path d="M47 155H136" stroke="var(--foreground)" strokeWidth="3" />
          </svg>
        </div>
        <div className="island-waves" aria-hidden="true">
          <div className="island-wave island-wave-one"><svg viewBox="0 0 1500 180" preserveAspectRatio="none"><path d="M0 78C100 20 196 20 300 78S500 136 600 78S800 20 900 78S1100 136 1200 78S1400 20 1500 78V180H0Z" /></svg></div>
          <div className="island-wave island-wave-two"><svg viewBox="0 0 1500 180" preserveAspectRatio="none"><path d="M0 76C125 132 225 132 340 76S560 20 680 76S900 132 1020 76S1240 20 1500 76V180H0Z" /></svg></div>
          <div className="island-wave island-wave-three"><svg viewBox="0 0 1500 180" preserveAspectRatio="none"><path d="M0 78C100 20 196 20 300 78S500 136 600 78S800 20 900 78S1100 136 1200 78S1400 20 1500 78V180H0Z" /></svg></div>
          <div className="island-wave island-wave-four"><svg viewBox="0 0 1500 180" preserveAspectRatio="none"><path d="M0 76C125 132 225 132 340 76S560 20 680 76S900 132 1020 76S1240 20 1500 76V180H0Z" /></svg></div>
        </div>
        <div className="island-shore-foam" aria-hidden="true">
          <svg viewBox="0 0 1000 110" preserveAspectRatio="none"><path d="M0 85C76 63 131 73 193 53C266 31 317 63 386 45C454 26 507 58 568 41C656 15 713 57 790 35C867 13 929 43 1000 26" /></svg>
        </div>
      </section>
      <section className="island-footer-links">
        <div className="island-footer-grid">
          <div className="island-footer-brand"><img src={logoTransparent} alt="LOCKHABIT Soap and Body Care" /><p>Beauty in a kinder routine.</p></div>
          <div><p className="island-footer-heading">Shop</p><div className="island-footer-list">
            <a href="/#shop">Full catalog</a><a href="/#featured">Coconut Beach</a><a href="/#ingredients">Ingredients</a>
          </div></div>
          <div><p className="island-footer-heading">The company</p><div className="island-footer-list">
            <Link to="/about">About us</Link><Link to="/contact">Contact the front desk</Link><Link to="/journal">Keep the Vibes Going · Journal</Link><Link to="/sign-in">Sign in</Link><Link to="/shipping">Shipping</Link><Link to="/returns">Returns & refunds</Link><Link to="/faq">FAQ</Link>
          </div></div>
          <div><p className="island-footer-heading">Hours</p><p className="island-footer-hours">Open always.<br />Closed never.<br />Air 84°F, water 79°F.</p>
            <div className="island-footer-list island-footer-legal"><Link to="/contact">Contact the front desk</Link><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms of service</Link></div>
          </div>
        </div>
        <div className="island-footer-bottom"><p className="memo">LOCKHABIT SOAP CO. · EST. IN THE SUN</p><p className="island-footer-script-small">More good days ahead. ♡</p></div>
        <div className="island-footer-rule"><p className="memo">© 2026 LOCKHABIT Soap Co.</p><p className="memo">Secure checkout powered by Stripe</p></div>
      </section>
    </footer>
  );
}
