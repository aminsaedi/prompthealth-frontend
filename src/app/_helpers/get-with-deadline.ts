import { default as axios, AxiosResponse } from 'axios';

/*
 * A GET to the API from the server render, bounded as a whole.
 *
 * The SSR redirect routers call the API while the reader's request waits, and
 * before server.ts's render timeout exists. axios's own timeout option is
 * req.setTimeout underneath, which on Node 14 starts counting only once the
 * socket has connected: a backend that never answered the TCP handshake held
 * the request for the kernel's connect timeout, over two minutes, well past
 * nginx's 60 s, after which nginx counts the site's only upstream as down. The
 * cancel token fires on the clock whatever state the request is in; the
 * timeout option stays for a server that connects and then stops talking.
 */
export const API_DEADLINE_MS = 10000;

export async function getWithDeadline(url: string): Promise<AxiosResponse<any>> {
  const source = axios.CancelToken.source();
  const timer = setTimeout(() => source.cancel('timeout'), API_DEADLINE_MS);
  try {
    return await axios.get(url, { timeout: API_DEADLINE_MS, cancelToken: source.token });
  } finally {
    clearTimeout(timer);
  }
}
