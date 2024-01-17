const express = require('express');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const authRouter = require('./router/auth-routs');
const postRouter = require('./router/post-routs');
const commentRouter = require('./router/comment-routs');
const categoriesRouter = require('./router/categories-routs');
const userRouter = require('./router/user-routs')
const errorMiddleware = require('./middlewares/errorMiddleware');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  message: 'Request limit exceeded. Please try again later.',
});

const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
  };

app.use(limiter);
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(cors(corsOptions));
app.use('/userFiles', express.static(path.join(__dirname, 'userFiles')));
app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/categories', categoriesRouter);
app.use(errorMiddleware);


app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}/`);
});