import passport from "passport"
import { createAuthError } from "../utils/customErrors.js"

export const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err)
    if (!user) throw createAuthError('Unauthorized')
    
    req.user = user;
    next()
  })(req, res, next)
}
