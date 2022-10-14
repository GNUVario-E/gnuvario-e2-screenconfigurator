<template>
  <div class="row">
    <div class="col-md-3">
      <div class="mb-3">
        <label for="screen" class="form-label">Taille de l'écran</label>
        <select
          class="form-select"
          name="screensize"
          id="screensize"
          v-model="screensize"
        >
          <option :value="s.key" v-for="s in sizes" :key="s.key">
            {{ s.label }}
          </option>
        </select>
        <div id="emailHelp" class="form-text">
          Choix de la taille de l'écran.
        </div>
      </div>
      <div class="mb-3">
        <label for="screen" class="form-label">Ecran</label>
        <select
          class="form-select"
          name="screen"
          id="screen"
          v-model="currentscreen"
        >
          <option :value="s" v-for="s in screens" :key="s">
            {{ s }}
          </option>
        </select>
        <div id="emailHelp" class="form-text">
          Choix de l'écran à configurer.
        </div>
      </div>
      <div class="mb-3">
        <label for="coord" class="form-label">Afficher les coordonnées</label>
        <input
          type="checkbox"
          class="form-check-input"
          id="coord"
          v-model="displayCoordinates"
        />
      </div>
      <div v-if="screensize" :class="['screen', 'screen' + screensize]">
        <div v-if="data && currentscreen">
          <vario-widget
            v-for="(wid, idx) in data"
            v-show="wid.active == 1"
            :wid="wid"
            :displayCoordinates="displayCoordinates"
            :idx="idx"
            :nbActive="nbActive"
            :key="wid.name"
            @moveup="moveUp(wid)"
            @movedown="moveDown(wid)"
          >
          </vario-widget>
        </div>
      </div>
      <div v-if="data && currentscreen">
        <button class="btn btn-info" @click="alternate()">
          Voir les alternances
        </button>
        <button class="btn btn-info" @click="reset()">reset</button>
      </div>
    </div>
    <div class="col-md-9">
      <div v-if="data && currentscreen">
        <table class="table table-sm table-bordered table-striped">
          <thead>
            <th>Widget</th>
            <th>Active</th>
            <th>topx</th>
            <th>topy</th>
            <th>Width</th>
            <th>Height</th>
            <th>Alternate index</th>
            <th>Border</th>
          </thead>
          <tbody>
            <tr v-for="(wid, idx) in data" :key="wid.name">
              <td>
                {{ wid.name }}
                <br />
                <button
                  class="btn btn-link btn-sm"
                  @click="moveDown(wid)"
                  v-show="wid.active == 1 && idx < nbActive - 1"
                >
                  <font-awesome-icon icon="fa-solid fa-arrow-down" />
                </button>
                <button
                  class="btn btn-link btn-sm"
                  @click="moveUp(wid)"
                  v-show="wid.active == 1 && idx > 0"
                >
                  <font-awesome-icon icon="fa-solid fa-arrow-up" />
                </button>
              </td>
              <td>
                <label for="active" class="form-label"></label>
                <input
                  name="active"
                  type="checkbox"
                  v-model="wid.active"
                  true-value="1"
                  false-value="0"
                  @change="updateWidget(wid)"
                  class="form-check-input"
                />
              </td>
              <td>
                <label for="topx" class="form-label"></label>
                <input
                  name="topx"
                  type="number"
                  v-model="wid.topx"
                  @change="updateWidget(wid)"
                  class="form-control"
                />
              </td>
              <td>
                <label for="topy" class="form-label"></label>
                <input
                  name="topy"
                  type="number"
                  v-model="wid.topy"
                  @change="updateWidget(wid)"
                  class="form-control"
                />
              </td>
              <td>
                <label for="width" class="form-label"></label>
                <input
                  name="width"
                  type="number"
                  v-model="wid.width"
                  @change="updateWidget(wid)"
                  class="form-control"
                />
              </td>
              <td>
                <label for="height" class="form-label"></label>
                <input
                  name="height"
                  type="number"
                  v-model="wid.height"
                  @change="updateWidget(wid)"
                  class="form-control"
                />
              </td>
              <td :class="{ 'bg-info': wid.alt_index != 99 }">
                <label for="alt_index" class="form-label"></label>
                <input
                  name="alt_index"
                  type="number"
                  v-model="wid.alt_index"
                  @change="updateWidget(wid)"
                  class="form-control"
                />
              </td>
              <td>
                <label for="border" class="form-label"></label>
                <input
                  name="border"
                  type="checkbox"
                  v-model="wid.border"
                  :true-value="1"
                  :false-value="0"
                  @change="updateWidget(wid)"
                  class="form-check-input"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-md-12">
      <p>
        <a
          class="btn btn-primary"
          data-bs-toggle="collapse"
          href="#collapseExample"
          role="button"
          aria-expanded="false"
          aria-controls="collapseExample"
        >
          Voir/cacher les données json
        </a>
      </p>
      <div class="collapse" id="collapseExample">
        <div class="card card-body">
          {{ jsondata }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { useStore } from "vuex";
// import HelloWorld from "@/components/HelloWorld.vue";
import VarioWidget from "@/components/VarioWidget.vue";
import { ref, onMounted, computed } from "vue";

export default {
  name: "ScreenView",
  components: {
    // HelloWorld,
    VarioWidget,
  },
  setup() {
    const store = useStore();

    let currentscreen = ref(null);
    let screensize = ref(null);
    let displayCoordinates = ref(false);
    const sizes = [
      { key: "29", label: "2.9 pouces" },
      { key: "19", label: "1.94 pouces" },
    ];
    onMounted(() => {
      // console.log("mounted");
      store.dispatch("fetchScreenData").then(() => {
        currentscreen.value = 'vario1';
        screensize.value = 29;
      });
    });

    function updateWidget(wid) {
      store.commit("updateWidget", { screen: currentscreen, wid });
    }

    function moveUp(wid) {
      store.dispatch("moveUp", { screen: currentscreen, wid });
    }

    function moveDown(wid) {
      store.dispatch("moveDown", { screen: currentscreen, wid });
    }

    function alternate() {
      store.dispatch("alternate", { screen: currentscreen });
    }

    function reset() {
      store.dispatch("fetchScreenData");
    }

    return {
      screens: computed(() => store.getters.getScreenList),
      data: computed(() => {
        return store.getters.getScreenDataArray(currentscreen.value);
      }),
      nbActive: computed(() => {
        return store.getters
          .getScreenDataArray(currentscreen.value)
          .filter((wid) => wid.active == 1).length;
      }),
      currentscreen,
      screensize,
      sizes,
      displayCoordinates,
      updateWidget,
      moveUp,
      moveDown,
      alternate,
      reset,
      jsondata: computed(() => {
        return store.state.screendata;
      }),
    };
  },
};
</script>


<style scoped>
.screen {
  border: 1px dashed rgb(255, 141, 221);
  position: relative;
}
.screen29 {
  width: 128px;
  height: 296px;
}

.screen19 {
  width: 200px;
  height: 200px;
}
</style>