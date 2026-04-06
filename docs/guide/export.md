# One-Click Export

Any captured request can be turned into runnable code in one click.

## Formats

### Python — requests

```python
import requests

url = "https://api.example.com/v1/data"

headers = {
    "User-Agent": "Mozilla/5.0 ...",
    "Authorization": "Bearer ...",
}

cookies = {
    "session_id": "abc123",
}

response = requests.post(url, headers=headers, cookies=cookies, json=data)
print(response.status_code)
print(response.text[:2000])
```

### Python — curl_cffi

Same as above but uses `curl_cffi` with `impersonate="chrome120"` — gets you Chrome-identical TLS from Python.

```python
from curl_cffi import requests

response = requests.post(url, headers=headers, cookies=cookies, impersonate="chrome120")
```

### cURL

```bash
curl -X POST \
  'https://api.example.com/v1/data' \
  -H 'Authorization: Bearer ...' \
  -H 'Cookie: session_id=abc123' \
  --data-raw '{"key": "value"}' \
  --compressed
```

### JavaScript fetch

```js
const response = await fetch('https://api.example.com/v1/data', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ...',
  },
  body: JSON.stringify({"key": "value"})
});
const data = await response.text();
```

## Using the EXPORT Tab

1. Select a request in the NETWORK tab
2. Go to the EXPORT tab
3. Choose your format from the dropdown
4. Click **GENERATE**
5. Click **COPY** or **DOWNLOAD**

Cookies are automatically resolved from the Cookie Inspector based on the request URL's domain.
