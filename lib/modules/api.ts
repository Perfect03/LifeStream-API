import type { IAccount, IContent, ISeason, PlaybackType, IPlaybackM3U8, IPlaybackMPD } from "../types.js";
import { CoreContext } from "../../main.js";
import { DEFAULT_HEADERS } from "../constants.js";

export function createAPIModule(ctx: CoreContext) {
  return {
    async request<T>(url: string, method: string = "GET", params?: Record<string, string>) {
      console.debug(`Getting data from ${url}...`);

      const query = new URLSearchParams({
        ...params,
        "device.drm": "wvm",
      }).toString();

      const response = await fetch(`${url}?${query}`, {
        method,
        headers: DEFAULT_HEADERS,
      });
      const data = (await response.text()) || "";
      const isSuccess = response.status === 200;
      if (!isSuccess) console.debug(`Request failed. Route: ${url}. ${data}`);
      try {
        return (data ? JSON.parse(data) : data) as T;
      } catch (e) {
        console.debug(data);
        console.debug(e as any);
        throw new Error(`Parsing JSON response failed. Route: ${url}`);
      }
    },
    async fetchAccount() {
      return this.request<IAccount>(`${ctx.DOMAIN_API}/v2/users/self`);
    },
    async fetchContent(cinema: string, title: string) {
      return this.request<IContent>(`${ctx.DOMAIN_API}/vod/v2/${cinema}/titles/${title}`);
    },
    async fetchSeriesSeason(cinema: string, title: string, seasonId: string) {
      return this.request<ISeason>(`${ctx.DOMAIN_API}/vod/v2/${cinema}/titles/${title}/seasons/${seasonId}/episodes`);
    },
    async fetchPlayback(
      contentId: string,
      playbackMethod: PlaybackType,
      params?: {
        key: string;
        value: string;
      }[],
    ) {
      const playbackAlias = playbackMethod.startsWith("smotreshka_vod_v")
        ? playbackMethod.match(/v\d+/)?.[0]
        : playbackMethod.replace("_", "/");

      return this.request<IPlaybackMPD | IPlaybackM3U8>(
        `${ctx.DOMAIN_API}/playback/vod/${playbackAlias}/${contentId}`,
        "GET",
        Object.fromEntries((params ?? []).map(({ key, value }) => [key, value])),
      );
    },
  };
}
