import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import postRoutes from './routes/postRoutes.js';
import { registerUser } from './controllers/auth.js';
import { createPost } from './controllers/posts.js';
import { verifyToken } from './middlewares/auth.js';

/** CONFIGURATIONS */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Enviroment variables configuration
dotenv.config();

//express initialization and configuration
const app = express();
app.use(express.json());

//request security configuration
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

//logger request configuration
app.use(morgan('common'));

//parse responses
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

//Cross origin resource policy configuration
app.use(cors());

//Public assets configurations
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

/**STORAGE CONFIGURATION */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/**routes */
app.post('/auth/register', upload.single('picture'), registerUser);
app.use('/posts', verifyToken, upload.single('picture'), createPost);

/**ROUTES */
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postRoutes);

/** MONGOOSE CONFIGURATION */
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on port: ${process.env.PORT}`);
    });
  });
