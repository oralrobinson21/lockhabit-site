/* charts.js — minimal animated pie chart (no libs)
   API: new PieChart(canvas, [ {label, value, color} ], {animate:true})
*/
class PieChart {
  constructor(canvas, data, opts = {}) {
    this.ctx = canvas.getContext("2d");
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    this.canvas = canvas;
    this.resize();
    window.addEventListener("resize", () => this.resize(), { passive: true });

    this.data = data;
    this.total = Math.max(1, data.reduce((s, d) => s + Math.max(0, d.value), 0));
    this.animate = opts.animate !== false;
    this.duration = opts.duration || 900;
    this.startTime = null;
    this.draw = this.draw.bind(this);
    requestAnimationFrame(this.draw);
  }

  resize() {
    const { canvas, dpr } = this;
    const w = canvas.clientWidth || 320;
    const h = canvas.clientHeight || 320;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    this.w = w * dpr;
    this.h = h * dpr;
    this.cx = this.w / 2;
    this.cy = this.h / 2;
    this.r = Math.min(this.w, this.h) * 0.38;
  }

  draw(ts) {
    const { ctx, w, h, cx, cy, r } = this;
    ctx.clearRect(0, 0, w, h);

    const progress = !this.animate ? 1 :
      (this.startTime ? Math.min(1, (ts - this.startTime) / this.duration) : (this.startTime = ts, 0));

    // subtle background ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineWidth = r * 0.18;
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // slices
    let angle = -Math.PI / 2;
    this.data.forEach((d) => {
      const frac = (Math.max(0, d.value) / this.total) * progress;
      const end = angle + frac * Math.PI * 2;
      this.slice(angle, end, d.color);
      angle = end;
    });

    // center label
    const total = this.total;
    ctx.save();
    ctx.fillStyle = "#e7edf6";
    ctx.font = `${Math.round(this.r * 0.22)}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.money(total), cx, cy);
    ctx.restore();

    if (progress < 1) requestAnimationFrame(this.draw);
  }

  slice(start, end, fill) {
    const { ctx, cx, cy, r } = this;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.shadowColor = "rgba(0,0,0,.25)";
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();
  }

  money(n) {
    try {
      const cur = JSON.parse(localStorage.getItem("lh.currency")) || "USD";
      return new Intl.NumberFormat(undefined, { style: "currency", currency: cur === "Auto" ? "USD" : cur }).format(n);
    } catch {
      return `$${(n || 0).toFixed(0)}`;
    }
  }
}

// helper to build dataset with consistent palette
function buildTaxDataset(vals) {
  // palette tuned for dark bg, WCAG contrast
  const C = {
    federal: "#63b3ff",
    state: "#9f9fff",
    social: "#5ee0c8",
    other: "#ffd27a",
    takehome: "rgba(231,237,246,.10)" // unused in pie (we show tax only)
  };
  return [
    { label: "federal", value: vals.federal, color: C.federal },
    { label: "state",   value: vals.state,   color: C.state },
    { label: "social",  value: vals.social,  color: C.social },
    { label: "other",   value: vals.other,   color: C.other },
  ];
}

window.PieChart = PieChart;
window.buildTaxDataset = buildTaxDataset;