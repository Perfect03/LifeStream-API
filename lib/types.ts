export interface CoreConfig {
  DOMAIN_FRONT: string
  DOMAIN_API: string
}

export interface IDevices {
  id: string
  name?: string
  device_type: string
  vendor: string
  model: string
  version: string
  serial: string
  os_name: string
  os_version: string
  timezone: string
  timezone_utcoffset: number
  application_type: string
  profile?: string
  store_source?: string
  settings?: string
  notification?: string
  interfaces?: unknown[]
  created_at: string
  login_at?: string
  user_id: number
  parental_settings?: unknown
  codec_structure_exist: boolean
}

export interface IProvider {
  id: number
  name: string
  proxy?: string
  agreements: {
    terms?: unknown
    privacy?: unknown
    subscripition?: unknown
  }
  landing: {
    logo?: string
    url: string
    shortname: string
    regform_btn_url: string
    regform_btn_caption: string
    login: {
      title: string
      description: string
    }
    support: {
      email: string
      phone: string
      url: string
    }
  }
  auto_auth: string
  is_have_purchases: boolean
  is_allow_additional_packets_without_base: boolean
  free_channels_count: number
  store_sources: unknown[]
  language?: string
  currency: {
    ASCII_NAME: string
    FORMAT: string
    UTF_NAME: string
    ISO_CODE: string
  }
  phone_mask: string
}

export interface ILoginResponse {
  id: string
  email: string
  name: string
  recent_views: string[]
  age_rating: number
  username: string
  session: string
  IVI?: {
    id: number
    expiration: number
    verimatrix_id: string
    session: string
    set_at: number
  }
}

export interface IAuth {
  access_token: string
  expired?: string
  device?: string
  profile:  IProfile
}
export interface IProfile {
  id: string
  name: string
  icon: string
  background: string
  profile: {
    id: number
    role: string
    name: string
    icon: string
    background: string
    description?: string
  }
}
export interface IUser {
  id: string
  login: string
  is_master: boolean
  email: string
  phone: string
}
export interface IAccount {
  id: string
  user: IUser
  users: IUser[]
  profile: IProfile
  profiles: IProfile[]
  provider: IProvider
  is_phone_verified: boolean
}


export interface IThumbnail {
  type: string
  path: string
}
export interface IPoster {
  type: string
  path: string
}
export interface IGenre {
  id: string
  title: string
}
export interface ICategory {
  id: string
  title: string
}
export interface ICountry {
  id: string
  title: string
}
export interface IBrandingMethod {
  name: string
  priority: number
}
export interface ISeason {
  id: string
  number: number
  title: string
}
export interface IActor {
  id: string
  name: string
}
export interface IBackground {
  type: string
  path: string
  originalType: string
  aspectRatio: string
}
export interface ILogoTitle {
  type: string
  path: string
  originalType: string
  aspectRatio: string
}


export interface IContent {
  preview: IContentPreview
  details: {
    description: string
    seasons: ISeason[]
    mediaItems: IMediaItem[]
    brandingMethods: IBrandingMethod[]
    actors?: IActor[]
    backgrounds: IBackground[]
    logoTitles?: ILogoTitle[]
  }
}
export interface IContentPreview {
  id: string
  title: string
  originalTitle: string
  thumbnails: IThumbnail[]
  posters: IPoster[]
  genres?: IGenre[]
  categories?: ICategory[]
  ageRating: string
  ratingImdb: number
  ratingKp: number
  ratingSource: number
  years?: number[]
  countries?: ICountry[]
  hasSeries: boolean
  brandingMethods: IBrandingMethod[]
  kpId?: string
  badgePrimary: string
  badgeSecondary: string
}
export interface ISeason {
  episodes: IContentPreview[]
}

export interface IMediaItem {
  title: string
  source: string
  playbackMethods: IPlaybackMethod[]
  id: string
}
export interface IPlaybackMethod {
  name: string
  priority: number
  params: {key: string, value: string}[]
}
export type PlaybackType = 'megogo_v1'|'smotreshka_vod_v2'|'amedia2_v1'

export interface IPlaybackM3U8 {
  url: string
}
export interface IPlaybackMPD {
  result: string
  code: number
  data: {
    src: string
    license_server: string
    drm_type: string
    audio_tracks: IAudioTrack[]
    bitrates: unknown[]
  }
}
export interface IAudioTrack {
  display_name: string
  id: string
  index: number
  lang: string
  lang_iso_639_1: string
}
