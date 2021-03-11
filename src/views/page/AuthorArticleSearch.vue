<template>
  <div class="box">
    <div class="search">
      <div class="search-input">
        <el-input v-model="keyword" placeholder="请输入查询内容"></el-input>
      </div>
      <div class="search-submit">
        <el-button type="success" round>搜索</el-button>
      </div>
      <div class="search-switch">
        <el-switch
          v-model="switchval"
          active-color="#13ce66"
          inactive-color="#ff4949"
        >
        </el-switch>
      </div>
    </div>
    <div class="show"></div>
  </div>
</template>
<script>
import { Visualization } from "components/D3Visualization";
import { setting } from "config/index";
// https://www.npmjs.com/package/neo4j-driver
var neo4j = require("neo4j-driver");
export default {
  name: "AuthorArticleSearch",
  components: { Visualization },
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
/* 搜索组件 */
.search {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  border-width: 2px;
}
.search .search-input {
  flex-grow: 6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
.search .search-submit {
  display: flex;
  justify-content: center;
  flex-grow: 1;
}

.search .search-switch {
  display: flex;
  justify-content: center;
  flex-grow: 1;
}

/* 可视化组件 */
.show {
  flex-grow: 25;
  width: 100%;
}
</style>