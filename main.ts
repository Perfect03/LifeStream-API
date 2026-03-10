import type { CoreConfig, IContent, IPlaybackM3U8, IPlaybackMPD, PlaybackType } from "./lib/types.js";
import { createAuthModule } from "./lib/modules/auth.js";
import { createAPIModule } from "./lib/modules/api.js";
import { ContentMetadata, ContentSource, Extension, utils } from "azot";

export interface CoreContext extends CoreConfig {}

export class Lfstrm {
  DOMAIN_FRONT: string;
  DOMAIN_API: string;

  auth: ReturnType<typeof createAuthModule>;
  api: ReturnType<typeof createAPIModule>;
  azotExtension: Extension;
  init: () => Promise<void>;
  canHandle: (url: string) => boolean;

  constructor(config: CoreConfig) {
    this.DOMAIN_FRONT = `https://${config.DOMAIN_FRONT}`;
    this.DOMAIN_API = `https://${config.DOMAIN_API}.server-api.lfstrm.tv`;

    const ctx: CoreContext = { DOMAIN_FRONT: this.DOMAIN_FRONT, DOMAIN_API: this.DOMAIN_API };
    this.auth = createAuthModule(ctx);
    this.api = createAPIModule(ctx);

    this.init = async () => {
      await this.auth.checkAuth();
    };

    this.canHandle = (url) => new URL(url).hostname.includes(config.DOMAIN_FRONT);

    this.azotExtension = {
      init: this.init,
      canHandle: this.canHandle,
      fetchContentMetadata: async (url: string, args: any) => {
        const { cinema, contentId, seasonNumber } = this.parseUrlParams(url);
        const metadata = await this.api.fetchContent(cinema, contentId);

        if (!metadata?.details) {
          console.error("Content not found. Please check the link for accuracy.");
          return [];
        }

        const results: ContentMetadata[] = [];
        const mainTitle = utils.sanitizeString(metadata.preview.title);
        const epsFilter = utils.extendEpisodes(args.episodes);

        if (metadata.details.seasons) {
          const targetSeasons = seasonNumber
            ? metadata.details.seasons.filter((s) => s.number === seasonNumber)
            : metadata.details.seasons.filter((s) => epsFilter.has(undefined, s.number));

          for (const season of targetSeasons) {
            const seasonData = await this.api.fetchSeriesSeason(cinema, contentId, season.id);
            
            const episodePromises = (seasonData?.episodes || [])
              .map((episode, index) => ({ episode, index, num: index + 1 }))
              .filter(({ num }) => epsFilter.has(num, season.number))
              .map(async ({ episode, num }) => {
                const epData = await this.api.fetchContent(cinema, episode.id);
                const source = await this.extractSource(episode.id, epData.details.mediaItems, args?.languages?.[0]);

                return {
                  id: episode.id,
                  source,
                  title: mainTitle,
                  episodeNumber: num,
                  seasonNumber: season.number,
                  episodeTitle: episode.title,
                };
              });

            results.push(...(await Promise.all(episodePromises)));
          }
        }
        else {
          const source = await this.extractSource(metadata.preview.id, metadata.details.mediaItems, args?.languages?.[0]);
          results.push({
            id: metadata.preview.id,
            title: mainTitle,
            source,
          });
        }

        return results;
      },
    };
  }

  private parseUrlParams(url: string) {
    const match = url.match(/season(\d+)\/?$/i);
    const cinema = url.split("/vod/")[1]?.split("/")[0] as string;
    let contentId = url.split(`${cinema}/`)[1]?.split("/")[0] as string;
    contentId = contentId.replace(/\/season\d+\/?$/i, "");

    return {
      cinema,
      contentId,
      seasonNumber: match ? Number(match[1]) : null,
    };
  }

  private async extractSource(id: string, mediaItems: any[], lang?: string): Promise<ContentSource> {
    const method = mediaItems?.[0]?.playbackMethods.reduce((min: any, curr: any) =>
      curr.priority < min.priority ? curr : min
    );

    const playback = await this.api.fetchPlayback(id, method?.name, method?.params);

    let url = (playback as IPlaybackM3U8).url || (playback as IPlaybackMPD).data?.src;
    if (!url) throw new Error(playback?.message ?? "Playback URL not found");

    const audioTrack = (playback as IPlaybackMPD)?.data?.audio_tracks?.find(t => t.lang_iso_639_1 === lang);
    if (audioTrack) url = url.replace(/\/\d+\/ix\.mpd$/, `/${audioTrack.index}/ix.mpd`);

    const source: ContentSource = { url };
    const mpdData = (playback as IPlaybackMPD).data;

    if (mpdData) {
      if (audioTrack) {
        source.audioLanguage = audioTrack.display_name;
        source.audioType = audioTrack.lang_iso_639_1;
      }
      if (mpdData.license_server) {
        source.drm = { server: mpdData.license_server };
      }
    }

    return source;
  }
}
