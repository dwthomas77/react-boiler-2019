// polyfill fetch
import 'whatwg-fetch';

export default function request(url, method = 'GET', body, options = {}) {
    body = body instanceof FormData ? body : JSON.stringify(body);

    options = {
        ...options,
        method,
        body,
    };

    return fetch(
        url,
        options,
    )
        .then((res) => {
            if (!res.ok) {
                return Promise.reject(res);
            }

            return res;
        });
}
