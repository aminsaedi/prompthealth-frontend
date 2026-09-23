import { default as axios, AxiosResponse } from 'axios';

/*
 * A GET to the API from the server render, with one clock on the whole call.
 *
 * The SSR redirect routers call the API while the reader's request waits, and
 * before server.ts's render timeout exists. axios's timeout option does cover
 * connecting: axios sends through follow-redirects, whose timer starts when the
 * socket is assigned (a 2 s timeout fired at 2 s against a listener that drops
 * every SYN). But that timer stops once the response has begun, after which
 * only the socket's idle limit applies, and the /magazines/<slug> lookup had
 * no timeout at all. The cancel token fires on the clock whatever state the
 * request is in, so no redirect can hold a reader past API_DEADLINE_MS.
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
