<template>
  <div class="splash-screen" :class="{ hidden: isHiding }">
    <div class="splash-content">
      <h1 class="splash-year">1812</h1>
      <h2 class="splash-title">When Napoleon Ventured East</h2>
      <p class="splash-subtitle">
        拿破仑的俄国远征如何将42万大军团变成一小撮幸存者<br/>
        How the 1812 Patriotic War turned Napoleon's Grand Army into a handful of survivors
      </p>
      <button class="splash-enter" @click="handleEnter">
        开始探索 / EXPLORE
      </button>
    </div>
    <div class="splash-scroll-hint">
      <span>↓</span>
      <span>Scroll to explore</span>
    </div>

    <!-- Background Animation -->
    <div class="splash-bg">
      <div class="snow-particles"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['enter'])
const isHiding = ref(false)

function handleEnter() {
  isHiding.value = true
  setTimeout(() => {
    emit('enter')
  }, 1000)
}
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 1s ease, visibility 1s ease;
}

.splash-screen.hidden {
  opacity: 0;
  visibility: hidden;
}

.splash-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.snow-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.3), transparent),
    radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.4), transparent);
  background-size: 200px 200px;
  animation: snow 20s linear infinite;
}

@keyframes snow {
  0% { transform: translateY(-200px); }
  100% { transform: translateY(100vh); }
}

.splash-content {
  text-align: center;
  padding: 40px;
  position: relative;
  z-index: 1;
}

.splash-year {
  font-family: 'Playfair Display', serif;
  font-size: 10rem;
  font-weight: 700;
  color: #C9A86C;
  letter-spacing: 0.3em;
  margin-bottom: 1rem;
  text-shadow: 0 0 60px rgba(201, 168, 108, 0.3);
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 40px rgba(201, 168, 108, 0.2); }
  to { text-shadow: 0 0 80px rgba(201, 168, 108, 0.4); }
}

.splash-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: #F5F0E6;
  letter-spacing: 0.15em;
  margin-bottom: 2rem;
  text-transform: uppercase;
}

.splash-subtitle {
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 2;
}

.splash-enter {
  padding: 18px 60px;
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: transparent;
  border: 1px solid #C9A86C;
  color: #C9A86C;
  cursor: pointer;
  transition: all 0.3s ease;
}

.splash-enter:hover {
  background: #C9A86C;
  color: #0d0d0d;
}

.splash-scroll-hint {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(-10px); }
  60% { transform: translateX(-50%) translateY(-5px); }
}

@media (max-width: 768px) {
  .splash-content {
    padding: 20px;
  }
  
  .splash-year {
    font-size: 4rem;
    letter-spacing: 0.15em;
    margin-bottom: 0.5rem;
  }
  
  .splash-title {
    font-size: 1.2rem;
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
  }
  
  .splash-subtitle {
    font-size: 0.85rem;
    line-height: 1.8;
    margin-bottom: 2rem;
    padding: 0 10px;
  }
  
  .splash-enter {
    padding: 14px 40px;
    font-size: 0.9rem;
    letter-spacing: 0.15em;
  }
  
  .splash-scroll-hint {
    bottom: 30px;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .splash-year {
    font-size: 3rem;
  }
  
  .splash-title {
    font-size: 1rem;
  }
  
  .splash-subtitle {
    font-size: 0.8rem;
  }
}
</style>
