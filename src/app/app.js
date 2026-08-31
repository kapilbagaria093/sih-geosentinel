import express from 'express'

export function createExpressApplication() {
    const app = express();

    // middlewares
    app.use(express.json())

    // routes
    app.get('/', (req, res) => {
        return res.json({message: 'welcome to life...'})
    })

    return app
}