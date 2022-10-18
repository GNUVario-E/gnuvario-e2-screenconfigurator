import { createStore } from 'vuex'
import _ from "lodash";

const palette = [
  '#9949ac',
  '#557881',
  '#aea6bd',
  '#e8b630',
  '#cce1be',
  '#4504f9',
  '#5f70e6',
  '#54623d',
  '#99c920',
  '#4075a3',
  '#3e52f5',
  '#3ef042',
  '#87769e',
  '#02c134',
  '#ff2e1e',
  '#1fc59e',
  '#9fa5bb',
  '#1d6883',
  '#b3815b',
  '#e02ca1',
  '#ea1a32',
  '#d42733',
  '#599ea5',
  '#01d05f',
  '#8b8750',
  '#dc541c',
  '#1e3e0c',
  '#a292dc',
  '#6a0efd',
  '#503c80',
];

export default createStore({
  state() {
    return {
      loading: false,
      screendata: [],
      palette: palette
    }
  },
  getters: {
    getPalette(state) {
      return state.palette;
    },
    getScreenList(state) {
      return Object.keys(state.screendata)
    },
    getScreenDataArray: (state) => (screen) => {
      const sdata = state.screendata[screen];
      if (sdata) {
        let widgets = [];
        for (const [key, value] of Object.entries(sdata)) {
          widgets.push({
            name: key,
            ...value,
          });
        }

        const widgetsOrdered = _.sortBy(widgets, [
          function (o) {
            return -o.a;
          },
          "y",
          "topx",
        ]);

        return widgetsOrdered;
      } else {
        return {};
      }
    },
    getIndexesList: (state) => (screen) => {
      const sdata = state.screendata[screen];
      if (sdata) {
        let indexes = [];
        // eslint-disable-next-line no-unused-vars
        for (const [key, value] of Object.entries(sdata)) {
          indexes.push({ 'name': key, 'index': value.i })
        }
        indexes.push({ 'name': 'none', 'index': 99 });
        const indexesOrdered = _.sortBy(indexes, [
          function (o) {
            return o.index;
          }
        ]);

        return indexesOrdered;
      } else {
        return {};
      }
    },
    getIndexesUsedList: (state) => (screen) => {
      const sdata = state.screendata[screen];
      if (sdata) {
        let indexes = [];
        // eslint-disable-next-line no-unused-vars
        for (const [key, value] of Object.entries(sdata)) {
          if (value.n != 99) {
            indexes.push(value.n)
          }
        }

        const indexesOrdered = _.sortBy(indexes, [
          function (o) {
            return o;
          }
        ]);

        return indexesOrdered;
      } else {
        return {};
      }
    }
  },
  mutations: {
    setLoading(state, payload) {
      state.loading = payload;
    },
    initScreenData(state, data) {
      state.screendata = data
    },
    updateWidget(state, { screen, wid }) {
      state.screendata[screen.value][wid.name] = wid;
      delete state.screendata[screen.value][wid.name].name;
    },
    alternate(state, { screen, d }) {
      d.forEach(element => {
        state.screendata[screen.value][element.name] = element;
      });
    }
  },
  actions: {
    moveUp({ commit, getters }, { screen, wid }) {
      const d = getters.getScreenDataArray(screen.value);

      const index = d.findIndex(x => x.name === wid.name);
      if (index > 0) {
        const current = { ...d[index] };
        const prev = { ...d[index - 1] };

        if (current.a && prev.a) {
          d[index].y = prev.y;
          d[index - 1].y = current.y + (current.h - prev.h);

          commit("updateWidget", { screen, wid: d[index] });
          commit("updateWidget", { screen, wid: d[index - 1] });
        }
      }
    },
    moveDown({ commit, getters }, { screen, wid }) {
      const d = getters.getScreenDataArray(screen.value);

      const index = d.findIndex(x => x.name === wid.name);
      if (index < d.length) {
        const current = { ...d[index] };
        const next = { ...d[index + 1] };
        if (current.a && next.a) {
          d[index + 1].y = current.y;
          d[index].y = next.y + (next.h - current.h);

          commit("updateWidget", { screen, wid: d[index] });
          commit("updateWidget", { screen, wid: d[index + 1] });
        }
      }
    },
    alternate({ commit, getters }, { screen }) {
      const d = getters.getScreenDataArray(screen.value);

      let toActivate = [];
      let toDesactivate = [];
      for (let i = 0; i < d.length; i++) {
        if (d[i].a && d[i].n != 99) {
          const index = d.findIndex(x => x.i === d[i].n);
          toDesactivate.push(d[i]);
          toActivate.push(d[index]);
        }
      }

      for (let i = 0; i < toActivate.length; i++) {
        toActivate[i].a = 1;
      }
      for (let i = 0; i < toDesactivate.length; i++) {
        toDesactivate[i].a = 0;
      }

      commit("alternate", { screen, d });
    },
    fetchScreenData: ({ commit }) => {
      commit('setLoading', true);
      const error = null;
      return fetch(
        "/screen.json",
        // "https://raw.githubusercontent.com/GNUVario-E/gnuvario-e2/7bbfd195e48845606d021ea35bcd130694bc770b/screen.json",
        {
          method: "get",
          // headers: {
          //   "content-type": "application/json",
          // },
        }
      )
        .then((res) => {
          // a non-200 response code
          if (!res.ok) {
            // create error instance with HTTP status text
            const error = new Error(res.statusText);
            error.json = res.json();
            throw error;
          }

          return res.json();
        })
        .then((json) => {
          // set the response data
          commit("initScreenData", json);
        })
        .catch((err) => {
          error.value = err;
          // In case a custom JSON error response was provided
          if (err.json) {
            return err.json.then((json) => {
              // set the JSON response message
              error.value.message = json.message;
            });
          }
        })
        .then(() => {
          commit('setLoading', false);
        });
    },
    importJson: ({ commit }, { data }) => {
      // console.log(data.value);
      commit("initScreenData", JSON.parse(data.value));
    },
    exportJson({ state }, { screen }) {
      const d = state.screendata[screen.value];
      const json = JSON.stringify(d, null, 2);
      const minified = JSON.stringify(JSON.parse(json));
      const blob = new Blob([minified], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = screen.value;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
  modules: {
  }
})
