<template>
  <div class="search">
    <div class="search-input">
      <div class="input">
        <el-input v-model="keyword" placeholder="请输入查询内容"></el-input>
      </div>
      <div class="input2" v-if="showTruss">
        <el-input v-model="kquery" placeholder="k-query"></el-input>
      </div>
      <div class="input2" v-if="showTruss">
        <el-input v-model="attrcnt" placeholder="attr count"></el-input>
      </div>
    </div>

    <div class="search-submit">
      <el-button type="success" round @click="Submit" :loading="loading"
        >搜索</el-button
      >
    </div>

    <div class="search-switch" v-show="showGraph">
      <el-switch
        style="display: block"
        v-model="cypherval"
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="表格"
        inactive-text="图"
      >
      </el-switch>
    </div>

    <div class="search-switch" v-show="queryAuthor">
      <el-switch
        style="display: block"
        v-model="authorArticle"
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="文章"
        inactive-text="作者"
      >
      </el-switch>
    </div>
    <div class="search-switch" v-show="showQuery">
      <el-switch
        style="display: block"
        v-model="switchval"
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="Cypher"
        inactive-text="关键词"
      >
      </el-switch>
    </div>
  </div>
</template>
<script>
export default {
  name: "Search",
  components: {},
  props: {
    showQuery: {
      type: Boolean,
      default: true,
    },
    showGraph: {
      type: Boolean,
      default: true,
    },
    queryAuthor: {
      type: Boolean,
      default: false,
    },
    showTruss: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // Jim Gray 000  John W. Fattaruso  John Quarles  Michael Wehr
      keyword: 'Tom Barclay',
      attrcnt: 10,
      kquery: 15,
      switchval: false,
      cypherval: false,
      authorArticle: false,
      loading: false,
    };
  },
  watch: {
    condition: {
      handler() {},
      deep: true,
    },
    switchval(val) {
      this.$emit("CypherKeyword", val);
    },
    cypherval(val) {
      this.$emit("GraphTeble", val);
    },
    authorArticle(val) {
      this.$emit("SearchAuthorArticle", val);
    },
  },
  mounted() {},
  created() {
    let page = this.$cookies.get('queryWord');
    if(page == '1-5'){
      this.keyword = 'Michael Wehr';
    }else{
      this.keyword = 'Tom Barclay';
    }
  },

  methods: {
    Submit() {
      this.setLoading(true);
      if(this.showTruss){
        this.$emit("Submit", {keyword:this.keyword.trim(), kquery: this.kquery, attrcnt: this.attrcnt});
      }else{
        this.$emit("Submit", this.keyword.trim());
      }
    },
    setLoading(status) {
      this.loading = status;
    },
  },
};
</script>

<style scoped>
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
  display: flex;
  flex-direction: row;
  flex-wrap:wrap;
  justify-content:space-around;
  flex-grow: 6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
.search .search-input .input{
  flex-grow: 8;
  margin-left:2px;
}

.search .search-input .input2{
  margin-left:4px;
  flex-grow: 1;
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
</style>