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
    <div   class="search">
      <el-select
        v-model="selectvalue"
        @change="filterHandler"
        placeholder="请选择社区"
      >
        <el-option
          v-for="item in filterCommunity"
          :key="item.value"
          :label="item.text"
          :value="item.value"
        >
        </el-option>
      </el-select>
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
            prop="nodeId"
            label="authorId"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="name"
            label="name"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="communityId"
            label="communityId"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="intermediateCommunityIds"
            label="intermediateCommunityIds"
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
    <div class="show" v-else >
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
      communityMap: new Map(),
      filterCommunity: [{'text':'全部', 'value': 0}],
      tableData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selectvalue:0,
      currentCommunity:0
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
              reject(new Error("没有匹配的社区！"));
            }
          });
        })
        .then(
          (res) => {
            let me = this;
            me.records = [];
            let nodeStr = implode(res, ",");
            let query = `
                  CALL gds.louvain.stream({
                    nodeQuery:'match (u:Author) where id(u) in [${nodeStr}]   return id(u) as id',
                    relationshipQuery:'match (u:Author)-[r:Article]-(m:Author) where  id(u) in [${nodeStr}] and id(m) in [${nodeStr}] 
                    return id(u) as source, id(m) as target,r.weight as weight',
                    includeIntermediateCommunities:true
                  })
                  YIELD nodeId, communityId,intermediateCommunityIds
                  RETURN nodeId,gds.util.asNode(nodeId).name AS name, communityId, intermediateCommunityIds order by communityId asc`;
            // console.log("GDS", query);return
            let session2 = this.driver.session();
            session2.run(query, {}).then(function (result) {
              // me.records = result.records;
              // 找属性
              result.records.forEach((item) => {
                let info = item._fields;
                me.community.push({
                  nodeId: info[0].low,
                  name: info[1],
                  communityId: info[2].low,
                  intermediateCommunityIds: implode(info[3], ","),
                });
                // 当前节点所在的社区
                if(info[1] == keyword){
                  me.currentCommunity = info[2].low;
                }
                // 社区Map
                if (me.communityMap.has(info[2].low)) {
                  me.communityMap.get(info[2].low).add(info[0].low);
                } else {
                  let tmp = new Set();
                  tmp.add(info[0].low);
                  me.communityMap.set(info[2].low, tmp);
                  me.filterCommunity.push({
                    text: "community-" + info[2].low,
                    value: info[2].low,
                  });
                }
              });
              // graph
              me.selectvalue = me.currentCommunity;
              me.getCommunity(me.currentCommunity);
              // table
              console.log("info", me.communityMap);
              me.total = me.community.length;
              me.communityBak = [...me.community];
              me.tableData = copyArray(me.community, 0, me.pageSize);
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
    filterHandler(value) {
      if (this.graphtable) {
        // table
        console.log(value);
        this.community = this.communityBak.filter((res) => {
          if (value == 0) return true;
          return res.communityId == value;
        });
        this.total = this.community.length;
        this.tableData = copyArray(this.community, 0, this.pageSize);
        this.currentPage = 1;
      } else {
        // graph
        this.getCommunity(value);
      }
    },

    getCommunity(value){
        // graph
        let community = implode([...this.communityMap.get(value)], ',');
        console.log('graph', community);
        let query = `match res=(u:Author)-[:Article]-(p:Author) where  id(u) in [${community}] and id(p) in [${community}] return res`;
        this.executeCypher(query);
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