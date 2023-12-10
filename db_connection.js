const { DataSource } = require('typeorm');
const path = require('path');
const fs = require('fs');

const AppDataSource  = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'usof',
  synchronize: true,
  entities: fs.readdirSync(path.join(__dirname, 'models')).filter(file => file.endsWith('.js')).map(file => require(path.join(__dirname, 'models', file))),
  logging: true,
});

AppDataSource.initialize()
    .then(() => {
      console.log('Connected to the database')
    })
    .catch((error) => console.log(error));
module.exports = AppDataSource;