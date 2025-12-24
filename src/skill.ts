import * as Alexa from 'ask-sdk-core'
import LaunchRequestHandler from '@/handlers/LaunchRequestHandler'
import SessionEndedRequestHandler from '@/handlers/SessionEndedRequestHandler'
import FallbackHandler from '@/handlers/FallbackHandler'
import MovieSearchIntentHandler from './handlers/MovieSearchIntentHandler'

export const skill = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    MovieSearchIntentHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .create()
