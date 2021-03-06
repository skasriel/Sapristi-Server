var request = require('superagent') 
  , assert = require('assert')
  , should = require('should');

var localURL = 'http://localhost:5000';
var stageURL = 'https://blooming-mountain-4885.herokuapp.com';

var baseURL = localURL; //stageURL;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var agent1 = request.agent();


describe('Set up Kate Bell', function() {
  it('Register Kate Bell', function(done) {
    var username = "+15555648583";
    agent1
      .post(baseURL+'/api/auth/register')
      .send({ username: username, password: 'kate' })
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        should.exist(res.headers['set-cookie']);
        done();
      });
  });
  it('Confirm Kate Bell', function(done) {
    agent1
      .post(baseURL+'/api/auth/confirmation-code')
      .send({confirmationCode: "123"})
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        done();
      });
  });


  it('Update Kate Bell availability', function(done) {
    var params = "availability=BUSY";
    agent1.post(baseURL+'/api/me/availability')
    .send(params)
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      done();
    })
  });

  it('Verifying Kate availability', function(done) {
    agent1.get(baseURL+'/api/me/availability')
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      res.text.should.include('BUSY');
      done();
    })
  });

  it('Update Kate Bell availability', function(done) {
    var params = "availability=UNKNOWN";
    agent1.post(baseURL+'/api/me/availability')
    .send(params)
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      done();
    })
  });

  it('Verifying Kate availability', function(done) {
    agent1.get(baseURL+'/api/me/availability')
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      res.text.should.include('UNKNOWN');
      done();
    })
  });

    it('Update Kate Bell availability', function(done) {
    var params = "availability=AVAILABLE";
    agent1.post(baseURL+'/api/me/availability')
    .send(params)
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      done();
    })
  });

  it('Verifying Kate availability', function(done) {
    agent1.get(baseURL+'/api/me/availability')
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      res.text.should.include('AVAILABLE');
      done();
    })
  });


  it('Log out Kate Bell', function(done) {
    agent1.get(baseURL+'/api/auth/logout')
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      setTimeout(function(){done()}, 300);
    })
  });
});


describe('Set up Daniel Higgins Jr.', function() {
  it('Register Daniel Higgins Jr.', function(done) {
    var username = "+15554787672";
    agent1
      .post(baseURL+'/api/auth/register')
      .send({ username: username, password: 'daniel' })
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        should.exist(res.headers['set-cookie']);
        done();
      });
  });
  it('Confirm Daniel Higgins Jr.', function(done) {
    agent1
      .post(baseURL+'/api/auth/confirmation-code')
      .send({confirmationCode: "123"})
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        done();
      });
  });

  it('Update Daniel Higgins Jr. availability', function(done) {
    var params = "availability=BUSY";
    agent1.post(baseURL+'/api/me/availability')
    .send(params)
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      done();
    })
  });

  it('Log out Daniel', function(done) {
    agent1.get(baseURL+'/api/auth/logout')
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      setTimeout(function(){done()}, 300);
    })
  });
});


describe('registration', function() {
  it('Register a new user', function(done) {
    var username = "("+getRandomInt(100,600)+") " + getRandomInt(0,999) + "-" + getRandomInt(0, 9999);
    agent1
      .post(baseURL+'/api/auth/register')
      .send({ username: username, password: 'foobar' })
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        should.exist(res.headers['set-cookie']);
        done();
      });
  });

  it('Confirm mobile number', function(done) {
    agent1
      .post(baseURL+'/api/auth/confirmation-code')
      .send({confirmationCode: "123"})
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        done();
      });
  });

  it('Post users contact book', function(done) {
    var json='[{"phoneNumbers":["(555) 564-8583","(415) 555-3695"],"emailAddresses":["kate-bell@mac.com","www.icloud.com"],"displayName":"Kate Bell"},{"phoneNumbers":["555-478-7672","(408) 555-5270","(408) 555-3514"],"emailAddresses":["d-higgins@mac.com"],"displayName":"Daniel Higgins Jr."},{"phoneNumbers":["888-555-5512","888-555-1212"],"emailAddresses":["John-Appleseed@mac.com"],"displayName":"John Appleseed"},{"phoneNumbers":["555-522-8243"],"emailAddresses":["anna-haro@mac.com"],"displayName":"Anna Haro"},{"phoneNumbers":["(555) 766-4823","(707) 555-1854"],"emailAddresses":["hank-zakroff@mac.com"],"displayName":"Hank M. Zakroff"},{"phoneNumbers":["555-610-6679"],"emailAddresses":[],"displayName":"David Taylor"}]';
    agent1
      .post(baseURL+'/api/me/contacts')
      .send({json: json})
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        //res.text.should.include('dashboard');
        done();
      });
  });
});

describe('availability', function() {

  it('Update availability', function(done) {
    var params = "availability=BUSY";
    agent1.post(baseURL+'/api/me/availability')
    .send(params)
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      done();
    })
  });

  it('Get contacts availabilities', function(done) {
    agent1.get(baseURL+'/api/me/friend-availability')
    .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      var list = res.body;
      assert(list.length == 2, "Server should return two values");
      for (var i=0; i<list.length; i++) {
        if (list[i].username=='+15555648583')
          assert(list[i].availability=='AVAILABLE', "Kate should be available");
        else if (list[i].username=='+15554787672')
          assert(list[i].availability=='BUSY', "Daniel should be busy");
        else
          assert(false, "Server returned an invalid contact");
      }
      done();
    })
  });
});

describe('settings', function() {
  it('Update timeslots', function(done) {
    //var params='date[0][0]=07:30 AM&date[0][1]=11:45 AM&date[0][2]=02:15 PM&date[0][3]=11:30 PM&date[1][0]=10:00 AM&date[1][1]=12:30 PM&date[1][2]=03:30 PM&date[1][3]=11:00 PM';
    var json='[{"source":"USER_TIMESLOTS","recurrence":"12345","endTime":"2000-01-01T19:45:00.000Z","availability":"AVAILABLE","startTime":"2000-01-01T16:45:00.000Z"},{"source":"USER_TIMESLOTS","recurrence":"12345","endTime":"2000-01-02T05:00:00.000Z","availability":"AVAILABLE","startTime":"2000-01-01T22:15:00.000Z"},{"source":"USER_TIMESLOTS","recurrence":"60","endTime":"2000-01-01T20:30:00.000Z","availability":"AVAILABLE","startTime":"2000-01-01T18:00:00.000Z"},{"source":"USER_TIMESLOTS","recurrence":"60","endTime":"2000-01-02T07:00:00.000Z","availability":"AVAILABLE","startTime":"2000-01-01T23:30:00.000Z"}]';
    agent1
      .post(baseURL+'/api/settings/timeslots')
      .send({json: json})
      .end(function(err, res) {
      should.not.exist(err);
      res.should.have.status(200);
      done();
    });
  });
});

