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
        <el-table
          :data="tableData"
          header-align="center"
          style="width: 100%"
          height="89vh"
        >
          <el-table-column
            align="center"
            prop="node1"
            label="node1"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="author1"
            label="author1"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="node2"
            label="node2"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="author2"
            label="author2"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="similarity"
            label="similarity"
          ></el-table-column>
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
      <Visualization
        @clickNode="handleClickNode"
        :records="records"
        :clearAll="clearAll"
      ></Visualization>
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
      default: 0,
    },
  },
  data() {
    return {
      driver: null,
      cypherkeyword: false,
      graphtable: false,
      records: [],
      clearAll: false,
      tableData: [],
      community: [],
      communityBak: [],
      communityIds: [],
      tableData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
    };
  },
  watch: {
    condition: {
      handler() {},
      deep: true,
    },
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
        .then(function (result) {
          me.clearAll = false;
          me.records = result.records;
          console.log("neo4j 结果", result.records);
          session.close();
          me.closeLoading(false);
        })
        .catch(function (error) {
          console.log("Cypher 执行失败！", error);
          me.driver.close();
        });
    },

    /**
     * 关键字查询,查询性能
     */
    executeKeywordCypher(keyword) {
      let query = `match (u:Author {name:'${keyword}'})-[:Article]-(m:Author), (m)-[:Article]-(p:Author)  return id(m),id(u),id(p)`;
      // console.log('executeKeywordCypher', query);return;
      let me = this;
      me.community = [];
      let nodeIdSet = new Set();
      this.clearAll = true;
      let session = this.driver.session();
      if (query == "") return;
      session
        .run(query, {})
        .then(function (result) {
          me.clearAll = false;
          // me.records = result.records;
          result.records.forEach((record) => {
            let row = record._fields;
            nodeIdSet.add(row[0].low);
            nodeIdSet.add(row[1].low);
            nodeIdSet.add(row[2].low);
          });
          me.communityIds = [...nodeIdSet];
          // console.log("louvain", me.communityIds);
          session.close();
          return new Promise((resolve, reject) => {
            if (me.communityIds.length > 0) {
              resolve(me.communityIds);
            } else {
              reject(new Error("没有匹配的节点！"));
            }
          });
        })
        .then(
          (res) => {
            let me = this;
            let nodeStr = implode(res, ",");
            let query = `
                  CALL gds.nodeSimilarity.stream({
                    nodeQuery:'match (u:Author) where id(u) in [${nodeStr}]   return id(u) as id',
                    relationshipQuery:'match (u:Author)-[r:Article]-(m:Author) where  id(u) in [${nodeStr}] and id(m) in [${nodeStr}] 
                    return id(u) as source, id(m) as target,r.weight as weight'
                  })
                  YIELD node1, node2, similarity
                  RETURN node1,gds.util.asNode(node1).name AS author1,node2, gds.util.asNode(node2).name AS author2, similarity 
                  ORDER BY similarity DESCENDING, author1, node2`;
            // console.log("GDS-betweenness", query);return
            let session2 = this.driver.session();
            session2.run(query, {}).then(function (result) {
              // 找属性
              let nodeRes = [];
              result.records.forEach((item) => {
                let info = item._fields;
                // nodeRes.push(info[0].low);
                // nodeRes.push(info[0].low);
                me.community.push({
                  node1: info[0].low,
                  author1: info[1],
                  node2: info[2].low,
                  author2: info[3],
                  similarity: info[4],
                });
              });
              me.total = me.community.length;
              me.tableData = copyArray(me.community, 0, me.pageSize);
              console.log("cwordMap", me.tableData);
              // show grapg
              let show = copyArray(res, 0, 30);
              me.getGrapg(implode(show, ","));
              me.closeLoading(false);
              session2.close();
            });
          },
          (rejetc) => {
            me.$notify.info({
              title: "提示",
              message: "没有匹配到合适的社区，请调整参数尝试！",
            });
            me.closeLoading(false);
          }
        )
        .catch(function (error) {
          console.log("Cypher 执行失败！", error);
          me.driver.close();
        });
    },
    getGrapg(value) {
      let query = `match res=(u:Author)-[:Article]-(p:Author) where  id(u) in [${value}] and id(p) in [${value}] return res`;
      console.log("getGrapg", query);
      this.executeCypher(query);
    },

    closeLoading(status) {
      console.log("closeLoading", status);
      this.$refs.Search.setLoading(status);
    },

    handleCurrentChange(val) {
      this.tableData = [];
      let start = (val - 1) * this.pageSize;
      let end =
        start + this.pageSize >= this.community.length
          ? this.community.length
          : start + this.pageSize;
      this.tableData = [...copyArray(this.community, start, end)];
      console.log([start, end, this.tableData]);
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
.search {
  flex-grow: 1;
  width: 100%;
  margin-bottom: 5px;
  margin-top: 5px;
  height: 5vh;
}
.show {
  display: flex;
  flex-direction: column;
  flex-grow: 22;
  width: 100%;
  overflow: auto;
  /* height: 70vh; */
}
</style>