// 1812: Frozen Ambition - 主应用程序

class NapoleonVisualization {
    constructor() {
        this.map = null;
        this.currentTime = 0;
        this.isPlaying = false;
        this.animationSpeed = 100;
        this.currentPhase = 'advance';
        this.layers = {
            advance: null,
            retreat: null,
            schwarzenberg: null,
            markers: [],
            particles: []
        };
        this.brushExtent = null;
        
        this.init();
    }

    async init() {
        await this.loadingScreen();
        this.initMap();
        this.initTimeline();
        this.initButterflyChart();
        this.bindEvents();
        this.drawInitialState();
    }

    async loadingScreen() {
        return new Promise(resolve => {
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                resolve();
            }, 2500);
        });
    }

    // 初始化地图
    initMap() {
        this.map = L.map('map', {
            center: [55.0, 30.0],
            zoom: 5,
            minZoom: 4,
            maxZoom: 8,
            zoomControl: true
        });

        // 添加底图 - 使用复古风格
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap, © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        // 添加复古滤镜效果
        const mapContainer = document.getElementById('map');
        mapContainer.style.filter = 'sepia(15%) contrast(95%)';

        // 绘制河流
        this.drawRivers();
        
        // 绘制城市标签
        this.drawCityLabels();
    }

    // 绘制河流
    drawRivers() {
        rivers.forEach(river => {
            L.polyline(river.coords, {
                color: '#4A90D9',
                weight: 2,
                opacity: 0.5,
                dashArray: '5, 5'
            }).addTo(this.map);
        });
    }

    // 绘制城市标签
    drawCityLabels() {
        cityLabels.forEach(city => {
            const label = L.divIcon({
                className: 'city-label',
                html: city.name,
                iconSize: null
            });
            L.marker([city.lat, city.lon], { icon: label }).addTo(this.map);
        });
    }

    // 绘制初始状态
    drawInitialState() {
        this.drawAdvanceRoute();
        this.drawRetreatRoute();
        this.drawSchwarzenberRoute();
        this.drawEventMarkers();
        this.updateNarrative('phase1');
    }

    // 绘制进攻路线
    drawAdvanceRoute() {
        const coords = napoleonAdvance.map(p => [p.lat, p.lon]);
        
        // 主线 - 渐变宽度效果
        this.layers.advance = L.polyline(coords, {
            color: '#D4A373',
            weight: 8,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(this.map);

        // 添加宽度渐变效果（通过多层实现）
        napoleonAdvance.forEach((point, i) => {
            if (i < napoleonAdvance.length - 1) {
                const next = napoleonAdvance[i + 1];
                const width = Math.max(2, (point.survivors / 422000) * 15);
                
                L.polyline([[point.lat, point.lon], [next.lat, next.lon]], {
                    color: '#D4A373',
                    weight: width,
                    opacity: 0.8,
                    lineCap: 'round'
                }).addTo(this.map);
            }
        });
    }

    // 绘制撤退路线
    drawRetreatRoute() {
        const coords = napoleonRetreat.map(p => [p.lat, p.lon]);
        
        // 撤退路线 - 黑色，宽度递减
        napoleonRetreat.forEach((point, i) => {
            if (i < napoleonRetreat.length - 1) {
                const next = napoleonRetreat[i + 1];
                const width = Math.max(1, (point.survivors / 95000) * 8);
                
                L.polyline([[point.lat, point.lon], [next.lat, next.lon]], {
                    color: '#2D2D2D',
                    weight: width,
                    opacity: 0.85,
                    lineCap: 'round'
                }).addTo(this.map);
            }
        });
    }

    // 绘制施瓦岑贝格路线
    drawSchwarzenberRoute() {
        const coords = schwarzenbergRoute.map(p => [p.lat, p.lon]);
        
        this.layers.schwarzenberg = L.polyline(coords, {
            color: '#2A9D8F',
            weight: 5,
            opacity: 0.7,
            lineCap: 'round',
            dashArray: '10, 5'
        }).addTo(this.map);
    }

    // 绘制事件标记
    drawEventMarkers() {
        keyEvents.forEach(event => {
            let iconHtml = '';
            let className = 'custom-marker';
            
            switch(event.type) {
                case 'battle':
                    iconHtml = '⚔️';
                    break;
                case 'cold':
                    iconHtml = '❄️';
                    break;
                case 'city':
                    iconHtml = '🏛️';
                    break;
                case 'start':
                case 'end':
                    iconHtml = '🚩';
                    break;
                case 'retreat':
                    iconHtml = '↩️';
                    break;
                default:
                    iconHtml = '📍';
            }

            const icon = L.divIcon({
                className: className,
                html: `<span style="font-size: 24px; filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));">${iconHtml}</span>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker(event.location, { icon: icon })
                .addTo(this.map)
                .on('click', () => this.showEventCard(event));

            // 添加tooltip
            marker.bindTooltip(event.name, {
                permanent: false,
                direction: 'top',
                className: 'city-label'
            });

            this.layers.markers.push(marker);
        });
    }

    // 显示事件卡片
    showEventCard(event) {
        const card = document.getElementById('event-card');
        const overlay = document.querySelector('.card-overlay') || this.createOverlay();
        
        card.querySelector('.card-title').textContent = event.name;
        card.querySelector('.card-date').textContent = event.date;
        card.querySelector('.card-description').textContent = event.description;
        card.querySelector('.stat-value.troops').textContent = event.troops ? event.troops.toLocaleString() : '--';
        card.querySelector('.stat-value.temp').textContent = event.temp !== null ? `${event.temp}°C` : '--';
        
        // 设置图片
        const imageDiv = card.querySelector('.card-image');
        if (event.image) {
            imageDiv.style.backgroundImage = `url(${event.image})`;
        } else {
            imageDiv.style.backgroundImage = 'linear-gradient(135deg, #5D4E37 0%, #8B7355 100%)';
        }

        card.classList.remove('hidden');
        overlay.classList.add('active');

        // 同步更新其他视图
        this.syncViews(event);
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', () => this.hideEventCard());
        return overlay;
    }

    hideEventCard() {
        document.getElementById('event-card').classList.add('hidden');
        const overlay = document.querySelector('.card-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    // 同步视图
    syncViews(event) {
        // 更新状态面板
        document.getElementById('current-date').textContent = event.date;
        document.getElementById('current-troops').textContent = event.troops ? event.troops.toLocaleString() : '--';
        document.getElementById('current-temp').textContent = event.temp !== null ? `${event.temp}°C` : '--';

        // 更新叙事面板
        const date = new Date(event.date);
        const month = date.getMonth();
        if (month <= 6) {
            this.updateNarrative('phase1');
        } else if (month <= 8) {
            this.updateNarrative('phase2');
        } else if (month <= 9) {
            this.updateNarrative('phase3');
        } else {
            this.updateNarrative('phase4');
        }

        // 地图定位
        this.map.flyTo(event.location, 7, { duration: 1 });
    }

    // 更新叙事
    updateNarrative(phase) {
        const narrative = narrativeTexts[phase];
        if (!narrative) return;

        const content = document.getElementById('narrative-content');
        content.innerHTML = `
            <p class="phase-title">${narrative.title}</p>
            <p class="date-range" style="color: #888; font-size: 0.85rem; margin-bottom: 10px;">${narrative.dateRange}</p>
            <p>${narrative.content}</p>
        `;
    }

    // 初始化时间轴
    initTimeline() {
        const container = document.getElementById('temperature-chart');
        const width = container.clientWidth;
        const height = 80;
        const margin = { top: 10, right: 30, bottom: 30, left: 50 };

        const svg = d3.select('#temperature-chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height + margin.bottom);

        // 合并所有日期数据
        const allDates = [
            ...napoleonAdvance.map(d => ({ date: new Date(d.date), type: 'advance' })),
            ...napoleonRetreat.map(d => ({ date: new Date(d.date), type: 'retreat' }))
        ];

        const dateExtent = d3.extent(allDates, d => d.date);

        // X轴 - 时间
        const x = d3.scaleTime()
            .domain(dateExtent)
            .range([margin.left, width - margin.right]);

        // Y轴 - 温度（反转）
        const y = d3.scaleLinear()
            .domain([-40, 10])
            .range([height - margin.bottom, margin.top]);

        // 绘制0度线
        svg.append('line')
            .attr('x1', margin.left)
            .attr('x2', width - margin.right)
            .attr('y1', y(0))
            .attr('y2', y(0))
            .attr('stroke', '#F5F0E6')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3')
            .attr('opacity', 0.5);

        // 温度区域（冰冻区）
        const tempArea = d3.area()
            .x(d => x(new Date(d.date)))
            .y0(y(0))
            .y1(d => y(d.temp))
            .curve(d3.curveMonotoneX);

        // 冰冻背景
        svg.append('path')
            .datum(temperatureData)
            .attr('fill', 'url(#freezeGradient)')
            .attr('opacity', 0.6)
            .attr('d', tempArea);

        // 渐变定义
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'freezeGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#4A90D9')
            .attr('stop-opacity', 0.8);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#4A90D9')
            .attr('stop-opacity', 0.1);

        // 温度线
        const tempLine = d3.line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.temp))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(temperatureData)
            .attr('fill', 'none')
            .attr('stroke', '#4A90D9')
            .attr('stroke-width', 2)
            .attr('d', tempLine);

        // 温度点
        svg.selectAll('.temp-dot')
            .data(temperatureData)
            .enter()
            .append('circle')
            .attr('class', 'temp-dot')
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.temp))
            .attr('r', 4)
            .attr('fill', '#4A90D9')
            .attr('stroke', '#F5F0E6')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                d3.select(this).attr('r', 6);
                // 显示tooltip
            })
            .on('mouseout', function() {
                d3.select(this).attr('r', 4);
            });

        // X轴
        const xAxis = d3.axisBottom(x)
            .ticks(8)
            .tickFormat(d3.timeFormat('%m/%d'));

        svg.append('g')
            .attr('transform', `translate(0, ${height - margin.bottom})`)
            .attr('class', 'x-axis')
            .call(xAxis)
            .selectAll('text')
            .attr('fill', '#F5F0E6')
            .attr('font-size', '10px');

        svg.selectAll('.x-axis path, .x-axis line')
            .attr('stroke', '#F5F0E6')
            .attr('opacity', 0.5);

        // Y轴标签
        svg.append('text')
            .attr('x', margin.left - 35)
            .attr('y', height / 2)
            .attr('fill', '#F5F0E6')
            .attr('font-size', '10px')
            .attr('text-anchor', 'middle')
            .attr('transform', `rotate(-90, ${margin.left - 35}, ${height / 2})`)
            .text('温度 °C');

        // 事件标记
        this.drawTimelineEvents(svg, x, height, margin);

        // 画刷交互
        this.initBrush(svg, x, width, height, margin);

        this.timelineScales = { x, y };
    }

    // 绘制时间轴事件
    drawTimelineEvents(svg, x, height, margin) {
        const events = keyEvents.filter(e => e.type === 'battle');
        
        svg.selectAll('.event-marker')
            .data(events)
            .enter()
            .append('g')
            .attr('class', 'event-marker')
            .attr('transform', d => `translate(${x(new Date(d.date))}, ${height - margin.bottom + 15})`)
            .each(function(d) {
                const g = d3.select(this);
                g.append('line')
                    .attr('y1', -15)
                    .attr('y2', -5)
                    .attr('stroke', '#C0392B')
                    .attr('stroke-width', 1);
                
                g.append('text')
                    .attr('y', 10)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#F5F0E6')
                    .attr('font-size', '8px')
                    .text('⚔');
            })
            .style('cursor', 'pointer')
            .on('click', (event, d) => this.showEventCard(d));
    }

    // 初始化画刷
    initBrush(svg, x, width, height, margin) {
        const brush = d3.brushX()
            .extent([[margin.left, 0], [width - margin.right, height - margin.bottom]])
            .on('brush end', (event) => this.onBrush(event, x));

        svg.append('g')
            .attr('class', 'brush')
            .call(brush);
    }

    onBrush(event, x) {
        if (!event.selection) return;
        
        const [x0, x1] = event.selection.map(x.invert);
        this.brushExtent = [x0, x1];
        
        // 更新显示
        const midDate = new Date((x0.getTime() + x1.getTime()) / 2);
        document.getElementById('current-date').textContent = d3.timeFormat('%Y-%m-%d')(midDate);

        // 找到对应时间点的数据
        const allData = [...napoleonAdvance, ...napoleonRetreat];
        const closest = allData.reduce((prev, curr) => {
            const prevDiff = Math.abs(new Date(prev.date) - midDate);
            const currDiff = Math.abs(new Date(curr.date) - midDate);
            return currDiff < prevDiff ? curr : prev;
        });

        if (closest) {
            document.getElementById('current-troops').textContent = closest.survivors.toLocaleString();
            
            // 找温度
            const tempData = temperatureData.find(t => new Date(t.date) <= midDate);
            if (tempData) {
                document.getElementById('current-temp').textContent = `${tempData.temp}°C`;
            }
        }

        // 更新蝴蝶图
        this.updateButterflyChart(closest ? closest.survivors : null);
    }

    // 初始化蝴蝶图
    initButterflyChart() {
        const container = document.getElementById('butterfly-chart');
        const width = container.clientWidth;
        const height = container.clientHeight || 200;
        const margin = { top: 20, right: 20, bottom: 30, left: 20 };

        const svg = d3.select('#butterfly-chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // 数据
        const stages = [
            { name: '出发', napoleon: 422000, schwarzenberg: 30000 },
            { name: '莫斯科', napoleon: 95000, schwarzenberg: 28000 },
            { name: '结束', napoleon: 10000, schwarzenberg: 30000 }
        ];

        const maxValue = 422000;
        const centerX = width / 2;
        const barHeight = 25;
        const gap = 15;

        // X轴比例尺
        const x = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, centerX - 40]);

        // 绘制每个阶段
        stages.forEach((stage, i) => {
            const y = margin.top + i * (barHeight + gap);

            // 中间标签
            svg.append('text')
                .attr('x', centerX)
                .attr('y', y + barHeight / 2 + 4)
                .attr('text-anchor', 'middle')
                .attr('fill', '#3D3D3D')
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                .text(stage.name);

            // 拿破仑 - 左侧
            svg.append('rect')
                .attr('class', 'napoleon-bar')
                .attr('x', centerX - 35 - x(stage.napoleon))
                .attr('y', y)
                .attr('width', x(stage.napoleon))
                .attr('height', barHeight)
                .attr('fill', '#D4A373')
                .attr('rx', 3);

            // 拿破仑数字
            svg.append('text')
                .attr('x', centerX - 40 - x(stage.napoleon))
                .attr('y', y + barHeight / 2 + 4)
                .attr('text-anchor', 'end')
                .attr('fill', '#3D3D3D')
                .attr('font-size', '9px')
                .text((stage.napoleon / 1000).toFixed(0) + 'k');

            // 施瓦岑贝格 - 右侧
            svg.append('rect')
                .attr('class', 'schwarzenberg-bar')
                .attr('x', centerX + 35)
                .attr('y', y)
                .attr('width', x(stage.schwarzenberg))
                .attr('height', barHeight)
                .attr('fill', '#2A9D8F')
                .attr('rx', 3);

            // 施瓦岑贝格数字
            svg.append('text')
                .attr('x', centerX + 40 + x(stage.schwarzenberg))
                .attr('y', y + barHeight / 2 + 4)
                .attr('text-anchor', 'start')
                .attr('fill', '#3D3D3D')
                .attr('font-size', '9px')
                .text((stage.schwarzenberg / 1000).toFixed(0) + 'k');
        });

        // 图例
        const legendY = height - 20;
        svg.append('rect').attr('x', 20).attr('y', legendY).attr('width', 12).attr('height', 12).attr('fill', '#D4A373');
        svg.append('text').attr('x', 36).attr('y', legendY + 10).attr('font-size', '10px').attr('fill', '#3D3D3D').text('拿破仑');
        
        svg.append('rect').attr('x', width - 90).attr('y', legendY).attr('width', 12).attr('height', 12).attr('fill', '#2A9D8F');
        svg.append('text').attr('x', width - 74).attr('y', legendY + 10).attr('font-size', '10px').attr('fill', '#3D3D3D').text('施瓦岑贝格');

        this.butterflyChart = svg;
    }

    updateButterflyChart(napoleonTroops) {
        // 可以添加动态更新逻辑
    }

    // 绑定事件
    bindEvents() {
        // 播放按钮
        document.getElementById('btn-play').addEventListener('click', () => this.togglePlay());
        
        // 重置按钮
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());

        // 图例切换
        document.getElementById('show-napoleon').addEventListener('change', (e) => {
            if (this.layers.advance) {
                this.layers.advance.setStyle({ opacity: e.target.checked ? 0.9 : 0 });
            }
        });

        document.getElementById('show-schwarzenberg').addEventListener('change', (e) => {
            if (this.layers.schwarzenberg) {
                this.layers.schwarzenberg.setStyle({ opacity: e.target.checked ? 0.7 : 0 });
            }
        });

        // 关闭卡片
        document.querySelector('.card-close').addEventListener('click', () => this.hideEventCard());

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideEventCard();
            if (e.key === ' ') this.togglePlay();
        });
    }

    // 播放/暂停
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('btn-play');
        btn.querySelector('.icon-play').textContent = this.isPlaying ? '⏸' : '▶';
        
        if (this.isPlaying) {
            this.startAnimation();
        } else {
            this.stopAnimation();
        }
    }

    startAnimation() {
        const allEvents = keyEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        let index = 0;

        this.animationInterval = setInterval(() => {
            if (index >= allEvents.length) {
                this.stopAnimation();
                return;
            }

            const event = allEvents[index];
            this.showEventCard(event);
            index++;
        }, 3000);
    }

    stopAnimation() {
        this.isPlaying = false;
        document.getElementById('btn-play').querySelector('.icon-play').textContent = '▶';
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
    }

    // 重置
    reset() {
        this.stopAnimation();
        this.hideEventCard();
        this.map.flyTo([55.0, 30.0], 5, { duration: 1 });
        this.updateNarrative('phase1');
        document.getElementById('current-date').textContent = '1812年6月24日';
        document.getElementById('current-troops').textContent = '422,000';
        document.getElementById('current-temp').textContent = '--';
    }
}

// 粒子动画系统 - 模拟军队行进
class ParticleSystem {
    constructor(map) {
        this.map = map;
        this.particles = [];
        this.animating = false;
        this.currentFrame = 0;
    }

    createParticles(path, color = '#D4A373', count = 30) {
        this.clear();
        
        for (let i = 0; i < count; i++) {
            const marker = L.circleMarker([path[0].lat, path[0].lon], {
                radius: 4,
                fillColor: color,
                fillOpacity: 0.9,
                stroke: true,
                color: '#FFF',
                weight: 1
            }).addTo(this.map);
            
            this.particles.push({
                marker: marker,
                progress: i / count,
                speed: 0.002 + Math.random() * 0.001
            });
        }
    }

    animate(path, onComplete) {
        this.animating = true;
        
        const animateFrame = () => {
            if (!this.animating) return;
            
            let allComplete = true;
            
            this.particles.forEach(p => {
                if (p.progress < 1) {
                    allComplete = false;
                    p.progress += p.speed;
                    
                    const index = Math.min(
                        Math.floor(p.progress * (path.length - 1)),
                        path.length - 2
                    );
                    const nextIndex = index + 1;
                    const localProgress = (p.progress * (path.length - 1)) - index;
                    
                    const lat = path[index].lat + (path[nextIndex].lat - path[index].lat) * localProgress;
                    const lon = path[index].lon + (path[nextIndex].lon - path[index].lon) * localProgress;
                    
                    p.marker.setLatLng([lat, lon]);
                    
                    // 根据兵力调整粒子大小
                    const survivors = path[index].survivors;
                    const maxSurvivors = path[0].survivors;
                    const size = 2 + (survivors / maxSurvivors) * 4;
                    p.marker.setRadius(size);
                }
            });
            
            if (allComplete) {
                this.animating = false;
                if (onComplete) onComplete();
            } else {
                requestAnimationFrame(animateFrame);
            }
        };
        
        animateFrame();
    }

    stop() {
        this.animating = false;
    }

    clear() {
        this.stop();
        this.particles.forEach(p => this.map.removeLayer(p.marker));
        this.particles = [];
    }
}

// 路径绘制动画
class PathAnimator {
    constructor(map) {
        this.map = map;
        this.currentPath = null;
        this.segments = [];
    }

    animatePath(path, color, duration = 5000) {
        return new Promise(resolve => {
            const totalSegments = path.length - 1;
            const segmentDuration = duration / totalSegments;
            let currentSegment = 0;

            const drawSegment = () => {
                if (currentSegment >= totalSegments) {
                    resolve();
                    return;
                }

                const start = path[currentSegment];
                const end = path[currentSegment + 1];
                const width = Math.max(2, (start.survivors / path[0].survivors) * 12);

                const segment = L.polyline(
                    [[start.lat, start.lon], [end.lat, end.lon]],
                    {
                        color: color,
                        weight: width,
                        opacity: 0,
                        lineCap: 'round'
                    }
                ).addTo(this.map);

                this.segments.push(segment);

                // 淡入动画
                let opacity = 0;
                const fadeIn = setInterval(() => {
                    opacity += 0.1;
                    segment.setStyle({ opacity: Math.min(opacity, 0.85) });
                    if (opacity >= 0.85) {
                        clearInterval(fadeIn);
                    }
                }, 30);

                currentSegment++;
                setTimeout(drawSegment, segmentDuration);
            };

            drawSegment();
        });
    }

    clear() {
        this.segments.forEach(s => this.map.removeLayer(s));
        this.segments = [];
    }
}

// 滚动叙事控制器
class ScrollytellingController {
    constructor(app) {
        this.app = app;
        this.chapters = [
            { id: 'intro', trigger: 0, action: () => this.showIntro() },
            { id: 'invasion', trigger: 0.15, action: () => this.showInvasion() },
            { id: 'pursuit', trigger: 0.35, action: () => this.showPursuit() },
            { id: 'battle', trigger: 0.55, action: () => this.showBattle() },
            { id: 'retreat', trigger: 0.75, action: () => this.showRetreat() },
            { id: 'end', trigger: 0.95, action: () => this.showEnd() }
        ];
        this.currentChapter = null;
    }

    showIntro() {
        this.app.map.flyTo([55.0, 28.0], 5, { duration: 2 });
        this.app.updateNarrative('phase1');
    }

    showInvasion() {
        this.app.map.flyTo([54.7, 25.3], 7, { duration: 1.5 });
        const event = keyEvents.find(e => e.id === 'vilnius');
        if (event) this.app.showEventCard(event);
    }

    showPursuit() {
        this.app.map.flyTo([54.8, 32.0], 7, { duration: 1.5 });
        this.app.updateNarrative('phase2');
        const event = keyEvents.find(e => e.id === 'smolensk');
        if (event) this.app.showEventCard(event);
    }

    showBattle() {
        this.app.map.flyTo([55.5, 35.8], 8, { duration: 1.5 });
        this.app.updateNarrative('phase3');
        const event = keyEvents.find(e => e.id === 'borodino');
        if (event) this.app.showEventCard(event);
    }

    showRetreat() {
        this.app.map.flyTo([54.3, 28.5], 7, { duration: 1.5 });
        this.app.updateNarrative('phase4');
        const event = keyEvents.find(e => e.id === 'berezina');
        if (event) this.app.showEventCard(event);
    }

    showEnd() {
        this.app.map.flyTo([54.9, 24.0], 7, { duration: 1.5 });
        const event = keyEvents.find(e => e.id === 'end');
        if (event) this.app.showEventCard(event);
    }
}

// 热力图层 - 显示死亡密度
class DeathHeatmap {
    constructor(map) {
        this.map = map;
        this.layer = null;
    }

    generate(advanceData, retreatData) {
        const heatData = [];
        
        // 计算每段的死亡人数
        for (let i = 0; i < advanceData.length - 1; i++) {
            const deaths = advanceData[i].survivors - advanceData[i + 1].survivors;
            if (deaths > 0) {
                heatData.push({
                    lat: (advanceData[i].lat + advanceData[i + 1].lat) / 2,
                    lon: (advanceData[i].lon + advanceData[i + 1].lon) / 2,
                    intensity: deaths
                });
            }
        }
        
        for (let i = 0; i < retreatData.length - 1; i++) {
            const deaths = retreatData[i].survivors - retreatData[i + 1].survivors;
            if (deaths > 0) {
                heatData.push({
                    lat: (retreatData[i].lat + retreatData[i + 1].lat) / 2,
                    lon: (retreatData[i].lon + retreatData[i + 1].lon) / 2,
                    intensity: deaths * 2 // 撤退期间死亡更惨烈
                });
            }
        }
        
        // 用圆形标记表示死亡密度
        heatData.forEach(point => {
            const radius = Math.sqrt(point.intensity) / 50;
            L.circle([point.lat, point.lon], {
                radius: radius * 5000,
                fillColor: '#8B0000',
                fillOpacity: 0.2,
                stroke: false
            }).addTo(this.map);
        });
    }
}

// 统计信息面板
class StatsPanel {
    constructor() {
        this.advanceStats = this.calculateStats(napoleonAdvance);
        this.retreatStats = this.calculateStats(napoleonRetreat);
    }

    calculateStats(data) {
        const start = data[0].survivors;
        const end = data[data.length - 1].survivors;
        const loss = start - end;
        const lossRate = ((loss / start) * 100).toFixed(1);
        
        return { start, end, loss, lossRate };
    }

    getComparisonHTML() {
        return `
            <div class="stats-comparison">
                <div class="stat-block advance">
                    <h4>进攻阶段</h4>
                    <p>起始: ${this.advanceStats.start.toLocaleString()}</p>
                    <p>到达莫斯科: ${this.advanceStats.end.toLocaleString()}</p>
                    <p>损失: ${this.advanceStats.loss.toLocaleString()} (${this.advanceStats.lossRate}%)</p>
                </div>
                <div class="stat-block retreat">
                    <h4>撤退阶段</h4>
                    <p>起始: ${this.retreatStats.start.toLocaleString()}</p>
                    <p>最终: ${this.retreatStats.end.toLocaleString()}</p>
                    <p>损失: ${this.retreatStats.loss.toLocaleString()} (${this.retreatStats.lossRate}%)</p>
                </div>
            </div>
        `;
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NapoleonVisualization();
    
    // 添加额外的交互提示
    console.log('%c1812: Frozen Ambition', 'font-size: 24px; font-weight: bold; color: #D4A373;');
    console.log('%c拿破仑俄国战役可视化系统已加载', 'font-size: 14px; color: #666;');
    console.log('提示: 点击地图上的标记查看详情，拖动底部时间轴筛选时间范围');
});
