const app = require('./src/app')
const sequelize = require('./src/config/database')


sequelize.sync()
app.listen(5000, () => {
    console.log(`running application at 5000`);
  });