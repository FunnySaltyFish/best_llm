exports.install = function(Vue, options) {
  Vue.prototype.getLangText = function(key) {
    // 根据当前语言获取对应的文本
    const langData = {
      zh: {
        title: 'LLM最好评选',
        voteBtn: '投票',
        remain: '剩余投票次数：',
      },
      en: {
        title: 'BEST LLM Vote',
        voteBtn: 'Vote',
        remain: 'Remain Votes: ',
      },
    };
    return langData[this.lang][key];
  };
}