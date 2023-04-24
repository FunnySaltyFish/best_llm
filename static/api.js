// 项目的 API
const http = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        
    },
});

http.interceptors.request.use(
    config => {
        const uid = localStorage.getItem('uid');
        if (uid) {
            config.headers['uid'] = uid;
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);

http.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        console.log("request with url " + error.config.url + " failed, status code = " + error.response.status, "error = ", error)
        return Promise.reject(
            error.response.data.detail || error.message || '请求失败',
        );
    }
);


const API = {
    // 获取分页的LLM列表
    getLLMList: (page, size, uid) => {
        const request = http.get(`/llms?page=${page}&size=${size}&uid=${uid}`);
        return request.then((res) => {
            return res.data;
        })
    },
    vote: (id) => {
        const request = http.post(`/llms/${id}/vote`)
        // 状态码为 200 时，不返回
        // 反之抛出错误
        return request
    },
    revokeVote: (id) => {
        const request = http.post(`/llms/${id}/revoke_vote`)
        // 状态码为 200 时，不返回
        // 反之抛出错误
        return request
    },
    getUserVoteNum: async () => {
        const request = http.post(`/users/vote_num`);
        const text = (await request).data;
        console.log(text);
        return Number.parseInt(text);
    },
    getContributors: async () => {
        const request = http.get(`/contributors`);
        return (await request).data;
    }
};


window.API = API;