<script setup lang="ts">
type Side = 'left' | 'right'
const props = defineProps<{ side: Side }>()
</script>

<template>
    <div class="overlay" :class="props.side === 'right' ? 'overlay--rtl' : 'overlay--ltr'" aria-hidden="true">
        <!-- WC -> DIV top merge -->
        <div class="h h--wc1"></div>
        <div class="h h--wc2a"></div>
        <div class="v v--merge-top"></div>
        <div class="h h--to-div1"></div>

        <!-- WC -> DIV bottom merge -->
        <div class="h h--wc2b"></div>
        <div class="h h--wc3"></div>
        <div class="v v--merge-bot"></div>
        <div class="h h--to-div2"></div>

        <!-- DIV -> CONF merge -->
        <div class="h h--div1"></div>
        <div class="h h--div2"></div>
        <div class="v v--merge-mid"></div>
        <div class="h h--to-conf"></div>
    </div>
</template>

<style scoped>
/*
Requires these vars on the parent (.side-inner):
--colW, --colGap, --rowH, --rowGap
*/
.overlay {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;

    /* vertical geometry */
    --step: calc(var(--rowH) + var(--rowGap));
    --cardH: calc(var(--rowH) + var(--rowH) + var(--rowGap));

    --y-wc1: calc((0 * var(--step)) + (var(--cardH) / 2));
    --y-wc2: calc((4 * var(--step)) + (var(--cardH) / 2));
    --y-wc3: calc((8 * var(--step)) + (var(--cardH) / 2));

    --y-div1: calc((2 * var(--step)) + (var(--cardH) / 2));
    --y-div2: calc((6 * var(--step)) + (var(--cardH) / 2));

    --y-conf: calc((4 * var(--step)) + (var(--cardH) / 2));

    /* column x positions (LTR baseline) */
    --x-c1-l: 0px;
    --x-c1-r: var(--colW);

    --x-c2-l: calc(var(--colW) + var(--colGap));
    --x-c2-r: calc(var(--colW) + var(--colGap) + var(--colW));

    --x-c3-l: calc(var(--colW) + var(--colGap) + var(--colW) + var(--colGap));
    --x-c3-r: calc(var(--colW) + var(--colGap) + var(--colW) + var(--colGap) + var(--colW));

    /* merge points in the gaps */
    --x-gap12-mid: calc(var(--x-c1-r) + (var(--colGap) / 2));
    --x-gap23-mid: calc(var(--x-c2-r) + (var(--colGap) / 2));
}

.h,
.v {
    position: absolute;
    background: rgba(255, 255, 255, 0.55);
    border-radius: 2px;
}

.h {
    height: 2px;
}

.v {
    width: 2px;
}

/* =========================
   LTR (NFC): col1 -> col2 -> col3
   ========================= */
.overlay--ltr .h--wc1 {
    left: var(--x-c1-r);
    top: var(--y-wc1);
    width: calc(var(--x-gap12-mid) - var(--x-c1-r));
}

.overlay--ltr .h--wc2a {
    left: var(--x-c1-r);
    top: var(--y-wc2);
    width: calc(var(--x-gap12-mid) - var(--x-c1-r));
}

.overlay--ltr .v--merge-top {
    left: var(--x-gap12-mid);
    top: var(--y-wc1);
    height: calc(var(--y-wc2) - var(--y-wc1));
}

.overlay--ltr .h--to-div1 {
    left: var(--x-gap12-mid);
    top: var(--y-div1);
    width: calc(var(--x-c2-l) - var(--x-gap12-mid));
}

.overlay--ltr .h--wc2b {
    left: var(--x-c1-r);
    top: var(--y-wc2);
    width: calc(var(--x-gap12-mid) - var(--x-c1-r));
}

.overlay--ltr .h--wc3 {
    left: var(--x-c1-r);
    top: var(--y-wc3);
    width: calc(var(--x-gap12-mid) - var(--x-c1-r));
}

.overlay--ltr .v--merge-bot {
    left: var(--x-gap12-mid);
    top: var(--y-wc2);
    height: calc(var(--y-wc3) - var(--y-wc2));
}

.overlay--ltr .h--to-div2 {
    left: var(--x-gap12-mid);
    top: var(--y-div2);
    width: calc(var(--x-c2-l) - var(--x-gap12-mid));
}

.overlay--ltr .h--div1 {
    left: var(--x-c2-r);
    top: var(--y-div1);
    width: calc(var(--x-gap23-mid) - var(--x-c2-r));
}

.overlay--ltr .h--div2 {
    left: var(--x-c2-r);
    top: var(--y-div2);
    width: calc(var(--x-gap23-mid) - var(--x-c2-r));
}

.overlay--ltr .v--merge-mid {
    left: var(--x-gap23-mid);
    top: var(--y-div1);
    height: calc(var(--y-div2) - var(--y-div1));
}

.overlay--ltr .h--to-conf {
    left: var(--x-gap23-mid);
    top: var(--y-conf);
    width: calc(var(--x-c3-l) - var(--x-gap23-mid));
}

/* =========================
   RTL (AFC): col3 -> col2 -> col1
   connectors must be on LEFT of WC boxes and LEFT of DIV boxes (flow right->left)
   ========================= */
.overlay--rtl .h--wc1 {
    left: var(--x-gap23-mid);
    top: var(--y-wc1);
    width: calc(var(--x-c3-l) - var(--x-gap23-mid));
}

.overlay--rtl .h--wc2a {
    left: var(--x-gap23-mid);
    top: var(--y-wc2);
    width: calc(var(--x-c3-l) - var(--x-gap23-mid));
}

.overlay--rtl .v--merge-top {
    left: var(--x-gap23-mid);
    top: var(--y-wc1);
    height: calc(var(--y-wc2) - var(--y-wc1));
}

.overlay--rtl .h--to-div1 {
    left: var(--x-c2-r);
    top: var(--y-div1);
    width: calc(var(--x-gap23-mid) - var(--x-c2-r));
}

.overlay--rtl .h--wc2b {
    left: var(--x-gap23-mid);
    top: var(--y-wc2);
    width: calc(var(--x-c3-l) - var(--x-gap23-mid));
}

.overlay--rtl .h--wc3 {
    left: var(--x-gap23-mid);
    top: var(--y-wc3);
    width: calc(var(--x-c3-l) - var(--x-gap23-mid));
}

.overlay--rtl .v--merge-bot {
    left: var(--x-gap23-mid);
    top: var(--y-wc2);
    height: calc(var(--y-wc3) - var(--y-wc2));
}

.overlay--rtl .h--to-div2 {
    left: var(--x-c2-r);
    top: var(--y-div2);
    width: calc(var(--x-gap23-mid) - var(--x-c2-r));
}

.overlay--rtl .h--div1 {
    left: var(--x-gap12-mid);
    top: var(--y-div1);
    width: calc(var(--x-c2-l) - var(--x-gap12-mid));
}

.overlay--rtl .h--div2 {
    left: var(--x-gap12-mid);
    top: var(--y-div2);
    width: calc(var(--x-c2-l) - var(--x-gap12-mid));
}

.overlay--rtl .v--merge-mid {
    left: var(--x-gap12-mid);
    top: var(--y-div1);
    height: calc(var(--y-div2) - var(--y-div1));
}

.overlay--rtl .h--to-conf {
    left: var(--x-c1-r);
    top: var(--y-conf);
    width: calc(var(--x-gap12-mid) - var(--x-c1-r));
}
</style>
