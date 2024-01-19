<template>
  <div class="outter-container">
    <div class="slider-container" ref="slcon" @mousedown="startDrag">
      <div class="background" :style="{ height: `calc(100% - ${y}px)` }"></div>
      <div class="slider-handle" :class="{ dragging: this.shocker.$live.isDragging }" :style="{ left: `${x - 20}px`, top: `${y - 20}px` }">
        <span class="percentage-label">{{ actualLimitedNumber }}%</span>
      </div>
    </div>
  </div>
</template>
  
<script>
export default {
  props: ["shocker"],
  data() {
    return {
      x: 0,
      y: 0,
      mounted: false
    };
  },
  mounted() {
    const rect = this.$refs.slcon.getBoundingClientRect();
    this.x = rect.width / 2;
    this.y = rect.height;
    this.mounted = true;
  },
  computed: {
    containerHeight() {
      if (!this.mounted) return 0;
      const rect = this.$refs.slcon.getBoundingClientRect();
      return rect.height;
    },
    percentageX() {
      if (!this.mounted) return 0;
      const rect = this.$refs.slcon.getBoundingClientRect();
      return this.x / rect.width;
    },
    percentageY() {
      if (!this.mounted) return 0;
      const rect = this.$refs.slcon.getBoundingClientRect();
      return 1 - (this.y / rect.height);
    },

    actualLimitedNumber() {
      if(this.shocker.limits === undefined) return parseInt(this.percentageY * 100);
      return parseInt(this.percentageY * (this.shocker.limits.intensity === null ? 100 : this.shocker.limits.intensity));
    }
  },
  watch: {
    actualLimitedNumber(newValue) {
      this.shocker.$live.intensity = newValue;
    }
  },
  methods: {
    startDrag(event) {
      this.shocker.$live.isDragging = true;

      const handleMouseMove = (e) => {
        if (this.shocker.$live.isDragging) {
          const rect = this.$refs.slcon.getBoundingClientRect();
          const newX = Math.min(rect.width, Math.max(0, e.clientX - rect.left));
          const newY = Math.min(rect.height, Math.max(0, e.clientY - rect.top));

          this.x = newX;
          this.y = newY;
        }
      };

      const handleMouseUp = () => {
        this.shocker.$live.isDragging = false;
        const rect = this.$refs.slcon.getBoundingClientRect();
        this.y = rect.height;
        this.x = rect.width / 2;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  },
};
</script>
  
<style lang="scss" scoped>
.outter-container {
  padding: 20px;

  .slider-container {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
    cursor: pointer;

    .slider-handle {
      position: absolute;
      width: 40px;
      height: 40px;
      background-color: var(--main-color);
      border: 3px solid transparent;
      border-radius: 50%;
      cursor: grab;
      user-select: none;

      display: flex;
      justify-content: center;
      align-items: center;

      transition: border 0.2s ease-in-out;

      .percentage-label {
        font-size: 0.9rem;
      }

      &.dragging {
        cursor: none;
        border: 1px solid var(--main-background-color);
      }
    }

    .background {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: var(--main-seperator-color);
      pointer-events: none;
    }

  }
}
</style>
  