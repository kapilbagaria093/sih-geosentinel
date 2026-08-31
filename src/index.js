import { createServer } from 'node:http'
import { createExpressApplication } from './app/app.js' 
import 'dotenv/config'
import { sendOtp } from './app/sms-handler/otp.js';

async function main(){
    try {
        // createExpressApplication() is a handler. means, i have a http server, and i want express to handle routes.
        const server = createServer(createExpressApplication())
        const PORT = process.env.PORT || 8080;

        server.listen(PORT, ()=>{
            console.log(`http server is running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.log(`error starting http server`)
        throw error
    }
}

main()