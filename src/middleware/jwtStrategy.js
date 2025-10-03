import { Strategy, ExtractJwt } from 'passport-jwt'
import prisma from '../utils/prisma.js'

const cookieExtractor = req => {
  if (req && req.cookies) {
    return req.cookies['Authorization']
  }
}

const opts = { 
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: process.env.JWT_SECRET
}


const jwtStrategy = new Strategy(opts, async (jwtPayload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: jwtPayload.id
      }
    })

    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  } catch (err) {
    return done(err, false)
  }
})

export default jwtStrategy
