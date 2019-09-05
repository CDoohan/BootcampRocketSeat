import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import authConfig from '../../config/auth';
import User from '../models/User';

class SessionController{
  async store(req, res){

    const schema = Yup.object().shape({
      email: Yup.string().required(),
      password: Yup.string().required()
    })

    if(!( await schema.isValid(req.body))){
      return res.status(400).json({ error: 'Validation is invalid' })
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if(!user){
      return res.status(400).json({ error: 'User not found' })
    }

    if(!(await user.checkPassword(password))){
      return res.status(400).json({ error: 'Password incorret' })
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn
      })
    })

  }
}

export default new SessionController();
