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
      <div class="page_table">
        <el-table :data="tableData" header-align="center" style="width: 100%" height="89vh">
          <el-table-column align="center" prop="id" label="authorId"></el-table-column>
          <el-table-column align="center" prop="name" label="name" min-width="300"></el-table-column>
          <el-table-column align="center" prop="score" label="score" min-width="150"></el-table-column>
        </el-table>
      </div>

      <div class="page_wrap">
        <el-pagination
          background
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="total"
        ></el-pagination>
      </div>
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
import { copyArray, implode } from "utils/index";
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
      similars: [],
      authorIds: [],
      authors: [],
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
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
      let query = `MATCH (u:Author {name:'${keyword}'})  CALL top.chendaye666.equitruss.search(u,15,10,1) YIELD id,authorId,name,count,community,words,raw RETURN id,authorId,name,count,community,words,raw`;
      // console.log('executeKeywordCypher', query);return;
      let me = this;
      me.records = [];
      me.similars = [];
      this.clearAll = true;
      let session = this.driver.session();
      if (query == "") return;
      session
        .run(query, {})
        .then(function(result) {
          me.clearAll = false;
          me.records = result.records;
          me.records.forEach(res => {
            me.similars.push(res._fields);
            me.authorIds.push(parseInt(res._fields[1]));
          });
          return new Promise((resolve, reject) => {
            if (me.similars.length > 0) {
              resolve([me.similars, me.authorIds]);
            } else {
              reject(new Error("文章ID查询失败！"));
            }
          });
          session.close();
        })
        .then(res => {
          let session2 = this.driver.session();
          let queryStr = implode(res[1], ",");
          let me = this;
          let query = `match (u:Author) where id(u) in [${queryStr}] return u`;
          session2
            .run(query, {})
            .then(result => {
              let nameMap = [];
              me.records = result.records;
              result.records.forEach(item => {
                item.forEach(record => {
                  console.log(record);
                  nameMap.push({
                    id: record.identity.low,
                    name: record.properties.name
                  });
                  me.similars.forEach(f => {
                    if (f[1] == record.identity.low) {
                      me.authors.push({
                        id: f[0],
                        name: record.properties.name,
                        score: f[2]
                      });
                    }
                  });
                });
              });
              me.total = me.similars.length;
              me.tableData = copyArray(me.authors, 0, 10);
              console.log("similar", me.authors);
              me.closeLoading(false);
              session2.close();
            })
            .catch(function(error) {
              console.log("session2 Cypher 执行失败！", error);
              me.driver.close();
            });
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
    handleCurrentChange(val) {
      this.tableData = [];
      let start = (val - 1) * this.pageSize;
      let end =
        start + this.pageSize >= this.authors.length
          ? this.authors.length
          : start + this.pageSize;
      this.tableData = [...copyArray(this.authors, start, end)];
      console.log([start, end, this.tableData]);
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
  flex-grow: 1;
  width: 100%;
  margin-bottom: 5px;
  margin-top: 5px;
  height: 6vh;
}
.show {
  display: flex;
  flex-direction: column;
  flex-grow: 25;
  width: 100%;
  /* overflow: auto; */
  /* height: 89vh; */
}
</style>