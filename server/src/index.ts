import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import adminRoute from './routes/adminRoute';
import claimRouter from './routes/claimRoute';
import discordRouter from './routes/discordRoute';
import infoRouter from './routes/infoRoute';
import jwtRouter from './routes/jwtRoute';
import jwtTgRouter from './routes/jwtTgRoute';
import pingRouter from './routes/pingRoute';
import preRouter from './routes/preRoute';
import signRouter from './routes/signRoute';
import tonRouter from './routes/tonRoute';
import validateRoute from './routes/validateRoute';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: '*'
}));

const authRouter = express.Router();
authRouter.use(claimRouter);
authRouter.use(jwtRouter);
authRouter.use(jwtTgRouter);
authRouter.use(preRouter);
authRouter.use(signRouter);
authRouter.use(validateRoute);
app.use('/auth', authRouter);

const adminRouter = express.Router();
adminRouter.use(adminRoute);
app.use('/admin', adminRouter);

const accountRouter = express.Router();
accountRouter.use(discordRouter);
accountRouter.use(infoRouter);
accountRouter.use(pingRouter);
accountRouter.use(tonRouter);
app.use('/account', accountRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});