import { NO_INTENT, YES_INTENT } from '@/constants'
import { TVItem, tvShowAddToLibrary, tvShowGet, tvShowIsDownloading, tvShowListQualities, tvShowLookup, tvShowTriggerDownload } from '@/utils/sonarr'
import { HandlerInput, RequestHandler } from 'ask-sdk-core'
import { IntentRequest } from 'ask-sdk-model'

const TVShowSearchIntentHandler: RequestHandler = {
  canHandle(handlerInput) {
    const req = handlerInput.requestEnvelope.request
    return (
      req.type === 'IntentRequest' &&
      req.intent.name === 'TVShowSearchIntent'
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
    const tvShowToDownload = session.tvshow as TVItem

    if (!!tvShowToDownload.id) {
      const { statistics } = await tvShowGet(tvShowToDownload)
      if (statistics.percentOfEpisodes === 100) {
        return handlerInput.responseBuilder
          .speak(`All episodes of ${tvShowToDownload.title} are already in your library.`)
          .withShouldEndSession(true)
          .getResponse()
      }

      const isDownloading = await tvShowIsDownloading(tvShowToDownload)
  
      if (isDownloading) {
        return handlerInput.responseBuilder
        .speak(`${tvShowToDownload.title} is already downloading.`)
        .withShouldEndSession(true)
        .getResponse()
      }

      await tvShowTriggerDownload(tvShowToDownload)
    }

    // Add Movie to Radarr
    const qualityId = parseInt((request.intent.slots?.quality.value || '1'), 10)
    await tvShowAddToLibrary(tvShowToDownload, qualityId)

    return handlerInput.responseBuilder
      .speak(`Downloading ${tvShowToDownload.title} to your library.`)
      .withShouldEndSession(true)
      .getResponse()
  }
}

export default TVShowSearchIntentHandler

async function STARTED(handlerInput: HandlerInput) {
  // ask for term to search
  return handlerInput.responseBuilder
    .speak(`What is the title of the TV show?`)
    .addElicitSlotDirective('term')
    .getResponse()
}

async function IN_PROGRESS(handlerInput: HandlerInput) {
  const request = handlerInput.requestEnvelope.request as IntentRequest
  const intent = request.intent
  const session = handlerInput.attributesManager.getSessionAttributes()
  const termSlot = intent.slots?.term.value || ''

  if (!session.results || session.results.length === 0) {
    session.results = await tvShowLookup(termSlot)
    const results = session.results
  
    if (results.length === 0) {
      if (results.length === 0) {
        handlerInput.attributesManager.setSessionAttributes(session)
        return handlerInput.responseBuilder
          .speak(`I couldn't find ${termSlot}. What is the title of the TV show again?`)
          .addElicitSlotDirective('term')
          .getResponse()
      }
    }
  }

  const movieSlot = intent.slots?.movie.value || ''
  
  if (!movieSlot || NO_INTENT.includes(movieSlot.toLowerCase())) {
    session.cursor = !movieSlot ? 0 : session.cursor + 1

    handlerInput.attributesManager.setSessionAttributes(session)
    return handlerInput.responseBuilder
      .speak(`Did you mean ${session.results[session.cursor].title}?`)
      .addElicitSlotDirective('tvshow')
      .getResponse()
  }

  if (!YES_INTENT.includes(movieSlot.toLowerCase())) {
    handlerInput.attributesManager.setSessionAttributes(session)
    return handlerInput.responseBuilder
      .speak(`Please answer yes or no. Did you mean ${session.results[session.cursor].title}?`)
      .addElicitSlotDirective('tvshow')
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

  const qualities = await tvShowListQualities()

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