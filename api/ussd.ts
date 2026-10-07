import type { VercelRequest, VercelResponse } from '@vercel/node'
import { africastalkingUssd, ussdFieldsFrom } from '../server/ussd.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.status(200).send('Ubuzima Bwiza Africa\'s Talking USSD callback. POST sessionId, serviceCode, phoneNumber and text.')
    return
  }
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.status(405).send('END Method not allowed')
    return
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  try {
    res.status(200).send(await africastalkingUssd(ussdFieldsFrom(req.body)))
  } catch (error) {
    console.error(error)
    res.status(200).send('END USSD menu is unavailable right now.')
  }
}
