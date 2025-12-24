import { movieAddToLibrary, MovieItem, movieLookup, movieListQualities, movieIsDownloading, movieTriggerDownload } from '@/utils/radarr'
import { HandlerInput, RequestHandler } from 'ask-sdk-core'
import { IntentRequest } from 'ask-sdk-model'

const MovieSearchIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    const req = handlerInput.requestEnvelope.request
    return (
      req.type === 'IntentRequest' &&
      req.intent.name === 'MovieSearchIntent'
    )
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request as IntentRequest

    if (request.dialogState === 'STARTED') {
      return STARTED(handlerInput)
    }

    if (request.dialogState === 'IN_PROGRESS') {
      return IN_PROGRESS(handlerInput)
    }

    const session = handlerInput.attributesManager.getSessionAttributes()
    const movieToDownload = session.movie as MovieItem

    if (!!movieToDownload.id) {
      if (movieToDownload.movieFileId) {
        return handlerInput.responseBuilder
          .speak(`${movieToDownload.title} is already in your library.`)
          .withShouldEndSession(true)
          .getResponse()
      }

      const isDownloading = await movieIsDownloading(movieToDownload)
  
      if (isDownloading) {
        return handlerInput.responseBuilder
        .speak(`${movieToDownload.title} is already downloading.`)
        .withShouldEndSession(true)
        .getResponse()
      }

      await movieTriggerDownload(movieToDownload)
    }

    // Add Movie to Radarr
    const qualityId = parseInt((request.intent.slots?.quality.value || '1'), 10)
    await movieAddToLibrary(movieToDownload, qualityId)

    return handlerInput.responseBuilder
      .speak(`Downloading ${movieToDownload.title} to your library.`)
      .withShouldEndSession(true)
      .getResponse()
  }
}

export default MovieSearchIntentHandler

async function STARTED(handlerInput: HandlerInput) {
  // ask for term to search
  return handlerInput.responseBuilder
    .speak(`What is the title of the movie?`)
    .addElicitSlotDirective('term')
    .getResponse()
}

async function IN_PROGRESS(handlerInput: HandlerInput) {
  const request = handlerInput.requestEnvelope.request as IntentRequest
  const intent = request.intent
  const session = handlerInput.attributesManager.getSessionAttributes()
  const termSlot = intent.slots?.term.value || ''

  if (!session.results || session.results.length === 0) {
    session.results = await movieLookup(termSlot)
    const results = session.results
  
    if (results.length === 0) {
      if (results.length === 0) {
        handlerInput.attributesManager.setSessionAttributes(session)
        return handlerInput.responseBuilder
          .speak(`I couldn't find ${termSlot}. What is the title of the movie again?`)
          .addElicitSlotDirective('term')
          .getResponse()
      }
    }
  }

  const movieSlot = intent.slots?.movie.value || ''
  
  if (!movieSlot || ['no', 'nah', 'nope', 'negative'].includes(movieSlot.toLowerCase())) {
    session.cursor = !movieSlot ? 0 : session.cursor + 1

    handlerInput.attributesManager.setSessionAttributes(session)
    return handlerInput.responseBuilder
      .speak(`Did you mean ${session.results[session.cursor].title} from ${session.results[session.cursor].year}?`)
      .addElicitSlotDirective('movie')
      .getResponse()
  }

  session.movie = session.results[session.cursor]
  const qualitySlot = intent.slots?.quality.value || ''

  if (!qualitySlot) {
    handlerInput.attributesManager.setSessionAttributes(session)
    return handlerInput.responseBuilder
      .speak(`What quality do you want for ${session.movie.title}?`)
      .addElicitSlotDirective('quality')
      .getResponse()
  }

  const qualities = await movieListQualities()

  const selectedQuality = qualities.find(q => q.name.split('-').join(' ').split('_').join(' ').toLowerCase().includes(qualitySlot.toLowerCase()))

  if (!selectedQuality) {
    handlerInput.attributesManager.setSessionAttributes(session)
    return handlerInput.responseBuilder
      .speak(`I couldn't find the quality profile ${qualitySlot}. What quality do you want for ${session.movie.title}?`)
      .addElicitSlotDirective('quality')
      .getResponse()
  }

  handlerInput.attributesManager.setSessionAttributes(session)

  return handlerInput.responseBuilder
    .addDelegateDirective({
      name: 'MovieSearchIntent',
      confirmationStatus: 'CONFIRMED',
      slots: {
        term: {
          name: 'term',
          confirmationStatus: 'CONFIRMED',
          value: termSlot          
        },
        movie: {
          name: 'movie',
          confirmationStatus: 'CONFIRMED',
          value: session.cursor.toString()
        },
        quality: {
          name: 'quality',
          confirmationStatus: 'CONFIRMED',
          value: selectedQuality.id.toString()
        }
      }
    })
    .getResponse()
}