<template>
  <nav class="chapter-nav">
    <div 
      v-for="(chapter, index) in chapters" 
      :key="chapter.id"
      class="nav-dot"
      :class="{ active: index === currentIndex }"
      @click="$emit('navigate', index)"
    >
      <span class="nav-tooltip">{{ chapter.number }}. {{ chapter.title }}</span>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  chapters: Array,
  currentIndex: Number
})

defineEmits(['navigate'])
</script>

<style scoped>
.chapter-nav {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.nav-dot:hover,
.nav-dot.active {
  background: #C9A86C;
  border-color: #C9A86C;
  transform: scale(1.4);
}

.nav-tooltip {
  position: absolute;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.9);
  padding: 8px 14px;
  border-radius: 4px;
  white-space: nowrap;
  font-size: 0.8rem;
  color: #F5F0E6;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
}

.nav-dot:hover .nav-tooltip {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 768px) {
  .chapter-nav {
    right: 15px;
    gap: 10px;
  }
  
  .nav-dot {
    width: 8px;
    height: 8px;
  }
}
</style>
