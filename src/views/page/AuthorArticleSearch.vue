<template>
  <div class="box">
    <div class="search">
      <Search
        ref="Search"
        :showQuery="false"
        @Submit="Submit"
        @CypherKeyword="CypherKeyword"
        @GraphTeble="GraphTeble"
      />
    </div>
    <div class="show" v-if="graphtable">
      <div class="page_table">
        <el-table :data="tableData" header-align="center" style="width: 100%" height="89vh">
          <el-table-column align="center" prop="paperId" label="paperId"></el-table-column>
          <el-table-column align="center" prop="title" label="title" min-width="300"></el-table-column>
          <el-table-column align="center" prop="journal" label="journal" min-width="150"></el-table-column>
          <el-table-column align="center" prop="mdate" label="mdate"></el-table-column>
          <el-table-column align="center" prop="year" label="year"></el-table-column>
          <el-table-column align="center" prop="key" label="key"></el-table-column>
          <el-table-column align="center" prop="publtype" label="publtype"></el-table-column>
          <el-table-column align="center" prop="rating" label="rating"></el-table-column>
          <el-table-column align="center" prop="reviewid" label="reviewid"></el-table-column>
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
import { copyArray } from "utils/index";
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
      articles: [],
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
      let query = `match res=(u:Author {name:"${keyword}"})-[r:AuthorPaper]->(p:Paper)  return res order by p.mdate desc`;
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
          me.records = result.records;
          result.records.forEach(item => {
            item.forEach(record => {
              let articleNode = record.end.properties;
              me.articles.push(articleNode);
            });
          });
          me.total = me.articles.length;
          me.tableData = copyArray(me.articles, 0, 10);
          me.closeLoading(false);
          session.close();
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
        start + this.pageSize >= this.articles.length
          ? this.articles.length
          : start + this.pageSize;
      this.tableData = [...copyArray(this.articles, start, end)];
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