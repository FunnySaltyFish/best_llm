const MAX_VOTE_NUM = 3;
const messages = {
  zh: {
    title: 'BEST LLM',
    voteDesc: `每人最高可投 ${MAX_VOTE_NUM} 票，请秉持公平公正的原则进行`,
    remain: '余票：',
    voteFailed: '投票失败',
    voteLimit: '投票次数已用完',
    revokeVoteFailed: '撤销投票失败',
    voteSuccess: '投票成功',
    revokeVoteSuccess: '撤销投票成功',
  },
  en: {
    title: 'BEST LLM',
    voteDesc: `You can vote ${MAX_VOTE_NUM} times at most. Please vote fairly.`,
    remain: 'Votes Left: ',
    voteFailed: 'Vote Failed',
    voteLimit: 'Vote Limit',
    revokeVoteFailed: 'Revoke Vote Failed',
    voteSuccess: 'Vote Success',
    revokeVoteSuccess: 'Revoke Vote Success',
  },
};

const KEY_LANG = 'KEY_LANG';

const i18n = VueI18n.createI18n({
  locale: localStorage.getItem(KEY_LANG) || "zh", // set locale
  fallbackLocale: 'zh', // set fallback locale
  messages, // set locale messages
  // If you need to specify other options, you can set other options
  // ...
})

const app = Vue.createApp({
  i18n,
  data() {
    return {
      lang: localStorage.getItem(KEY_LANG) || "zh", // 当前页面语言
      voteNum: MAX_VOTE_NUM, // 用户还剩余的投票次数
      items: [], // 投票项列表
      pageNum: 0, // 当前页码,
      loadFinished: false, // 是否加载完毕,
      uid: "", // 用户id
      contributors: [
        {"name": "Yuan", "link": "http://www.baidu.com" }
      ], // 贡献者列表，{"name":"", "link":""}
    };
  },
  computed: {},
  components: {
    "vote-item": {
      props: ["item"],
      // 向上传递的事件：onVoteSuccess, onRevokeVoteSuccess
      emits: ["vote", "revokeVote", "onVoteSuccess", "onRevokeVoteSuccess"],
      template: `
      <el-card :body-style="{ padding: '12px' }" class="vote-item">
        <!-- 产品名称及开发公司 -->

        <div class="product-info">
            <el-avatar shape="circle" :size="24" :src="item.icon" fit="cover" />
            <el-link :underline="false" :href="item.url" class="name" target="_blank">{{item.name}}</el-link>
            <div class="vendor">{{item.vendor}}
              <span class="corner">{{item.corner}}</span>
            </div>
            <div class="time">{{item.publish_time}}</div>
        </div>
        <!-- 产品简介 -->
        <div class="product-desc">
          <div class="intro" v-html="item.intro"></div>
          <!-- 投票数，在整个卡片居中右侧 -->
          <div class="vote-count">{{item.vote_count}}</div>
        </div>
        
        <!-- 标签及投票信息 -->
        <div class="product-tags">
            <div class="tags">
                <el-tag v-for="tag in item.tags" :key="tag" style="margin-right: 10px">{{tag}}</el-tag>
            </div>
            <el-button type="primary" :icon="item.voted ? 'StarFilled' : 'Star'" @click="toggleVote(item)" circle></el-button>
        </div>
      </el-card>

      `,
      methods: {
        async toggleVote(item) {
          if (item.voted) {
            this.$emit("revokeVote", item);
            return;
          }
          else {
            this.$emit("vote", item);
          }
        },
      },
    },
  },
  template: `
    <el-container>
        <el-affix>
          <el-header>
            <div class="header">
              <div class="title">{{$t('title')}}</div>
              <!-- 分割线 -->
              <el-divider direction="vertical" />
              <!-- 用户剩余投票次数 -->
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="$t('voteDesc')"
                placement="bottom"
              >
                <div class="remain-votes">{{$t('remain')}} {{voteNum}}</div>
              </el-tooltip>
              <div class="lang-switch">
                <el-select v-model="lang" placeholder="请选择" @change="toggleLang" style="width: 96px">
                  <el-option label="中文" value="zh"></el-option>
                  <el-option label="English" value="en"></el-option>
                </el-select>
              </div>  
            </div>
          </el-header>
        </el-affix>
        <el-main>
          <!-- 投票项列表 -->
          <div class="vote-list" v-infinite-scroll="loadNewPage" infinite-scroll-immediate="false">
              <vote-item v-for="item in items" :key="item.id" :item="item" :voteNum="voteNum" @vote="vote" @revokeVote="revokeVote" />
          </div>
        </el-main>
        <el-footer>
          <div class="footer">
            <div class="footer-desc">Made with the help of ChatGPT and Github Copilot</div>
            <p>Contributors:</p>
            <div class="contributors">
              <el-link v-for="item in contributors" :href="item.link" target="_blank"> {{item.name}} </el-link>
            </div>
          </div>
        </el-footer>
    </el-container>
    `,
  methods: {
    toggleLang() {
      this.$i18n.locale = this.lang;
      localStorage.setItem(KEY_LANG, this.lang);
    },
    loadNewPage() {
      if (this.loadFinished) return;
      // console.log("load new page, uid = " + this.uid);
      if (!this.uid || this.uid == '') return;

      // 加载新的一页
      API.getLLMList(this.pageNum, 10, this.uid).then((res) => {
        // 添加到items
        this.items.push(...res);
        if (res.length < 10) {
          console.log('load finished');
          this.loadFinished = true;
        }
      });
      this.pageNum += 1;
    },
    revokeVote: async function (item) {
      if (this.voteNum === MAX_VOTE_NUM) return;
      try {
        await API.revokeVote(item.id)
        item.voted = false;
        item.vote_count -= 1;
        this.voteNum += 1; // 投票次数加1
      } catch (err) {
        this.$message({
          showClose: true,
          message: this.$t('revokeVoteFailed') + "! " + err,
          type: 'error',
        })
      }
    },
    vote: async function (item) {
      if (this.voteNum === 0) {
        this.$message({
          showClose: true,
          message: this.$t('voteLimit'),
          type: 'error',
        })
        return;
      }
      try {
        await API.vote(item.id)
        item.voted = true;
        item.vote_count += 1;
        this.voteNum -= 1; // 投票次数减1
      } catch (err) {
        this.$message({
          showClose: true,
          message: this.$t('voteFailed') + "! " + err,
          type: 'error',
        })
      }
    }

  },
  async mounted() {
    this.contributors = await API.getContributors();

    let uid = localStorage.getItem('uid');
    if (!uid) {
      // Initialize the agent at application startup.
      const visitorId = await import('https://openfpcdn.io/fingerprintjs/v3')
        .then(FingerprintJS => FingerprintJS.load())
        .then(fp => fp.get())
        .then(result => result.visitorId) // This is the visitor identifier:
      console.log("visitorId", visitorId);
      uid = visitorId;
      localStorage.setItem('uid', visitorId);
    }
    this.uid = uid;

    const voteNum = (await API.getUserVoteNum());
    this.voteNum = voteNum;
    this.loadNewPage();
  },
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus).use(i18n)
  .mount('#app');
