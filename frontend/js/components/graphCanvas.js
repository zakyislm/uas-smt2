/**
 * Dokumentasi Komponen Graph Canvas (graphCanvas.js)
 * 
 * File ini mengontrol visualisasi dan interaktivitas graf antarkota menggunakan elemen HTML5 Canvas.
 * Komponen ini bertanggung jawab untuk menggambar node kota, edge rute pengiriman, 
 * animasi pencarian rute terpendek (BFS dan DFS semua jalur), serta visualisasi penelusuran DFS (DFS Traversal).
 */
const GraphRenderer = {
    nodePositions: {},
    _animId: null,
    _particles: [],
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
    _getPositions(canvasId, cities) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
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
        return positions;
    },
    render(canvasId, cities, edges, highlightPath = [], highlightEdges = [], dfsOrder = []) {
        if (this._animId) { cancelAnimationFrame(this._animId); this._animId = null; }
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        const positions = this._getPositions(canvasId, cities);
        ctx.clearRect(0, 0, w, h);
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
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            ctx.font = '10px Poppins, sans-serif';
            ctx.fillStyle = isHighlighted ? '#c0c1ff' : '#908fa2';
            ctx.textAlign = 'center';
            ctx.fillText(`${edge.jarak}km`, mx, my - 6);
        }
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
        this._drawNodes(ctx, cities, positions, highlightPath, dfsOrder);
    },
    _drawNodes(ctx, cities, positions, highlightPath, dfsOrder) {
        for (const city of cities) {
            const pos = positions[city];
            const isInPath = highlightPath.includes(city);
            const dfsIdx = dfsOrder.indexOf(city);
            const isInDfs = dfsIdx !== -1;
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
            if (isInDfs) {
                ctx.font = 'bold 10px Poppins, sans-serif';
                ctx.fillStyle = '#080616';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dfsIdx + 1, pos.x, pos.y);
            }
            ctx.font = '11px Poppins, sans-serif';
            ctx.fillStyle = isInPath ? '#4ade80' : (isInDfs ? '#c0c1ff' : '#e5dff8');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(city, pos.x, pos.y + 22);
        }
    },
    animatePath(canvasId, cities, edges, path, onDone) {
        if (this._animId) { cancelAnimationFrame(this._animId); this._animId = null; }
        this._particles = [];
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        const positions = this._getPositions(canvasId, cities);
        if (!positions) return;
        const edgeCount = path.length - 1;
        if (edgeCount <= 0) {
            this.render(canvasId, cities, edges, path, []);
            if (onDone) onDone();
            return;
        }
        const EDGE_DURATION = 400;   
        const PULSE_DURATION = 200;  
        const PARTICLE_COUNT = 6;
        const totalDuration = edgeCount * (EDGE_DURATION + PULSE_DURATION);
        const startTime = performance.now();
        const self = this;
        const jarakMap = {};
        for (const e of edges) {
            jarakMap[e.asal + '|' + e.tujuan] = e.jarak;
            jarakMap[e.tujuan + '|' + e.asal] = e.jarak;
        }
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        function drawFrame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);
            ctx.clearRect(0, 0, w, h);
            const totalPerEdge = EDGE_DURATION + PULSE_DURATION;
            const currentEdgeIdx = Math.min(Math.floor(elapsed / totalPerEdge), edgeCount - 1);
            const edgeElapsed = elapsed - currentEdgeIdx * totalPerEdge;
            const edgeProgress = Math.min(edgeElapsed / EDGE_DURATION, 1);
            const easedEdge = easeInOutCubic(edgeProgress);
            const isPulse = edgeElapsed > EDGE_DURATION;
            const pulseProgress = isPulse ? Math.min((edgeElapsed - EDGE_DURATION) / PULSE_DURATION, 1) : 0;
            const completedEdges = [];
            const litNodes = [path[0]];
            for (let i = 0; i < currentEdgeIdx; i++) {
                completedEdges.push({ from: path[i], to: path[i + 1] });
                litNodes.push(path[i + 1]);
            }
            for (const edge of edges) {
                const from = positions[edge.asal];
                const to = positions[edge.tujuan];
                if (!from || !to) continue;
                const isCompleted = completedEdges.some(e =>
                    (e.from === edge.asal && e.to === edge.tujuan) ||
                    (e.from === edge.tujuan && e.to === edge.asal)
                );
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = isCompleted ? 'rgba(47, 47, 228, 0.6)' : 'rgba(22, 46, 147, 0.4)';
                ctx.lineWidth = isCompleted ? 2.5 : 1.5;
                ctx.stroke();
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                ctx.font = '10px Poppins, sans-serif';
                ctx.fillStyle = isCompleted ? '#c0c1ff' : '#908fa2';
                ctx.textAlign = 'center';
                ctx.fillText(`${edge.jarak}km`, mx, my - 6);
            }
            for (let i = 0; i < completedEdges.length; i++) {
                const from = positions[completedEdges[i].from];
                const to = positions[completedEdges[i].to];
                if (!from || !to) continue;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
                ctx.lineWidth = 8;
                ctx.shadowColor = '#4ade80';
                ctx.shadowBlur = 14;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#4ade80';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0;
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
            if (currentEdgeIdx < edgeCount && edgeProgress < 1) {
                const from = positions[path[currentEdgeIdx]];
                const to = positions[path[currentEdgeIdx + 1]];
                if (from && to) {
                    const curX = from.x + (to.x - from.x) * easedEdge;
                    const curY = from.y + (to.y - from.y) * easedEdge;
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(curX, curY);
                    ctx.strokeStyle = 'rgba(74, 222, 128, 0.15)';
                    ctx.lineWidth = 10;
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 18;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(curX, curY);
                    ctx.strokeStyle = '#4ade80';
                    ctx.lineWidth = 3.5;
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 10;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
                    ctx.fillStyle = '#fff';
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 16;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    if (Math.random() < 0.5) {
                        self._particles.push({
                            x: curX, y: curY,
                            vx: (Math.random() - 0.5) * 2,
                            vy: (Math.random() - 0.5) * 2,
                            life: 1.0,
                            size: 2 + Math.random() * 2
                        });
                    }
                }
            } else if (currentEdgeIdx < edgeCount && edgeProgress >= 1) {
                const from = positions[path[currentEdgeIdx]];
                const to = positions[path[currentEdgeIdx + 1]];
                if (from && to) {
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(to.x, to.y);
                    ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
                    ctx.lineWidth = 8;
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 14;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(to.x, to.y);
                    ctx.strokeStyle = '#4ade80';
                    ctx.lineWidth = 3.5;
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 8;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
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
                if (!litNodes.includes(path[currentEdgeIdx + 1])) {
                    litNodes.push(path[currentEdgeIdx + 1]);
                }
            }
            for (let pi = self._particles.length - 1; pi >= 0; pi--) {
                const p = self._particles[pi];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.04;
                if (p.life <= 0) { self._particles.splice(pi, 1); continue; }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(74, 222, 128, ${p.life * 0.6})`;
                ctx.fill();
            }
            for (const city of cities) {
                const pos = positions[city];
                const isLit = litNodes.includes(city);
                const isCurrentTarget = isPulse && currentEdgeIdx < edgeCount && city === path[currentEdgeIdx + 1];
                if (isCurrentTarget) {
                    const pulseRadius = 16 + 20 * pulseProgress;
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, pulseRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(74, 222, 128, ${0.6 * (1 - pulseProgress)})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    const pulseRadius2 = 16 + 12 * pulseProgress;
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, pulseRadius2, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(74, 222, 128, ${0.4 * (1 - pulseProgress)})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
                if (isLit) {
                    ctx.fillStyle = '#4ade80';
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 14;
                } else {
                    ctx.fillStyle = '#2a283a';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = isLit ? '#4ade80' : '#454556';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.font = '11px Poppins, sans-serif';
                ctx.fillStyle = isLit ? '#4ade80' : '#e5dff8';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(city, pos.x, pos.y + 22);
            }
            if (progress < 1) {
                self._animId = requestAnimationFrame(drawFrame);
            } else {
                self._animId = null;
                self._particles = [];
                self._startGlowLoop(canvasId, cities, edges, path, positions);
                if (onDone) onDone();
            }
        }
        self._animId = requestAnimationFrame(drawFrame);
    },
    _startGlowLoop(canvasId, cities, edges, path, positions) {
        if (this._animId) { cancelAnimationFrame(this._animId); this._animId = null; }
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        const self = this;
        const startTime = performance.now();
        const jarakMap = {};
        for (const e of edges) {
            jarakMap[e.asal + '|' + e.tujuan] = e.jarak;
            jarakMap[e.tujuan + '|' + e.asal] = e.jarak;
        }
        const highlightEdges = [];
        for (let i = 0; i < path.length - 1; i++) {
            highlightEdges.push({ from: path[i], to: path[i + 1] });
        }
        function drawGlow(now) {
            const t = ((now - startTime) % 2000) / 2000; 
            const pulse = 0.6 + 0.4 * Math.sin(t * Math.PI * 2);
            ctx.clearRect(0, 0, w, h);
            for (const edge of edges) {
                const from = positions[edge.asal];
                const to = positions[edge.tujuan];
                if (!from || !to) continue;
                const isHL = highlightEdges.some(e =>
                    (e.from === edge.asal && e.to === edge.tujuan) ||
                    (e.from === edge.tujuan && e.to === edge.asal)
                );
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = isHL ? 'rgba(47, 47, 228, 0.6)' : 'rgba(22, 46, 147, 0.4)';
                ctx.lineWidth = isHL ? 2.5 : 1.5;
                ctx.stroke();
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                ctx.font = '10px Poppins, sans-serif';
                ctx.fillStyle = isHL ? '#c0c1ff' : '#908fa2';
                ctx.textAlign = 'center';
                ctx.fillText(`${edge.jarak}km`, mx, my - 6);
            }
            for (let i = 0; i < path.length - 1; i++) {
                const from = positions[path[i]];
                const to = positions[path[i + 1]];
                if (!from || !to) continue;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = `rgba(74, 222, 128, ${0.15 * pulse})`;
                ctx.lineWidth = 8 + 2 * pulse;
                ctx.shadowColor = '#4ade80';
                ctx.shadowBlur = 10 + 6 * pulse;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = '#4ade80';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#4ade80';
                ctx.shadowBlur = 6 + 4 * pulse;
                ctx.stroke();
                ctx.shadowBlur = 0;
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
            for (const city of cities) {
                const pos = positions[city];
                const isLit = path.includes(city);
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
                if (isLit) {
                    ctx.fillStyle = '#4ade80';
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 8 + 6 * pulse;
                } else {
                    ctx.fillStyle = '#2a283a';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = isLit ? '#4ade80' : '#454556';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.font = '11px Poppins, sans-serif';
                ctx.fillStyle = isLit ? '#4ade80' : '#e5dff8';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(city, pos.x, pos.y + 22);
            }
            self._animId = requestAnimationFrame(drawGlow);
        }
        self._animId = requestAnimationFrame(drawGlow);
    },
    animateTraversal(canvasId, cities, edges, dfsOrder, onDone) {
        if (this._animId) { cancelAnimationFrame(this._animId); this._animId = null; }
        this._particles = [];
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        const positions = this._getPositions(canvasId, cities);
        if (!positions) return;
        const orderCount = dfsOrder.length;
        if (orderCount <= 0) {
            this.render(canvasId, cities, edges, [], [], dfsOrder);
            if (onDone) onDone();
            return;
        }
        const parentMap = {};
        const dfsTreeEdges = [];
        for (let i = 1; i < orderCount; i++) {
            const child = dfsOrder[i];
            for (let j = i - 1; j >= 0; j--) {
                const potentialParent = dfsOrder[j];
                const hasEdge = edges.some(e =>
                    (e.asal === potentialParent && e.tujuan === child) ||
                    (e.asal === child && e.tujuan === potentialParent)
                );
                if (hasEdge) {
                    parentMap[child] = potentialParent;
                    dfsTreeEdges.push({ from: potentialParent, to: child });
                    break;
                }
            }
        }
        const EDGE_DURATION = 400;   
        const PULSE_DURATION = 200;  
        const totalDuration = PULSE_DURATION + (orderCount - 1) * (EDGE_DURATION + PULSE_DURATION);
        const startTime = performance.now();
        const self = this;
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        function drawFrame(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);
            ctx.clearRect(0, 0, w, h);
            let currentStep = 0;
            let stepProgress = 0; 
            let isPulse = false;
            let pulseProgress = 0;
            let easedEdge = 0;
            if (elapsed <= PULSE_DURATION) {
                currentStep = 0;
                isPulse = true;
                pulseProgress = Math.min(elapsed / PULSE_DURATION, 1);
            } else {
                const rem = elapsed - PULSE_DURATION;
                const stepLen = EDGE_DURATION + PULSE_DURATION;
                currentStep = 1 + Math.floor(rem / stepLen);
                if (currentStep >= orderCount) {
                    currentStep = orderCount - 1;
                    stepProgress = 1;
                    isPulse = true;
                    pulseProgress = 1;
                } else {
                    const stepElapsed = rem % stepLen;
                    if (stepElapsed <= EDGE_DURATION) {
                        stepProgress = stepElapsed / EDGE_DURATION;
                        easedEdge = easeInOutCubic(stepProgress);
                        isPulse = false;
                    } else {
                        stepProgress = 1;
                        easedEdge = 1;
                        isPulse = true;
                        pulseProgress = Math.min((stepElapsed - EDGE_DURATION) / PULSE_DURATION, 1);
                    }
                }
            }
            const litNodes = dfsOrder.slice(0, currentStep + (isPulse ? 1 : 0));
            const completedTreeEdges = [];
            for (let i = 1; i < litNodes.length; i++) {
                const child = litNodes[i];
                const parent = parentMap[child];
                if (parent) {
                    completedTreeEdges.push({ from: parent, to: child });
                }
            }
            for (const edge of edges) {
                const from = positions[edge.asal];
                const to = positions[edge.tujuan];
                if (!from || !to) continue;
                const isCompletedHL = completedTreeEdges.some(e =>
                    (e.from === edge.asal && e.to === edge.tujuan) ||
                    (e.from === edge.tujuan && e.to === edge.asal)
                );
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = isCompletedHL ? 'rgba(47, 47, 228, 0.7)' : 'rgba(22, 46, 147, 0.4)';
                ctx.lineWidth = isCompletedHL ? 3 : 1.5;
                ctx.stroke();
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                ctx.font = '10px Poppins, sans-serif';
                ctx.fillStyle = isCompletedHL ? '#c0c1ff' : '#908fa2';
                ctx.textAlign = 'center';
                ctx.fillText(`${edge.jarak}km`, mx, my - 6);
            }
            for (const edge of completedTreeEdges) {
                const from = positions[edge.from];
                const to = positions[edge.to];
                if (!from || !to) continue;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = 'rgba(129, 140, 248, 0.2)';
                ctx.lineWidth = 8;
                ctx.shadowColor = '#818cf8';
                ctx.shadowBlur = 14;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = '#818cf8';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#818cf8';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            if (currentStep > 0 && currentStep < orderCount && !isPulse) {
                const child = dfsOrder[currentStep];
                const parent = parentMap[child];
                if (parent) {
                    const from = positions[parent];
                    const to = positions[child];
                    if (from && to) {
                        const curX = from.x + (to.x - from.x) * easedEdge;
                        const curY = from.y + (to.y - from.y) * easedEdge;
                        ctx.beginPath();
                        ctx.moveTo(from.x, from.y);
                        ctx.lineTo(curX, curY);
                        ctx.strokeStyle = 'rgba(129, 140, 248, 0.2)';
                        ctx.lineWidth = 10;
                        ctx.shadowColor = '#818cf8';
                        ctx.shadowBlur = 18;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.beginPath();
                        ctx.moveTo(from.x, from.y);
                        ctx.lineTo(curX, curY);
                        ctx.strokeStyle = '#818cf8';
                        ctx.lineWidth = 3.5;
                        ctx.shadowColor = '#818cf8';
                        ctx.shadowBlur = 10;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                        ctx.beginPath();
                        ctx.arc(curX, curY, 5, 0, Math.PI * 2);
                        ctx.fillStyle = '#fff';
                        ctx.shadowColor = '#818cf8';
                        ctx.shadowBlur = 16;
                        ctx.fill();
                        ctx.shadowBlur = 0;
                        if (Math.random() < 0.5) {
                            self._particles.push({
                                x: curX, y: curY,
                                vx: (Math.random() - 0.5) * 2,
                                vy: (Math.random() - 0.5) * 2,
                                life: 1.0,
                                size: 2 + Math.random() * 2
                            });
                        }
                    }
                }
            }
            for (let pi = self._particles.length - 1; pi >= 0; pi--) {
                const p = self._particles[pi];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.04;
                if (p.life <= 0) { self._particles.splice(pi, 1); continue; }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(129, 140, 248, ${p.life * 0.6})`;
                ctx.fill();
            }
            for (const city of cities) {
                const pos = positions[city];
                const dfsIdx = dfsOrder.indexOf(city);
                const isLit = litNodes.includes(city);
                const isCurrentTarget = isPulse && (
                    (currentStep === 0 && city === dfsOrder[0]) ||
                    (currentStep > 0 && city === dfsOrder[currentStep])
                );
                if (isCurrentTarget) {
                    const pulseRadius = 16 + 20 * pulseProgress;
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, pulseRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(129, 140, 248, ${0.6 * (1 - pulseProgress)})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    const pulseRadius2 = 16 + 12 * pulseProgress;
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, pulseRadius2, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(129, 140, 248, ${0.4 * (1 - pulseProgress)})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
                if (isLit) {
                    ctx.fillStyle = '#c0c1ff'; 
                    ctx.shadowColor = '#c0c1ff';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.fillStyle = '#2a283a';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = isLit ? '#2F2FE4' : '#454556';
                ctx.lineWidth = 2;
                ctx.stroke();
                if (isLit && dfsIdx !== -1) {
                    ctx.font = 'bold 10px Poppins, sans-serif';
                    ctx.fillStyle = '#080616';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(dfsIdx + 1, pos.x, pos.y);
                }
                ctx.font = '11px Poppins, sans-serif';
                ctx.fillStyle = isLit ? '#c0c1ff' : '#e5dff8';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(city, pos.x, pos.y + 22);
            }
            if (progress < 1) {
                self._animId = requestAnimationFrame(drawFrame);
            } else {
                self._animId = null;
                self._particles = [];
                self._startTraversalGlowLoop(canvasId, cities, edges, dfsOrder, parentMap, positions);
                if (onDone) onDone();
            }
        }
        self._animId = requestAnimationFrame(drawFrame);
    },
    _startTraversalGlowLoop(canvasId, cities, edges, dfsOrder, parentMap, positions) {
        if (this._animId) { cancelAnimationFrame(this._animId); this._animId = null; }
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        const self = this;
        const startTime = performance.now();
        const treeEdges = [];
        for (let i = 1; i < dfsOrder.length; i++) {
            const child = dfsOrder[i];
            const parent = parentMap[child];
            if (parent) {
                treeEdges.push({ from: parent, to: child });
            }
        }
        function drawGlow(now) {
            const t = ((now - startTime) % 2000) / 2000;
            const pulse = 0.6 + 0.4 * Math.sin(t * Math.PI * 2);
            ctx.clearRect(0, 0, w, h);
            for (const edge of edges) {
                const from = positions[edge.asal];
                const to = positions[edge.tujuan];
                if (!from || !to) continue;
                const isHL = treeEdges.some(e =>
                    (e.from === edge.asal && e.to === edge.tujuan) ||
                    (e.from === edge.tujuan && e.to === edge.asal)
                );
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = isHL ? 'rgba(47, 47, 228, 0.7)' : 'rgba(22, 46, 147, 0.4)';
                ctx.lineWidth = isHL ? 3 : 1.5;
                ctx.stroke();
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                ctx.font = '10px Poppins, sans-serif';
                ctx.fillStyle = isHL ? '#c0c1ff' : '#908fa2';
                ctx.textAlign = 'center';
                ctx.fillText(`${edge.jarak}km`, mx, my - 6);
            }
            for (const edge of treeEdges) {
                const from = positions[edge.from];
                const to = positions[edge.to];
                if (!from || !to) continue;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = `rgba(129, 140, 248, ${0.15 * pulse})`;
                ctx.lineWidth = 8 + 2 * pulse;
                ctx.shadowColor = '#818cf8';
                ctx.shadowBlur = 10 + 6 * pulse;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = '#818cf8';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#818cf8';
                ctx.shadowBlur = 6 + 4 * pulse;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
            for (const city of cities) {
                const pos = positions[city];
                const dfsIdx = dfsOrder.indexOf(city);
                const isLit = dfsIdx !== -1;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
                if (isLit) {
                    ctx.fillStyle = '#c0c1ff';
                    ctx.shadowColor = '#c0c1ff';
                    ctx.shadowBlur = 8 + 6 * pulse;
                } else {
                    ctx.fillStyle = '#2a283a';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = isLit ? '#2F2FE4' : '#454556';
                ctx.lineWidth = 2;
                ctx.stroke();
                if (isLit) {
                    ctx.font = 'bold 10px Poppins, sans-serif';
                    ctx.fillStyle = '#080616';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(dfsIdx + 1, pos.x, pos.y);
                }
                ctx.font = '11px Poppins, sans-serif';
                ctx.fillStyle = isLit ? '#c0c1ff' : '#e5dff8';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(city, pos.x, pos.y + 22);
            }
            self._animId = requestAnimationFrame(drawGlow);
        }
        self._animId = requestAnimationFrame(drawGlow);
    }
};
