// ============================================================
// Graph Canvas Component — Draws city graphs with BFS/DFS paths
// ============================================================
const GraphRenderer = {
    nodePositions: {},

    calculateLayout(cities, edges) {
        const positions = {};
        const n = cities.length;
        const cx = 400, cy = 250, rx = 300, ry = 200;
        cities.forEach((city, i) => {
            const angle = (2 * Math.PI * i / n) - Math.PI / 2;
            positions[city] = {
                x: cx + rx * Math.cos(angle),
                y: cy + ry * Math.sin(angle)
            };
        });
        this.nodePositions = positions;
        return positions;
    },

    render(canvasId, cities, edges, highlightPath = [], highlightEdges = [], dfsOrder = []) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);

        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;

        const positions = {};
        const n = cities.length;
        const cx = w / 2, cy = h / 2;
        const rx = Math.min(w, h) * 0.38;
        const ry = Math.min(w, h) * 0.35;

        cities.forEach((city, i) => {
            const angle = (2 * Math.PI * i / n) - Math.PI / 2;
            positions[city] = {
                x: cx + rx * Math.cos(angle),
                y: cy + ry * Math.sin(angle)
            };
        });

        ctx.clearRect(0, 0, w, h);

        // Draw edges
        for (const edge of edges) {
            const from = positions[edge.asal];
            const to = positions[edge.tujuan];
            if (!from || !to) continue;

            const isHighlighted = highlightEdges.some(e =>
                (e.from === edge.asal && e.to === edge.tujuan) ||
                (e.from === edge.tujuan && e.to === edge.asal)
            );

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = isHighlighted ? '#2F2FE4' : 'rgba(22, 46, 147, 0.4)';
            ctx.lineWidth = isHighlighted ? 3 : 1.5;
            ctx.stroke();

            // Distance label
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            ctx.font = '10px Poppins, sans-serif';
            ctx.fillStyle = isHighlighted ? '#c0c1ff' : '#908fa2';
            ctx.textAlign = 'center';
            ctx.fillText(`${edge.jarak}km`, mx, my - 6);
        }

        // Draw highlighted path edges with arrows
        if (highlightPath.length > 1) {
            ctx.setLineDash([]);
            for (let i = 0; i < highlightPath.length - 1; i++) {
                const from = positions[highlightPath[i]];
                const to = positions[highlightPath[i + 1]];
                if (!from || !to) continue;

                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#4ade80';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Arrow
                const angle = Math.atan2(to.y - from.y, to.x - from.x);
                const arrowLen = 12;
                const ax = to.x - 20 * Math.cos(angle);
                const ay = to.y - 20 * Math.sin(angle);
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(ax - arrowLen * Math.cos(angle - 0.4), ay - arrowLen * Math.sin(angle - 0.4));
                ctx.lineTo(ax - arrowLen * Math.cos(angle + 0.4), ay - arrowLen * Math.sin(angle + 0.4));
                ctx.closePath();
                ctx.fillStyle = '#4ade80';
                ctx.fill();
            }
        }

        // Draw nodes
        for (const city of cities) {
            const pos = positions[city];
            const isInPath = highlightPath.includes(city);
            const dfsIdx = dfsOrder.indexOf(city);
            const isInDfs = dfsIdx !== -1;

            // Node circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
            if (isInPath) {
                ctx.fillStyle = '#4ade80';
                ctx.shadowColor = '#4ade80';
                ctx.shadowBlur = 12;
            } else if (isInDfs) {
                ctx.fillStyle = '#c0c1ff';
                ctx.shadowColor = '#c0c1ff';
                ctx.shadowBlur = 8;
            } else {
                ctx.fillStyle = '#2a283a';
                ctx.shadowBlur = 0;
            }
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = isInPath ? '#4ade80' : (isInDfs ? '#2F2FE4' : '#454556');
            ctx.lineWidth = 2;
            ctx.stroke();

            // DFS order number
            if (isInDfs) {
                ctx.font = 'bold 10px Poppins, sans-serif';
                ctx.fillStyle = isInPath ? '#080616' : '#080616';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dfsIdx + 1, pos.x, pos.y);
            }

            // City label
            ctx.font = '11px Poppins, sans-serif';
            ctx.fillStyle = isInPath ? '#4ade80' : (isInDfs ? '#c0c1ff' : '#e5dff8');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(city, pos.x, pos.y + 22);
        }
    }
};
