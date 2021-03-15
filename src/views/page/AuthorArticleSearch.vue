<template>
  <div class="box">
    <div class="search">
    <Search ref="Search" @Submit="Submit" @CypherKeyword="CypherKeyword" @GraphTeble="GraphTeble" />      
    </div>
    <div class="show">
      <Visualization @clickNode="handleClickNode" :records="records" :clearAll="clearAll"></Visualization>
    </div>
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
  components: { Visualization, Search },
  props: {
    condition: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      driver: null,
      cypherkeyword: false,
      graphtable: false,
      records: [],
      clearAll: false
    };
  },
  watch: {
    condition: {
      handler() {},
      deep: true
    }
  },
  mounted() {
    this.driver = neo4j.driver(
      setting.neo4jUrl,
      neo4j.auth.basic(setting.neo4jUserName, setting.neo4jPassword)
    );
  },
  created() {},

  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClickNode(){

    },
    Submit(query){
      console.log("Submit", query);
      // let query = "MATCH (n:Author) RETURN n LIMIT 25";
      if(this.cypherkeyword){
        this.executeCypher(query);        
      }else{
        //TODO:关键词搜搜
      }
    },
    CypherKeyword(data){
      this.cypherkeyword = data;
    },
    GraphTeble(data){
      this.graphtable = data;
    },
    /**
     * 直接执行Cypher
     */
    executeCypher(query){
      let me = this;
      me.records = [];
      this.clearAll = true;
      let session = this.driver.session();

      if (query == "") return;

      session
        .run(query, {})
        .then(function(result) {
          me.clearAll = false;
          me.records = result.records;
          console.log("neo4j 结果", result);
          session.close();
          me.closeLoading(false);
        })
        .catch(function(error) {
          console.log("Cypher 执行失败！", error);
          me.driver.close();
        });
    },

    closeLoading(status){
      console.log('closeLoading', status);
      this.$refs.Search.setLoading(status);
    }

  }
};
</script>

<style scoped>
.box {
  display: flex;
  width: 100%;
  flex-direction: column;
}

/* 可视化组件 */
.search {
  /* flex-grow: 1; */
  width: 100%;
  height: 10vh;
}
.show {
  /* flex-grow: 250; */
  width: 100%;
  height: 90vh;
}
</style>