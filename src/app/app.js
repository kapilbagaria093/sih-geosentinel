import express from 'express'
import { authRouter } from './auth/auth.routes.js';
import landslideRouter from './landslides/landslides.routes.js';
import layerRouter from './layers/layers.routes.js';

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
    app.use('/layers', layerRouter)

    return app
}