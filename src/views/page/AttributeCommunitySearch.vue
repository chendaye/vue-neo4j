<template>
  <div class="box">
    <div class="search">
      <Search
        ref="Search"
        :showTruss="true"
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
            prop="id"
            label="id"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="authorId"
            label="authorId"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="name"
            label="name"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="count"
            label="count"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="community"
            label="community"
            min-width="300"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="wordstr"
            label="wordstr"
            min-width="150"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="raw"
            label="raw"
            min-width="300"
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
import { copyArray } from "utils/index";
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
      tableData: [],
      wordMap: new Map(),
      currentPage: 1,
      pageSize: 10,
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
    executeKeywordCypher(data) {
      let query = `MATCH (u:Author {name:'${data.keyword}'})  CALL top.chendaye666.equitruss.search(u,${data.kquery},${data.attrcnt},1) YIELD id,authorId,name,count,community,words,raw RETURN id,authorId,name,count,community,words,raw`;
      // console.log('executeKeywordCypher', query);return;
      let me = this;
      me.community = [];
      this.clearAll = true;
      let session = this.driver.session();
      if (query == "") return;
      session
        .run(query, {})
        .then(function (result) {
          me.clearAll = false;
          result.records.forEach((record) => {
            let row = record._fields;
            me.community.push({
              id: row[0]["low"],
              authorId: row[1],
              name: row[2],
              count: row[3]["low"],
              community: row[4],
              words: row[5],
              raw: row[6],
            });
          });
          console.log("fuck", me.community);
          session.close();
          return new Promise((resolve, reject) => {
            if (me.community.length > 0) {
              resolve(me.community);
            } else {
              reject(new Error("没有匹配的社区！"));
            }
          });
        })
        .then(
          (res) => {
            let me = this;
            me.records = [];
            let community = res[0];
            let query = `match res=(u:Author)-[:Article]-(m:Author) where id(u) in [${community.community}] and id(m) in [${community.community}]  return res`;
            // console.log("fuck", [community, query]);return
            let session2 = this.driver.session();
            session2.run(query, {}).then(function (result) {
              me.records = result.records;
              // 找属性
              result.records.forEach((item) => {
                let path = item._fields[0].start.properties;
                let words = path.words;
                me.parseWords(me, words);
              });
              let wordarr = community.words.split(",");
              let wordstr = "";
              wordarr.forEach((res) => {
                wordstr += me.wordMap.get(res) + ",";
              });
              me.community.forEach((res) => {
                res.wordstr = wordstr;
              });
              me.total = me.community.length;
              me.tableData = copyArray(me.community, 0, 10);
              console.log("cwordMap", me.tableData);
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

    closeLoading(status) {
      console.log("closeLoading", status);
      this.$refs.Search.setLoading(status);
    },
    parseWords(me, data) {
      let words = data.split("@");
      words.forEach((res) => {
        let tmp = res.split(":");
        if (tmp.length == 3 && !me.wordMap.has(tmp[0])) {
          me.wordMap.set(tmp[0], tmp[1]);
        }
      });
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