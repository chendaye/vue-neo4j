<template>
  <div class="box">
    <div class="search">
      <Search
        ref="Search"
        @Submit="Submit"
        @CypherKeyword="CypherKeyword"
        @GraphTeble="GraphTeble"
      />
    </div>
    <div class="show" v-if="graphtable">
      <el-table :data="tableData" header-align="center" style="width: 100%">
        <el-table-column align="center" prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="name" label="姓名" width="180"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
      </el-table>
    </div>
    <div class="show" v-else>
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
      clearAll: false,
      tableData: [],
      articles: []
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
    handleClickNode() {},
    Submit(query) {
      console.log("Submit", query);
      if (this.cypherkeyword) {
        this.executeCypher(query);
      } else {
        //TODO:关键词搜索
        this.executeKeywordCypher(query);
      }
    },
    CypherKeyword(data) {
      this.cypherkeyword = data;
    },
    GraphTeble(data) {
      this.graphtable = data;
      console.log(this.graphtable);
    },
    /**
     * 直接执行Cypher
     */
    executeCypher(query) {
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
          console.log("neo4j 结果", result.records);
          session.close();
          me.closeLoading(false);
        })
        .catch(function(error) {
          console.log("Cypher 执行失败！", error);
          me.driver.close();
        });
    },
   
    /**
     * 关键字查询,查询性能
     */
    executeKeywordCypher(keyword) {
      let query = `match res=(u:Author {name:"${keyword}"})-[r:AuthorPaper]->() return r`;
      // console.log('executeKeywordCypher', query);return;
      let me = this;
      me.records = [];
      me.articles = [];
      this.clearAll = true;
      let session = this.driver.session();
      if (query == "") return;
      session
        .run(query, {})
        .then(function(result) {
          me.clearAll = false;
          result.records.forEach(item => {
            item.forEach(record => {
              me.articles.push(record.end.low);
              // me.articles.push(record.identity.low);
            });
          });
          //TODO:查询文章的ID
          let articleIdStr = me.implode(me.articles, ',');
          console.log('articleIdStr', articleIdStr)
          return new Promise((resolve, reject) => {
            if(articleIdStr.length > 0){
              resolve(articleIdStr);
            }else{
              reject(new Error("文章ID查询失败！"))
            }
          });
          session.close();
        }).then((articleIdStr) => {
          // articleIdStr = '3768185,3697993';
          // let showTable = `match (p:Paper) where id(p) in [${articleIdStr}] return p`
          let showTable = `match res=(u:Author {name:'${keyword}'})-[:AuthorPaper]-(p:Paper) where id(p) in [${articleIdStr}] return res`;

          console.log('promise', showTable) // Mark F. Hornick

          // let session2 = this.driver.session();
          // session2.run(showTable, {}).then(data => {
          //   console.log('77777777777', data)
          //   me.records = data.records;
          //   me.closeLoading(false);
          // })
          // session.close();
        })
        .catch(function(error) {
          console.log("Cypher 执行失败！", error);
          me.driver.close();
        });
    },

    closeLoading(status) {
      console.log("closeLoading", status);
      this.$refs.Search.setLoading(status);
    },
    /**
     * 逗号分隔数组
     */
    implode(arr, tag) {
      var str = "";
      for (var i = 0; i < arr.length; i++) {
        str += arr[i] + tag;
      }
      //去掉最后一个逗号(如果不需要去掉，就不用写)
      if (str.length > 0) {
        str = str.substr(0, str.length - 1);
      }
      return str;
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