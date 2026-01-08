<script setup lang="ts">
defineProps<{
  side: 'left' | 'right'
}>()
</script>

<template>
  <svg class="lines" :class="side === 'right' ? 'lines--right' : 'lines--left'" viewBox="0 0 1000 600"
    preserveAspectRatio="none" aria-hidden="true">
    <!--
      Y anchors (approx, based on 12-row layout):
      WC centers:  75, 300, 525
      DIV centers: 200, 400
      CONF center: 300
      X anchors: col1=200 col2=500 col3=800
    -->

    <!-- WC -> DIV -->
    <path d="M 260  75 H 350 V 200 H 440" />
    <path d="M 260 300 H 350 V 200 H 440" />

    <path d="M 260 525 H 350 V 400 H 440" />
    <path d="M 260 300 H 350 V 400 H 440" />

    <!-- DIV -> CONF -->
    <path d="M 560 200 H 650 V 300 H 740" />
    <path d="M 560 400 H 650 V 300 H 740" />
  </svg>
</template>

<style scoped>
.lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.lines path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.18);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* mirror for right side */
.lines--right {
  transform: scaleX(-1);
  transform-origin: center;
}
</style>
