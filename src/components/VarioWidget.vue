<template>
  <div
    :class="['widget', wid.border == 1 ? 'widget-border' : 'widget-noborder']"
    :style="{
      left: wid.topx + 'px',
      top: wid.topy + 'px',
      width: wid.width + 'px',
      height: wid.height + 'px',
      'margin-left': -1 + 'px',
      'margin-top': -1 + 'px',
    }"
  >
    <div class="move">
      <button
        class="btn btn-link btn-sm px-0"
        @click="$emit('movedown')"
        v-show="wid.active && idx < nbActive - 1"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-down" />
      </button>
      <button
        class="btn btn-link btn-sm px-0"
        @click="$emit('moveup')"
        v-show="wid.active && idx > 0"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-up" />
      </button>
    </div>
    <div>
      <span v-if="displayCoordinates" class="coord">
        x:{{ wid.topx }}, y:{{ wid.topy }}, w:{{ wid.width }}, h:{{
          wid.height
        }}</span
      >
    </div>
    <strong>{{ wid.name }}</strong>
  </div>
</template>

<script>
import { onMounted } from "vue";
export default {
  name: "VarioWidget",
  props: {
    wid: Object,
    displayCoordinates: Boolean,
    idx: Number,
    nbActive: Number,
  },
  setup() {
    onMounted(() => {
      console.log("mounted");
    });

    return {};
  },
};
</script>

<style scoped>
.widget {
  position: absolute;
  box-sizing: border-box;
  font-size: 0.8em;
}

.widget-border {
  border: 1px solid black;
}

.widget-noborder {
  border: 1px dotted #ccc;
}

.coord {
  font-size: 0.7em;
}

.move {
  float: left;
  width: 32px;
}
</style>