<template>
  <div class="row">
    <div class="col-md-3">
      <!-- create input for file upload -->
      <div class="mb-3">
        <label for="file" class="form-label">Fichier JSON</label>
        <input type="file" class="form-control" id="file" ref="myfile" @change="onFileChange" accept=".json" />
        <div id="emailHelp" class="form-text">
          Fichier de configuration des widgets.
        </div>
      </div>
      <div class="mb-3">
        <label for="screen" class="form-label">Taille de l'écran</label>
        <select class="form-select" name="screensize" id="screensize" v-model="screensize">
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
        <select class="form-select" name="screen" id="screen" v-model="currentscreen">
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
        <input type="checkbox" class="form-check-input" id="coord" v-model="displayCoordinates" />
      </div>
      <div class="mb-3">
        <div v-if="data && currentscreen" class="mb-3">
          <button class="btn btn-info" @click="alternate()">
            Voir les alternances
          </button>
          &nbsp;
          <button class="btn btn-info" @click="reset()">reset</button>
        </div>
        <div v-if="screensize" :class="['screen', 'screen' + screensize]">
          <div v-if="data && currentscreen">
            <vario-widget v-for="(wid, idx) in data" v-show="wid.a == 1" :wid="wid"
              :displayCoordinates="displayCoordinates" :idx="idx" :nbActive="nbActive" :key="wid.name"
              @moveup="moveUp(wid)" @movedown="moveDown(wid)">
            </vario-widget>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-9">
      <div v-if="data && currentscreen">
        <table class="table table-sm table-bordered table-striped">
          <thead>
            <th>Widget</th>
            <th>Active</th>
            <th>x</th>
            <th>y</th>
            <th>Width</th>
            <th>Height</th>
            <th>Alternate index</th>
            <th>Border</th>
          </thead>
          <tbody>
            <tr v-for="(wid, idx) in data" :key="wid.name">
              <td class="text-start" style="width: 145px">
                <div class="widname" :style="{
                  border: indexesUsed.includes(wid.i)
                    ? '2px solid ' + palette[wid.i]
                    : '',
                }">
                  {{ wid.name }}
                  <button class="btn btn-link btn-sm" @click="moveDown(wid)" v-show="wid.a == 1 && idx < nbActive - 1">
                    <font-awesome-icon icon="fa-solid fa-arrow-down" />
                  </button>
                  <button class="btn btn-link btn-sm" @click="moveUp(wid)" v-show="wid.a == 1 && idx > 0">
                    <font-awesome-icon icon="fa-solid fa-arrow-up" />
                  </button>
                  <div class="disp-index" :style="{
                    'background-color': indexesUsed.includes(wid.i)
                      ? palette[wid.i]
                      : '',
                  }">
                    ({{ wid.i }})
                  </div>
                </div>
              </td>
              <td>
                <input name="active" type="checkbox" v-model="wid.a" :true-value="1" :false-value="0"
                  @change="updateWidget(wid)" class="form-check-input" />
              </td>
              <td class="col-small">
                <input name="x" type="number" v-model="wid.x" @change="updateWidget(wid)"
                  class="form-control form-control-sm" />
              </td>
              <td class="col-small">
                <input name="y" type="number" v-model="wid.y" @change="updateWidget(wid)"
                  class="form-control form-control-sm" />
              </td>
              <td class="col-small">
                <input name="width" type="number" v-model="wid.w" @change="updateWidget(wid)"
                  class="form-control form-control-sm" />
              </td>
              <td class="col-small">
                <input name="height" type="number" v-model="wid.h" @change="updateWidget(wid)"
                  class="form-control form-control-sm" />
              </td>
              <td :style="{
                'background-color': wid.n != 99 ? palette[wid.n] : '',
              }">
                <select class="form-select" name="idx" id="idx" v-model="wid.n" @change="updateWidget(wid)">
                  <option :value="v.index" v-for="v in indexes" :key="v.index">
                    {{ v.name }}
                  </option>
                </select>
              </td>
              <td>
                <input name="border" type="checkbox" v-model="wid.b" :true-value="1" :false-value="0"
                  @change="updateWidget(wid)" class="form-check-input" />
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
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false"
          aria-controls="collapseExample">
          Voir/cacher les données json
        </a>
      </p>
      <div class="collapse" id="collapseExample">
        <div class="card card-body">
          {{ jsondata }}
        </div>
      </div>
      <button class="btn btn-success" @click="exportJson()">
        Exporter l'écran courant
      </button>
      <!-- <button class="btn btn-success" @click="importJson()">
        Importer json
      </button> -->
      <!-- <textarea cols="30" rows="10" v-model="jsonimportdata"></textarea> -->
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
    let jsonimportdata = ref(null);
    let myfile = ref(null);

    const sizes = [
      { key: "29", label: "2.9 pouces" },
      { key: "15", label: "1.54 pouces" },
    ];
    onMounted(() => {
      // console.log("mounted");
      store.dispatch("fetchScreenData").then(() => {
        currentscreen.value = "vario1";
        screensize.value = 29;
      });
    });

    function onFileChange() {
      const file = myfile.value.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        jsonimportdata.value = e.target.result;
        importJson();
      };
      reader.readAsText(file);
    }

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

    function exportJson() {
      store.dispatch("exportJson", { screen: currentscreen });
    }

    function importJson() {
      store.dispatch("importJson", { data: jsonimportdata });
    }



    return {
      palette: store.state.palette,
      screens: computed(() => store.getters.getScreenList),
      data: computed(() => {
        return store.getters.getScreenDataArray(currentscreen.value);
      }),
      indexes: computed(() => {
        return store.getters.getIndexesList(currentscreen.value);
      }),
      indexesUsed: computed(() => {
        return store.getters.getIndexesUsedList(currentscreen.value);
      }),
      nbActive: computed(() => {
        return store.getters
          .getScreenDataArray(currentscreen.value)
          .filter((wid) => wid.a == 1).length;
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
      exportJson,
      importJson,
      onFileChange,
      jsonimportdata,
      myfile,
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

.screen15 {
  width: 200px;
  height: 200px;
}

.widname {
  position: relative;
  /* width: 100%;
  height: 100%;
  margin: 0;
  padding: 0; */
}

.col-small {
  max-width: 90px;
}

.disp-index {
  position: absolute;
  bottom: -7px;
  font-size: 0.7em;
  right: 0;
  color: #666;
}
</style>