import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if(!authHeader){
    return res.status(401).json({ error: 'Token does not provided!'})
  }

  // Desestruturação de array ignorando o primeiro elemento
  const [, token] = authHeader.split(' ');

  try{
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;

    return next();
  }catch(err){
    return res.status(401).json({ error: 'Token Invalid!' })
  }

  console.log(authHeader);

  return next();
}
