<template>
  <div class="map-legend" :class="{ collapsed: isCollapsed }">
    <div class="legend-header" @click="isCollapsed = !isCollapsed">
      <h4 class="legend-title">图例 / Legend</h4>
      <span class="collapse-btn">{{ isCollapsed ? '›' : '‹' }}</span>
    </div>
    
    <div class="legend-content" v-show="!isCollapsed">
      <label class="legend-item clickable">
        <input type="checkbox" :checked="showAdvance" @change="$emit('update:showAdvance', $event.target.checked)" />
        <span class="legend-line advance"></span>
        <span>进攻路线 / Advance</span>
      </label>
      
      <label class="legend-item clickable">
        <input type="checkbox" :checked="showRetreat" @change="$emit('update:showRetreat', $event.target.checked)" />
        <span class="legend-line retreat"></span>
        <span>撤退路线 / Retreat</span>
      </label>
      
      <label class="legend-item clickable">
        <input type="checkbox" :checked="showSchwarzenberg" @change="$emit('update:showSchwarzenberg', $event.target.checked)" />
        <span class="legend-line schwarzenberg"></span>
        <span>施瓦岑贝格军团</span>
      </label>
      
      <div class="legend-divider"></div>
      
      <div class="legend-item">
        <span class="legend-icon">⚔️</span>
        <span>重大战役 / Battle</span>
      </div>
      
      <div class="legend-item">
        <span class="legend-icon">❄️</span>
        <span>极寒事件 / Frost</span>
      </div>
      
      <div class="legend-item">
        <span class="legend-icon">🏛️</span>
        <span>重要城市 / City</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  showAdvance: Boolean,
  showRetreat: Boolean,
  showSchwarzenberg: Boolean
})

defineEmits(['update:showAdvance', 'update:showRetreat', 'update:showSchwarzenberg'])

const isCollapsed = ref(false)
</script>

<style scoped>
.map-legend {
  position: fixed;
  bottom: 140px;
  left: 25px;
  background: rgba(0,0,0,0.85);
  padding: 18px 22px;
  border-radius: 8px;
  z-index: 100;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.map-legend.collapsed {
  padding: 12px 16px;
}

.legend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: 10px;
}

.collapse-btn {
  font-size: 1.2rem;
  color: #C9A86C;
  transition: transform 0.3s;
  line-height: 1;
}

.legend-title {
  font-family: 'Playfair Display', serif;
  font-size: 0.8rem;
  color: #C9A86C;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0;
}

.legend-content {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  color: rgba(255,255,255,0.8);
}

.legend-item.clickable {
  cursor: pointer;
}

.legend-item.clickable:hover {
  color: #F5F0E6;
}

.legend-item input[type="checkbox"] {
  accent-color: #C9A86C;
  width: 14px;
  height: 14px;
}

.legend-line {
  width: 28px;
  height: 4px;
  border-radius: 2px;
}

.legend-line.advance { background: #D4A373; }
.legend-line.retreat { background: #2D2D2D; border: 1px solid #555; }
.legend-line.schwarzenberg { 
  background: #2A9D8F; 
  height: 3px;
}

.legend-icon {
  width: 20px;
  text-align: center;
  font-size: 1rem;
}

.legend-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 12px 0;
}

@media (max-width: 768px) {
  .map-legend {
    bottom: auto;
    top: 70px;
    left: 10px;
    padding: 10px 12px;
    font-size: 0.75rem;
    max-width: 180px;
  }
  
  .map-legend.collapsed {
    padding: 8px 12px;
  }
  
  .legend-title {
    font-size: 0.7rem;
  }
  
  .collapse-btn {
    font-size: 1rem;
  }
  
  .legend-content {
    margin-top: 10px;
    padding-top: 8px;
  }
  
  .legend-item {
    gap: 8px;
    margin: 8px 0;
    font-size: 0.7rem;
  }
  
  .legend-item input[type="checkbox"] {
    width: 12px;
    height: 12px;
  }
  
  .legend-line {
    width: 22px;
    height: 3px;
  }
  
  .legend-icon {
    font-size: 0.85rem;
  }
}
</style>
