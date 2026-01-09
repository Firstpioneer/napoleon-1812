<template>
  <div class="timeline-container">
    <div class="timeline-wrapper">
      <div class="timeline-chart" ref="chartContainer"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import { napoleonAdvance, napoleonRetreat, temperatureData, keyEvents } from '../stores/campaignData.js'

const props = defineProps({
  currentDate: String
})

const emit = defineEmits(['date-select'])

const chartContainer = ref(null)
let svg = null

onMounted(() => {
  createChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  if (chartContainer.value) {
    d3.select(chartContainer.value).selectAll('*').remove()
    createChart()
  }
}

function createChart() {
  const container = chartContainer.value
  if (!container) return
  
  const width = container.clientWidth
  const height = 80
  const margin = { top: 10, right: 40, bottom: 25, left: 50 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom
  
  svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
  
  // Combine all dates
  const allData = [
    ...napoleonAdvance.map(d => ({ ...d, type: 'advance' })),
    ...napoleonRetreat.map(d => ({ ...d, type: 'retreat' }))
  ]
  
  // Date extent
  const dateExtent = d3.extent(allData, d => new Date(d.date))
  
  // X scale - time
  const x = d3.scaleTime()
    .domain(dateExtent)
    .range([0, innerWidth])
  
  // Y scale - temperature (inverted)
  const y = d3.scaleLinear()
    .domain([-40, 25])
    .range([innerHeight, 0])
  
  // Zero line
  g.append('line')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', y(0))
    .attr('y2', y(0))
    .attr('stroke', 'rgba(255,255,255,0.3)')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3')
  
  // Temperature area
  const tempArea = d3.area()
    .x(d => x(new Date(d.date)))
    .y0(y(0))
    .y1(d => y(d.temp))
    .curve(d3.curveMonotoneX)
  
  // Gradient for cold area
  const defs = svg.append('defs')
  
  const coldGradient = defs.append('linearGradient')
    .attr('id', 'coldGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')
  
  coldGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#4A90D9')
    .attr('stop-opacity', 0.7)
  
  coldGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#4A90D9')
    .attr('stop-opacity', 0.1)
  
  // Draw temperature area
  g.append('path')
    .datum(temperatureData)
    .attr('fill', 'url(#coldGradient)')
    .attr('d', tempArea)
  
  // Temperature line
  const tempLine = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.temp))
    .curve(d3.curveMonotoneX)
  
  g.append('path')
    .datum(temperatureData)
    .attr('fill', 'none')
    .attr('stroke', '#4A90D9')
    .attr('stroke-width', 2)
    .attr('d', tempLine)
  
  // Temperature points
  g.selectAll('.temp-dot')
    .data(temperatureData)
    .enter()
    .append('circle')
    .attr('class', 'temp-dot')
    .attr('cx', d => x(new Date(d.date)))
    .attr('cy', d => y(d.temp))
    .attr('r', 4)
    .attr('fill', '#4A90D9')
    .attr('stroke', '#1a1a1a')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      d3.select(this).attr('r', 6)
      showTooltip(event, d)
    })
    .on('mouseout', function() {
      d3.select(this).attr('r', 4)
      hideTooltip()
    })
  
  // Battle markers
  const battles = keyEvents.filter(e => e.type === 'battle')
  
  g.selectAll('.battle-marker')
    .data(battles)
    .enter()
    .append('g')
    .attr('class', 'battle-marker')
    .attr('transform', d => `translate(${x(new Date(d.date))}, ${innerHeight + 5})`)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      emit('date-select', d.date)
    })
    .each(function(d) {
      const marker = d3.select(this)
      
      marker.append('line')
        .attr('y1', -innerHeight - 5)
        .attr('y2', -5)
        .attr('stroke', '#C0392B')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.5)
      
      marker.append('text')
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#C0392B')
        .attr('font-size', '10px')
        .text('⚔')
    })
  
  // X axis
  const xAxis = d3.axisBottom(x)
    .ticks(8)
    .tickFormat(d3.timeFormat('%m/%d'))
  
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(xAxis)
    .selectAll('text')
    .attr('fill', 'rgba(255,255,255,0.7)')
    .attr('font-size', '10px')
  
  g.selectAll('.x-axis path, .x-axis line')
    .attr('stroke', 'rgba(255,255,255,0.3)')
  
  // Y axis label
  svg.append('text')
    .attr('x', 10)
    .attr('y', height / 2)
    .attr('fill', 'rgba(255,255,255,0.5)')
    .attr('font-size', '9px')
    .text('°C')
  
  // Phase labels
  const phaseLabels = [
    { date: '1812-07-15', label: '进攻', color: '#D4A373' },
    { date: '1812-10-25', label: '撤退', color: '#888' }
  ]
  
  phaseLabels.forEach(phase => {
    g.append('text')
      .attr('x', x(new Date(phase.date)))
      .attr('y', -2)
      .attr('text-anchor', 'middle')
      .attr('fill', phase.color)
      .attr('font-size', '9px')
      .attr('letter-spacing', '0.1em')
      .text(phase.label)
  })
}

// Tooltip
let tooltip = null

function showTooltip(event, d) {
  if (!tooltip) {
    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'timeline-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.9)')
      .style('color', '#F5F0E6')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '2000')
  }
  
  tooltip
    .style('left', (event.pageX + 10) + 'px')
    .style('top', (event.pageY - 30) + 'px')
    .style('opacity', 1)
    .html(`
      <strong>${d.date}</strong><br/>
      温度: ${d.temp}°C<br/>
      ${d.description}
    `)
}

function hideTooltip() {
  if (tooltip) {
    tooltip.style('opacity', 0)
  }
}
</script>

<style scoped>
.timeline-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110px;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 80%, transparent 100%);
  z-index: 100;
  padding: 15px 40px 10px;
}

.timeline-wrapper {
  height: 100%;
}

.timeline-chart {
  width: 100%;
  height: 80px;
}

@media (max-width: 768px) {
  .timeline-container {
    padding: 10px 20px 5px;
    height: 100px;
  }
}
</style>
