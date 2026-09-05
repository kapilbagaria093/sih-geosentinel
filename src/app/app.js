import express from 'express'
import { authRouter } from './auth/routes.js';
import landslideRouter from './landslides/routes.js';

export function createExpressApplication() {
    const app = express();

    // middlewares
    app.use(express.json())

    // routes
    app.get('/', (req, res) => {
        return res.json({message: 'welcome to life...'})
    })

    app.use('/auth', authRouter);
    app.use('/landslides', landslideRouter)

    return app
}