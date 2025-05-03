import { describe, test, expect } from "vitest";
import ky from "ky";
import { EnvHttpProxyAgent } from 'undici'

// @ts-ignore
const kyWithProxy = ky.extend({ dispatcher: new EnvHttpProxyAgent({httpsProxy: 'http://127.0.0.1:17890', noProxy: 'localhost'}) })
test('request model resource url', async () => {
  
    const res = await kyWithProxy.get('https://civitai.com/api/download/models/1379808?token=d250ad5b931cd1ab4895b66ae2d42149', {
      timeout: 60000
    })
    
    if (!res.ok) {
      throw new Error(`Fetch error: ${res.statusText}`);
    }

    expect(res.url).toBeTypeOf('string')
    console.log(res.url)
})