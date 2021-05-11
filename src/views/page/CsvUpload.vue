<template>
  <div class="box">
    <div class="upload">
      <div class="item">
        <el-upload
          class="upload-demo"
          action
          :on-change="handleChange"
          accept=".csv"
          :auto-upload="false"
        >
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </div>
      <div class="item">
        <el-button type="success" size="small" @click="Submit" :loading="loading">创建</el-button>
      </div>
    </div>

    <div class="table">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{background:'#EEF6FD',color:'#251E25'}"
        slot="empty"
      >
        <el-table-column
          v-for="(item, key) in tebleHeader"
          :key="key"
          :prop="item.prop"
          :label="item.label"
          width="100%"
          align="center"
        ></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import jschardet from "jschardet";
import Papa from "papaparse"; // npm install papaparse
import { setting } from "config/index";

// https://www.npmjs.com/package/neo4j-driver
var neo4j = require("neo4j-driver");
export default {
  name: "CsvUpload",
  components: {},
  props: {
    condition: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loading: false,
      driver: null,
      fileTemp: null,
      fileListUpload: [],
      tableData: [],
      tebleHeader: []
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
    // 检查编码，引用了 jschardet
    checkEncoding(base64Str) {
      // 这种方式得到的是一种二进制串
      var str = atob(base64Str.split(";base64,")[1]);
      // console.log(str);
      // 要用二进制格式
      var encoding = jschardet.detect(str);
      encoding = encoding.encoding;
      // console.log( encoding );
      if (encoding === "windows-1252") {
        // 有时会识别错误（如UTF8的中文二字）
        encoding = "ANSI";
      }
      return encoding;
    },
    // 上传事件的内容
    handleChange(file, fileList) {
      this.fileTemp = file.raw;
      if (this.fileTemp) {
        if (
          this.fileTemp.type == ".csv" ||
          this.fileTemp.type == "application/vnd.ms-excel"
        ) {
          this.importcsv(file.raw);
        } else {
          this.$message({
            type: "warning",
            message: "附件格式错误，请删除后重新上传！"
          });
        }
      } else {
        this.$message({
          type: "warning",
          message: "请上传附件！"
        });
      }
    },
    importcsv(file) {
      let _this = this;
      return new Promise((resolve, reject) => {
        // let file = this.$refs.csvData.files[0]
        const fReader = new FileReader();
        fReader.readAsDataURL(file);
        fReader.onload = function(evt) {
          const data = evt.target.result;
          console.log("evt.target.result", data);
          const encoding = _this.checkEncoding(data);
          console.log("encoding", encoding);
          // 转换成二维数组，需要引入Papaparse.js
          Papa.parse(file, {
            encoding: encoding,
            complete: function(results) {
              // UTF8 \r\n与\n混用时有可能会出问题
              // console.log('csvcsvcsvcsvcsvcsv', results)
              const res = results.data;
              if (res[res.length - 1] === "") {
                // 去除最后的空行
                res.pop();
              }
              resolve(res);
            }
          });
        };
      }).then(csv => {
        let header = csv[0];
        header.forEach(h => {
          this.tebleHeader.push({
            prop: h,
            label: h
          });
        });
        csv.shift();
        csv.forEach(row => {
          let tmp = {};
          row.forEach((item, inx) => {
            tmp[header[inx]] = item;
          });
          this.tableData.push(tmp);
        });
        console.log("csv", [this.tebleHeader, this.tableData]);
      });
    },
    // https://neo4j.com/docs/cypher-manual/4.1/clauses/create/#create-create-node-and-add-labels-and-properties
    // CREATE (n:Person {name: 'Andy', title: 'Developer'})
    Submit() {
      this.tableData.forEach(node => {
        let label = "Author";
        let query = `CREATE (n:${label} {title: '${node.title}'})`;
        // console.log(query);return
        this.executeCypher(query);
      });
    },

    /**
     * 直接执行Cypher
     */
    executeCypher(query) {
      let me = this;
      me.records = [];
      let session = this.driver.session();
      if (query == "") return;
      session
        .run(query, {})
        .then(function(result) {
          me.records = result.records;
          console.log("neo4j 结果", result.records);
          session.close();
          me.loading = false;
        })
        .catch(function(error) {
          console.log("Cypher 执行失败！", error);
          me.driver.close();
        });
    },
  }
};
</script>

<style scoped>
.box {
  display: flex;
  width: 100%;
  flex-direction: column;
}
.upload {
  display: flex;
  flex-direction: row;
}
.upload .item {
  flex-grow: 1;
}
.table {
}
</style>