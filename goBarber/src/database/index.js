import Sequelize from 'sequelize';

import User from '../app/models/User';
import databaseConfig from '../config/database';

const models = [User];

class Database{

  constructor(){
    this.init();
  }

  init(){
    this.connection = new Sequelize(databaseConfig);// inicializa o db com as config

    models.map( model => model.init(this.connection) );
  }
}

export default new Database();
