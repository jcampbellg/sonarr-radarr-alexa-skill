import { RequestHandler } from 'ask-sdk-core'

const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput) {
    const req = handlerInput.requestEnvelope.request
    return (
      req.type === 'LaunchRequest' ||
      (
        req.type === 'IntentRequest' && (
          req.intent.name === 'AMAZON.FallbackIntent' ||
          req.intent.name === 'AMAZON.NavigateHomeIntent' ||
          req.intent.name === 'AMAZON.HelpIntent'
        )
      )
    )
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('You want to download a movie or download a TV show?')
      .reprompt('Please say download a movie or download a TV show.')
      .getResponse()
  }
}

export default LaunchRequestHandler