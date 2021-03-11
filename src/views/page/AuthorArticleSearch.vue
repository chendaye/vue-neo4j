<template>
  <div class="box">
    <Search />
    <div class="show"></div>
  </div>
</template>
<script>
import { Visualization } from "components/D3Visualization";
import Search from "components/Search";
import { setting } from "config/index";
// https://www.npmjs.com/package/neo4j-driver
var neo4j = require("neo4j-driver");
export default {
  name: "AuthorArticleSearch",
  components: { Visualization,Search },
  props: {
    condition: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      keyword: "",
      switchval: false,
    };
  },
  watch: {
    condition: {
      handler() {},
      deep: true,
    },
  },
  mounted() {},
  created() {},

  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
  },
};
</script>

<style scoped>
.box {
  display: flex;
  width: 100%;
  flex-direction: column;
}

/* 可视化组件 */
.show {
  flex-grow: 25;
  width: 100%;
}
</style>