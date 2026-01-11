<template>
  <div class="battles-container">
    <h2 class="battles-title">关键战役</h2>
    <p class="battles-subtitle">1812年俄国战役的10个决定性时刻</p>
    
    <div class="battles-grid">
      <div 
        v-for="battle in battles" 
        :key="battle.id"
        class="battle-card"
        :class="battle.phase"
        @click="goToBattle(battle.id)"
      >
        <div class="battle-image" :style="{ backgroundImage: `url(${battle.image})` }">
          <span class="battle-phase-tag" :class="battle.phase">
            {{ battle.phase === 'advance' ? '进攻阶段' : '撤退阶段' }}
          </span>
          <span v-if="battle.type === 'major_battle'" class="major-badge">重大战役</span>
        </div>
        
        <div class="battle-content">
          <h3 class="battle-title">{{ battle.title }}</h3>
          <p class="battle-title-en">{{ battle.titleEn }}</p>
          <p class="battle-date">{{ battle.date }}</p>
          
          <p class="battle-overview">{{ battle.overview }}</p>
          
          <div class="battle-stats">
            <div class="stat">
              <span class="stat-label">法军</span>
              <span class="stat-value french">{{ formatNumber(battle.stats.frenchTroops) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">俄军</span>
              <span class="stat-value russian">{{ formatNumber(battle.stats.russianTroops) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">伤亡</span>
              <span class="stat-value casualty">{{ formatNumber(battle.stats.frenchCasualties + (battle.stats.russianCasualties || 0)) }}</span>
            </div>
          </div>
          
          <div class="battle-enter">
            <span>查看详情</span>
            <span class="arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { keyBattles } from '../stores/battlesData.js'

const router = useRouter()
const battles = keyBattles

function formatNumber(num) {
  if (!num) return '-'
  if (num >= 1000) {
    return Math.round(num / 1000) + 'k'
  }
  return num.toLocaleString()
}

function goToBattle(id) {
  router.push(`/battle/${id}`)
}
</script>

<style scoped>
.battles-container {
  padding: 80px 60px;
  background: linear-gradient(to bottom, rgba(15, 15, 15, 0.98), rgba(26, 26, 26, 0.98));
}

.battles-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 2.5rem;
  color: #B8860B;
  text-align: center;
  margin-bottom: 15px;
}

.battles-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-bottom: 50px;
}

.battles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1600px;
  margin: 0 auto;
}

.battle-card {
  background: rgba(45, 45, 45, 0.6);
  border: 1px solid rgba(184, 134, 11, 0.3);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s ease;
}

.battle-card:hover {
  transform: translateY(-8px);
  border-color: #B8860B;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.battle-card.advance {
  border-left: 4px solid #D4A017;
}

.battle-card.retreat {
  border-left: 4px solid #8B0000;
}

.battle-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.battle-phase-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}

.battle-phase-tag.advance {
  background: rgba(212, 160, 23, 0.9);
  color: #1A1A1A;
}

.battle-phase-tag.retreat {
  background: rgba(139, 0, 0, 0.9);
  color: #FFF;
}

.major-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 5px 10px;
  background: rgba(192, 57, 43, 0.9);
  color: #FFF;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.battle-content {
  padding: 20px;
}

.battle-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.4rem;
  color: #E8E0D5;
  margin: 0 0 5px;
}

.battle-title-en {
  font-size: 0.9rem;
  color: #A09080;
  font-style: italic;
  margin: 0 0 8px;
}

.battle-date {
  font-size: 0.85rem;
  color: #B8860B;
  margin: 0 0 15px;
}

.battle-overview {
  font-size: 0.9rem;
  color: #C4B8A8;
  line-height: 1.6;
  margin: 0 0 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.battle-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 18px;
  padding-top: 15px;
  border-top: 1px solid rgba(184, 134, 11, 0.2);
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.7rem;
  color: #A09080;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 600;
}

.stat-value.french { color: #D4A017; }
.stat-value.russian { color: #6B8E9F; }
.stat-value.casualty { color: #C0392B; }

.battle-enter {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #B8860B;
  font-size: 0.9rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.battle-card:hover .battle-enter {
  opacity: 1;
  transform: translateX(0);
}

.battle-enter .arrow {
  transition: transform 0.3s ease;
}

.battle-card:hover .battle-enter .arrow {
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .battles-container {
    padding: 50px 20px;
  }
  
  .battles-title {
    font-size: 1.8rem;
  }
  
  .battles-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .battle-enter {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
