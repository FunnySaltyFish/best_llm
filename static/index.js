
const messages = {
  zh: {
    title: 'LLM最好评选',
    voteDesc: '每人可投3票，请秉持公平公正的原则进行',
    remain: '剩余投票次数：',
    voteFailed: '投票失败',
    voteLimit: '投票次数已用完',
    revokeVoteFailed: '撤销投票失败',
    voteSuccess: '投票成功',
    revokeVoteSuccess: '撤销投票成功',
  },
  en: {
    title: 'BEST LLM Vote',
    voteDesc: 'You can vote 3 times. Please vote fairly.',
    remain: 'Remain Votes: ',
    voteFailed: 'Vote Failed',
    voteLimit: 'Vote Limit',
    revokeVoteFailed: 'Revoke Vote Failed',
    voteSuccess: 'Vote Success',
    revokeVoteSuccess: 'Revoke Vote Success',
  },
};

const i18n = VueI18n.createI18n({
  locale: 'zh', // set locale
  fallbackLocale: 'zh', // set fallback locale
  messages, // set locale messages
  // If you need to specify other options, you can set other options
  // ...
})

const app = Vue.createApp({
  i18n,
  data() {
    return {
      lang: "zh", // 当前页面语言
      voteNum: 3, // 用户还剩余的投票次数
      items: [], // 投票项列表
      pageNum: 0, // 当前页码,
      loadFinished: false, // 是否加载完毕,
      uid: "", // 用户id
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
        <el-container>
            <el-main style="--el-main-padding: 4px">
            <div class="product-info">
                <el-avatar shape="circle" :size="24" :src="item.icon" fit="cover" />
                <div class="name">{{item.name}}</div>
                <div class="vendor">
                {{item.vendor}}<span class="corner">{{item.corner}}</span>
                </div>
                <div class="time">{{item.publish_time}}</div>
            </div>
            <!-- 产品简介 -->
            <div class="product-desc">
                <div class="intro">{{item.intro}}</div>
            </div>
            </el-main>
            <el-aside width="200px">
            <!-- 投票数，在整个卡片居中右侧 -->
            <div class="vote-count">{{item.vote_count}}</div>
            </el-aside>
        </el-container>
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
        toggleLang() {
          this.lang = this.lang === "zh" ? "en" : "zh";
        },
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
        <el-header>Header</el-header>
        <el-main>
            <!-- 投票项列表 -->
            <div class="vote-list" v-infinite-scroll="loadNewPage">
                <vote-item v-for="item in items" :key="item.id" :item="item" :voteNum="voteNum" @vote="vote" @revokeVote="revokeVote" />
            </div>
            <!-- 用户剩余投票次数 -->
            <div class="remain-votes">{{$t('remain')}} {{voteNum}}</div>
            <!-- 投票说明 -->
            <div class="vote-desc">{{$t('voteDesc')}}</div>
        </el-main>
        <el-footer>Footer</el-footer>
    </el-container>
    `,
  methods: {
    loadNewPage() {
      if (this.loadFinished) return;
      if (!this.uid) return;

      // 加载新的一页
      API.getLLMList(this.pageNum, 10).then((res) => {
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
      if (this.voteNum === 3) return;
      try {
        await API.revokeVote(item.id)
        item.voted = false;
        item.vote_count -= 1;
        this.voteNum += 1; // 投票次数加1
      } catch (err) {
        this.$message({
          showClose: true,
          message: this.$t('revokeVoteFailed') + "! " + err.message,
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
          message: this.$t('voteFailed') + "! " + err.message,
          type: 'error',
        })
      }
    }

  },
  async mounted() {
    console.log('mounted');
    let uid = localStorage.getItem('uid');
    if (!uid) {
      // Initialize the agent at application startup.
      const visitorId = await import('https://openfpcdn.io/fingerprintjs/v3')
        .then(FingerprintJS => FingerprintJS.load())
        .then(fp => fp.get())
      // .then(result => result.visitorId) // This is the visitor identifier:
      console.log(visitorId)
      this.uid = visitorId;
    }

    API.getUserVoteNum().then((res) => {
      this.voteNum = res;
    }).catch((err) => {
      console.log(err);
    })

    this.loadNewPage();
  },
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus).use(i18n)
  .mount('#app');
