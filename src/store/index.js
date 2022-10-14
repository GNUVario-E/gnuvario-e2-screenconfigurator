import { createStore } from 'vuex'
import _ from "lodash";

export default createStore({
  state() {
    return {
      loading: false,
      screendata: []
    }
  },
  getters: {
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
            return -o.active;
          },
          "topy",
          "topx",
        ]);

        return widgetsOrdered;
      } else {
        return {};
      }
    },
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
      state.screendata[screen.value] = d;
    }
  },
  actions: {
    moveUp({ commit, getters }, { screen, wid }) {
      const d = getters.getScreenDataArray(screen.value);

      const index = d.findIndex(x => x.name === wid.name);
      if (index > 0) {
        const current = { ...d[index] };
        const prev = { ...d[index - 1] };

        if (current.active && prev.active) {
          d[index].topy = prev.topy;
          d[index - 1].topy = current.topy + (current.height - prev.height);

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
        if (current.active && next.active) {
          d[index + 1].topy = current.topy;
          d[index].topy = next.topy + (next.height - current.height);

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
        if (d[i].active && d[i].alt_index != 99) {
          const index = d.findIndex(x => x.index === d[i].alt_index);
          toDesactivate.push(d[i]);
          toActivate.push(d[index]);
        }
      }

      for (let i = 0; i < toActivate.length; i++) {
        toActivate[i].active = true;
      }
      for (let i = 0; i < toDesactivate.length; i++) {
        toDesactivate[i].active = false;
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
    }
  },
  modules: {
  }
})
