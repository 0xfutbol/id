import cors from 'cors';
import express from 'express';
import claimRouter from './routes/claimRoute';
import discordRouter from './routes/discordRoute';
import jwtRouter from './routes/jwtRoute';
import pingRouter from './routes/pingRoute';
import preRouter from './routes/preRoute';
import validateRoute from './routes/validateRoute';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const authRouter = express.Router();
authRouter.use(claimRouter);
authRouter.use(jwtRouter);
authRouter.use(preRouter);
authRouter.use(validateRoute);
app.use('/auth', authRouter);

const accountRouter = express.Router();
accountRouter.use(discordRouter);
accountRouter.use(pingRouter);
app.use('/account', accountRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});