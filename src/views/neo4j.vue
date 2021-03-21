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
        <el-menu-item index="1">作者文章检索</el-menu-item>
        <el-menu-item index="2">作者合作对象检索</el-menu-item>
        <el-menu-item index="3">文章作者模糊搜索</el-menu-item>
        <el-menu-item index="4">作者文章关键词搜索</el-menu-item>
        <el-menu-item index="5">合作对象文章检索</el-menu-item>
        <el-submenu index="6">
          <template slot="title">作者相似度查询</template>
          <el-menu-item index="6-1">Simrank</el-menu-item>
          <el-menu-item index="6-2">Jaccard Similarity</el-menu-item
          >
        </el-submenu>
        <el-menu-item index="7">作者中心度查询</el-menu-item>
        <el-submenu index="8">
          <template slot="title">研究团体搜索</template>
          <el-menu-item index="8-1">结构上紧密的研究团体查询</el-menu-item>
          <el-menu-item index="8-2"
            >结构和属性都紧密的研究团体查询</el-menu-item
          >
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
  },
  props: {
    condition: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      activeIndex: "1",
      page: "AuthorArticleSearch",
      menu: {
        1: "AuthorArticleSearch", // 作者文章检索
        2: "AuthorCoopratorSearch", // 作者合作对象检索
        3: "ArticleAuthorSearch", // 文章作者模糊搜索
        4: "AuthorKeywordSearch", // 作者文章关键词搜索
        5: "CoopratorArticleSearch", // 合作对象文章检索
        "6-1": "AuthorSimilarSearch", // 作者相似度查询
        "6-2": "AuthorJaccardSimilarSearch", // 作者相似度查询
        7: "AuthorCentralitySearch", // 作者中心度查询
        "8-1": "StructCommunitySearch", // 结构紧密社区搜索
        "8-2": "AttributeCommunitySearch", // 属性紧密社区搜索
      },
    };
  },
  watch: {
    condition: {
      handler() {},
      deep: true,
    },
  },
  mounted() {},
  created() {},

  methods: {
    handleSelect(key, keyPath) {
      this.page = this.menu[key];
      console.log(key, this.pageIndex);
    },
  },
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