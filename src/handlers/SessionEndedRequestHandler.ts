import { RequestHandler } from 'ask-sdk-core'

const SessionEndedRequestHandler: RequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    console.log('Session ended')
    return handlerInput.responseBuilder.getResponse()
  }
}

export default SessionEndedRequestHandler