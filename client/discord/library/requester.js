const axios = require('axios');

module.exports = client => {

    /* Create a bsae isntance config for axios */
    const instance = axios.create({
        baseURL: `http://${client.config.api.host}:${client.config.api.port}`,
        timeout: client.config.api.request_timeout,
        headers: {
            secretKey: client.config.api.secret
        }
    });

    return {
        /**
         * Sends requests to the API server. Private route.
         * @param {Object} msg
         * @returns {Object} Returns `result` | Promise.
         */
        send: function (msg) {
            return new Promise((resolve, reject) => {
                instance.post(`/api`, msg)
                    .then(res => {
                        if (res.data && res.data.status === 'success') {
                            resolve(res.data.result);
                        } else if (res.data && res.data.status === 'error') {
                            client.logger.log(`API request\n'${res.data.reason}'`, "error");
                        } else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        client.logger.log(`API request error: '${e.response.data.status}', URL: '${e.config.url}'`, "error");
                        reject(e);
                    });
            });
        },
        /**
         * Sends requests to the API server to check if it's still available via the public routes.
         * @returns {Object} Returns `status`.
         */
        healthCheck: function() {
            return new Promise((resolve, reject) => {
                instance.get('/healthCheck')
                    .then(res => {
                        if (res.data && res.data.status === 'up') resolve(true);
                        else reject(new Error('Unexpected Response from api.'));
                    })
                    .catch(e => {
                        reject(e);
                    });
            });
        }
    };
};