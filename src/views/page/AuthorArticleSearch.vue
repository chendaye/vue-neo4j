<template>
  <div class="box">
    
  </div>
</template>
<script>
import { Visualization } from "components/D3Visualization";
import { setting } from "config/index";
// https://www.npmjs.com/package/neo4j-driver
var neo4j = require("neo4j-driver");
export default {
  name: "AuthorArticleSearch",
  components: {Visualization},
  props: {
    condition: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      activeIndex: "1",
    };
  },
  watch: {
    condition: {
      handler() {},
      deep: true
    }
  },
  mounted() {},
  created() {},

  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    }
  }
};
</script>

<style scoped>
.box{
  display: flex;
}
</style>