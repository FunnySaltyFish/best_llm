// 项目的 API
const http = {
    async get(url, data = {}, config = {}) {
        const res = await this.request(url, 'GET', data, config);
        return res;
    },

    async post(url, data = {}, config = {
        data: "form"
    }) {
        const headers = { 'Content-Type': 'application/json' };
        let body = JSON.stringify(data);

        if (config.data === 'form') {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            body = Object.keys(data)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
                .join('&');
        }

        const res = await this.request(url, 'POST', body, {
            ...config,
            headers: { ...headers, ...config.headers },
        });

        return res;
    },

    async request(url, method, data = {}, config = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(config.headers || {}),
        };

        const uid = localStorage.getItem('uid');
        if (uid) {
            headers['uid'] = uid;
        }

        const options = {
            method,
            headers,
            body: data,
            ...config,
        };

        const res = await window.fetch(url, options);

        if (!res.ok) {
            throw new Error(await res.text() || '请求失败');
        }

        return res;
    },
};



const API = {
    // 获取分页的LLM列表
    getLLMList: (page, size) => {
        const request = fetch(`/api/llms?page=${page}&size=${size}`);
        return request.then((res) => res.json()
            .catch((err) => {
                console.error(err);
                return {};
            }));
    },
    vote: (id) => {
        const request = http.post(`/api/llms/${id}/vote`)

        // 状态码为 200 时，不返回
        // 反之抛出错误
        return request.then((res) => {
            if (res.status === 200) {
                return {};
            } else {
                // 获取到 text 并加上状态码返回
                return res.text().then((text) => {
                    const err = new Error(text + ` (status code: ${res.status})`);
                    throw err;
                });
            }
        })
    },
    revokeVote: (id) => {
        const request = http.post(`/api/llms/${id}/revoke_vote`)
        // 状态码为 200 时，不返回
        // 反之抛出错误
        return request.then((res) => {
            if (res.status === 200) {
                return {};
            } else {
                // 获取到 text 并加上状态码返回
                return res.text().then((text) => {
                    const err = new Error(text + ` (status code: ${res.status})`);
                    throw err;
                });
            }
        })
    },
    getUserVoteNum: async (uid) => {
        const request = http.post(`/api/users/vote_num?uid=${uid}`);
        const res = await request;
        const text = await res.text();
        console.log(text);
        return Number.parseInt(text);
    }
};


window.API = API;