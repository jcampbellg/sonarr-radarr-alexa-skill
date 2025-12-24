import axios from 'axios';
import { TV_APIKEY, TV_ROOT, TV_SERVER } from '../constants'

//#region Types
export type TVItem = {
  id?: number
  title: string
  tmdbId: number
  tvdbId: number
  imdbId: number
  year: number
  statistics: {
    episodeCount: number
    episodeFileCount: number
    percentOfEpisodes: number
    seasonCount: number
    totalEpisodeCount: number
  }
}

export type TVShowQuality = {
  name: string;
  cutoff: number;
  minFormatScore: number;
  cutoffFormatScore: number;
  minUpgradeFormatScore: number;
  id: number;
}
//#endregion

const sonarr = axios.create({
  baseURL: TV_SERVER,
  headers: {
    'X-Api-Key': TV_APIKEY
  }
})


export default sonarr

export async function tvShowLookup(term: string): Promise<TVItem[]> {
  const res = await sonarr.get('/api/v3/series/lookup', {
    params: {
      term
    }
  })

  const results = res.data

  return results as TVItem[]
}

export async function tvShowAddToLibrary(tvShow: TVItem, quality: number): Promise<TVItem> {
  const res = await sonarr.post('/api/v3/series', {
    ...tvShow,
    qualityProfileId: quality,
    rootFolderPath: TV_ROOT,
    monitored: true,
    addOptions: {
      monitor: 'all',
      searchForCutoffUnmetEpisodes: false,
      searchForMissingEpisodes: true
    },
  })

  return res.data as TVItem
}

export async function tvShowGet(id: number): Promise<TVItem> {
  const res = await sonarr.get(`/api/v3/series/${id}`)

  return res.data as TVItem
}

export async function tvShowListQualities() {
  const data = await sonarr.get(`/api/v3/qualityprofile`)

  return data.data as TVShowQuality[]
}