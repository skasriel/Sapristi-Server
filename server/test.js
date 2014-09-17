var Sequelize = require('sequelize')
  , sequelize = new Sequelize('sapristi', 'sapristi', 'password', {
      dialect: 'postgres',
      port:   5432
    })

sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Connection has been established successfully.')
    }
  })

var User = sequelize.define('User', {
  username: Sequelize.STRING,
  password: Sequelize.STRING
})

sequelize
  .sync({ force: true })
  .complete(function(err) {
     if (!!err) {
       console.log('An error occurred while creating the table:', err)
       call2();
     } else {
       console.log('It worked!')
     }
  })

function call2() {
  var user = User.build({
    username: 'john-doe',
    password: ('i-am-so-great')
  })
  user
    .save()
    .complete(function(err) {
      if (!!err) {
        console.log('The instance has not been saved:', err)
        call3();
      } else {
        console.log('We have a persisted instance now')
      }
    })
}

function call3() {
  User
    .find({ where: { username: 'john-doe' } })
    .complete(function(err, johnDoe) {
      if (!!err) {
        console.log('An error occurred while searching for John:', err)
      } else if (!johnDoe) {
        console.log('No user with the username "john-doe" has been found.')
      } else {
        console.log('Hello ' + johnDoe.username + '!')
        console.log('All attributes of john:', johnDoe.values)
      }
    })
}


var Pub = Sequelize.define('Pub', {
  name: { type: Sequelize.STRING },
  address: { type: Sequelize.STRING },
  latitude: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: null,
    validate: { min: -90, max: 90 }
  },
  longitude: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: null,
    validate: { min: -180, max: 180 }
  },
}, {
  validate: {
    bothCoordsOrNone: function() {
      if ((this.latitude === null) === (this.longitude === null)) {
        throw new Error('Require either both latitude and longitude or neither')
      }
    }
  }
})
