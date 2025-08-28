import { Strategy, ExtractJwt } from 'passport-jwt'
import prisma from '../utils/prisma.js'

const opts = { 
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

const jwtStrategy = new Strategy(opts, async (jwtPayload, done) => {
  try {
    console.log(jwtPayload)
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
    return (err, false)
  }
})

export default jwtStrategy
