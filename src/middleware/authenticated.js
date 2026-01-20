import passport from "passport"
import { createError } from "../utils/customErrors.js"

export const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err)
    if (!user) return next(createError('AUTH_ERROR', 'Unauthorized', 401));
    
    req.user = user;
    next()
  })(req, res, next)
}
