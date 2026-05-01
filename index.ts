import express from "express";
import routes from "./src/routes/routes.js";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
dotenv.config();

const PORT = process.env.PORT;
const allowedOrigins = process.env.FRONTEND_URL;

app.use(cors({
    origin(origin, callback) {
        //Revisa si hay valor Origin en el header y lo compara con los permitidos
        if(!origin || allowedOrigins?.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("No permitido por CORS"));
    }
}))
app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
});
