import { RequestHandler } from 'ask-sdk-core'
import { IntentRequest } from 'ask-sdk-model'

const FallbackHandler: RequestHandler = {
  canHandle(handlerInput) {
    const req = handlerInput.requestEnvelope.request
    return (
      req.type === 'IntentRequest' &&
      (
        req.intent.name === 'AMAZON.StopIntent' ||
        req.intent.name === 'AMAZON.CancelIntent' ||
        req.intent.name === 'AMAZON.FallbackIntent' ||
        req.intent.name === 'MovieSearchIntent' ||
        req.intent.name === 'TVShowSearchIntent'
      )
    )
  },
  handle(handlerInput) {
    const intent = (handlerInput.requestEnvelope.request as IntentRequest).intent

    if (['AMAZON.CancelIntent', 'AMAZON.StopIntent' ].includes(intent.name) ) {
      return handlerInput.responseBuilder
        .speak('Goodbye!')
        .withShouldEndSession(true)
        .getResponse()
    }
    
    return handlerInput.responseBuilder
      .speak('I\'m sorry, I didn\'t understand that. Please start over.')
      .withShouldEndSession(true)
      .getResponse()
  }
}

export default FallbackHandler