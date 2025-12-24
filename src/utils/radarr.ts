import axios from 'axios'
import { MOVIE_APIKEY, MOVIE_ROOT, MOVIE_SERVER } from '../constants'

//#region Types
export type MovieItem = {
  title: string
  originalTitle: string
  secondaryYearSourceId: number
  sortTitle: string
  sizeOnDisk: number
  status: string
  overview: string
  inCinemas: string
  physicalRelease: string
  digitalRelease: string
  releaseDate: string
  website: string
  year: number
  youTubeTrailerId: string
  studio: string
  path: string
  qualityProfileId: number
  hasFile: boolean
  movieFileId: number
  monitored: boolean
  minimumAvailability: string
  isAvailable: boolean
  folderName: string
  runtime: number
  cleanTitle: string
  imdbId: string
  tmdbId: number
  titleSlug: string
  rootFolderPath: string
  certification: string
  genres: string[]
  keywords: string[]
  tags: any[]
  added: string
  movieFile: MovieFile
  popularity: number
  lastSearchTime: string
  statistics: {
    movieFileCount: number
    sizeOnDisk: number
    releaseGroups: string[]
  }
  id?: number
}

type MovieFile = {
  movieId: number
  relativePath: string
  path: string
  size: number
  dateAdded: string
  sceneName: string
  releaseGroup: string
  edition: string
  quality: {
    quality: Quality
  }
  indexerFlags: number
  mediaInfo: MediaInfo
  originalFilePath: string
  qualityCutoffNotMet: boolean
  id: number
}

type MediaInfo = {
  audioBitrate: number
  audioChannels: number
  audioCodec: string
  audioLanguages: string
  audioStreamCount: number
  videoBitDepth: number
  videoBitrate: number
  videoCodec: string
  videoFps: number
  videoDynamicRange: string
  videoDynamicRangeType: string
  resolution: string
  runTime: string
  scanType: string
  subtitles: string
}

type Quality = {
  id: number
  name: string
  source: string
  resolution: number
  modifier: string
}

export type MovieTorrent = {
  title: string
  indexer: string
  guid: string
  indexerId: string
  quality: {
    quality: {
      id: number
      name: string
      resolution: number
    }
  }
  languages: {
    id: number
    name: string
  }[]
  size: number
}

export type MovieRelease = {
  guid: string
  customFormatScore: number
  qualityWeight: number
  age: number
  ageHours: number
  ageMinutes: number
  size: number
  indexerId: number
  sceneSource: boolean
  approved: boolean
  temporarilyRejected: boolean
  rejected: boolean
  tmdbId: number
  imdbId: number
  publishDate: string
  movieRequested: boolean
  downloadAllowed: boolean
  releaseWeight: number
  protocol: string
}

export type MovieQuality = {
  name: string;
  cutoff: number;
  minFormatScore: number;
  cutoffFormatScore: number;
  minUpgradeFormatScore: number;
  id: number;
}

//#endregion

const radarr = axios.create({
  baseURL: MOVIE_SERVER,
  headers: {
    'X-Api-Key': MOVIE_APIKEY
  }
})

export default radarr

export async function movieLookup(term: string): Promise<MovieItem[]> {
  const res = await radarr.get('/api/v3/movie/lookup', {
    params: {
      term
    }
  })

  const results = res.data

  return results as MovieItem[]
}

export async function movieAddToLibrary(movie: MovieItem, quality: number) {
  const movieData = {
    ...movie,
    qualityProfileId: quality,
    rootFolderPath: MOVIE_ROOT,
    monitored: true,
    addOptions: {
      searchForMovie: true
    }
  }

  const res = await radarr.post('/api/v3/movie', movieData)
  return res.data as MovieItem
}

export async function movieIsDownloading(movie: MovieItem) {
  const data = await radarr.get(`/api/v3/queue/details`, {
    params: {
      movieId: movie.id
    }
  })

  return data.data.length > 0
}

export async function movieListQualities() {
  const data = await radarr.get(`/api/v3/qualityprofile`)

  return data.data as MovieQuality[]
}

export async function movieTriggerDownload(movie: MovieItem) {
  const data = await radarr.post(`/api/v3/command`, {
    name: 'MoviesSearch',
    movieIds: [movie.id]
  })

  return data.data
}