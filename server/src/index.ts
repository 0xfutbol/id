import cors from 'cors';
import express from 'express';
import claimRouter from './routes/claimRoute';
import jwtRouter from './routes/jwtRoute';
import preRouter from './routes/preRoute';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const authRouter = express.Router();
authRouter.use(claimRouter);
authRouter.use(jwtRouter);
authRouter.use(preRouter);

app.use('/auth', authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});