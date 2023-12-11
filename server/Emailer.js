import "dotenv/config"
import { createTransport } from "nodemailer"

const transporter = createTransport({
    service:"gmail",
    auth:{
        user:process.env.AUTH_USER,
        pass:process.env.AUTH_PASSWORD //google account less secure app password
    }
})


export default transporter
