<template>
  <div class="box">
    <div class="menu">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="vertical"
        @select="handleSelect"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-submenu index="1">
          <template slot="title">基础信息检索</template>
          <el-menu-item index="1-1">作者文章检索</el-menu-item>
          <el-menu-item index="1-2">作者合作对象检索</el-menu-item>
          <el-menu-item index="1-3">文章作者模糊搜索</el-menu-item>
          <el-menu-item index="1-4">作者文章关键词搜索</el-menu-item>
          <el-menu-item index="1-5">合作对象文章检索</el-menu-item>
        </el-submenu>

        <el-submenu index="2">
          <template slot="title">作者相似度查询</template>
          <el-menu-item index="2-1">Simrank</el-menu-item>
          <el-menu-item index="2-2">Jaccard Similarity</el-menu-item>
        </el-submenu>
        <el-submenu index="3">
          <template slot="title">作者中心度查询</template>
          <!-- 通过某点的最短路径的数量 -->
          <el-menu-item index="3-1">Betweenness Centrality</el-menu-item>
        </el-submenu>
        <el-submenu index="4">
          <template slot="title">研究团体搜索</template>
          <el-menu-item index="4-1">结构上紧密的研究团体查询</el-menu-item>
          <el-menu-item index="4-2">结构和属性都紧密的研究团体查询</el-menu-item>
        </el-submenu>

        <el-submenu index="5">
          <!-- https://www.npmjs.com/package/vue-csv-import -->
          <template slot="title">其他</template>
          <el-menu-item index="5-1">CSV上传</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
    <div class="visual">
      <component ref="page" v-bind:is="page" />
    </div>
  </div>
</template>
<script>
import AuthorArticleSearch from "./page/AuthorArticleSearch";
import AuthorCoopratorSearch from "./page/AuthorCoopratorSearch";
import ArticleAuthorSearch from "./page/ArticleAuthorSearch";
import AuthorKeywordSearch from "./page/AuthorKeywordSearch";
import CoopratorArticleSearch from "./page/CoopratorArticleSearch";
import AuthorSimilarSearch from "./page/AuthorSimilarSearch";
import AuthorJaccardSimilarSearch from "./page/AuthorJaccardSimilarSearch";
import AuthorCentralitySearch from "./page/AuthorCentralitySearch";
import StructCommunitySearch from "./page/StructCommunitySearch";
import AttributeCommunitySearch from "./page/AttributeCommunitySearch";
import CsvUpload from "./page/CsvUpload";
export default {
  name: "Neo4jSearch",
  components: {
    AuthorArticleSearch,
    AuthorCoopratorSearch,
    ArticleAuthorSearch,
    AuthorKeywordSearch,
    CoopratorArticleSearch,
    AuthorSimilarSearch,
    AuthorJaccardSimilarSearch,
    AuthorCentralitySearch,
    StructCommunitySearch,
    AttributeCommunitySearch,
    CsvUpload,
  },
  props: {
    condition: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      activeIndex: "1",
      page: "AuthorArticleSearch",
      menu: {
        "1-1": "AuthorArticleSearch", // 作者文章检索
        "1-2": "AuthorCoopratorSearch", // 作者合作对象检索
        "1-3": "ArticleAuthorSearch", // 文章作者模糊搜索
        "1-4": "AuthorKeywordSearch", // 作者文章关键词搜索
        "1-5": "CoopratorArticleSearch", // 合作对象文章检索
        "2-1": "AuthorSimilarSearch", // 作者相似度查询
        "2-2": "AuthorJaccardSimilarSearch", // 作者相似度查询
        "3-1": "AuthorCentralitySearch", // 作者中心度查询
        "4-1": "StructCommunitySearch", // 结构紧密社区搜索
        "4-2": "AttributeCommunitySearch", // 属性紧密社区搜索
        "5-1": "CsvUpload" // CSV上传
      }
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
      this.page = this.menu[key];
      this.$cookies.set('queryWord', key, 0) 
      console.log(key, this.page);
    }
  }
};
</script>

<style scoped >
html,
body {
  height: 100%;
  margin: 0;
}
.box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
}
.menu {
  /* flex-grow:1; */
  width: 15vw;
  height: 100%;
}
.el-menu-demo {
  height: 100%;
}
.visual {
  display: flex;
  /* widows: 100%; */
  width: 85vw;
  /* flex-grow:10; */
}
</style>