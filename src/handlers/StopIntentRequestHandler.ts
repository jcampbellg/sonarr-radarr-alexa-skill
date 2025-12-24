import { RequestHandler } from 'ask-sdk-core'

const StopIntentRequestHandler: RequestHandler = {
  canHandle(handlerInput) {
    const req = handlerInput.requestEnvelope.request
    return (
      req.type === 'IntentRequest' &&
      req.intent.name === 'AMAZON.StopIntent'
    )
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(`Goodbye!`)
      .getResponse()
  }
}

export default StopIntentRequestHandler