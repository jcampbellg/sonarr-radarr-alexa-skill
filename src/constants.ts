export const MOVIE_APIKEY = process.env.RADARR_APIKEY || ''
export const MOVIE_SERVER = process.env.RADARR_SERVER || 'htttp://localhost:7878'
export const MOVIE_ROOT = process.env.RADARR_ROOT || '/movies'

export const TV_APIKEY = process.env.SONARR_APIKEY || ''
export const TV_SERVER = process.env.SONARR_SERVER || 'http://localhost:8989'
export const TV_ROOT = process.env.SONARR_ROOT || '/tvshows'
export const NO_INTENT = ['no', 'nah', 'nope', 'negative', 'incorrect', 'wrong', 'absolutely not']
export const YES_INTENT = ['yes', 'yeah', 'yep', 'affirmative', 'sure', 'correct', 'positive', 'absolutely']