var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true    
	}, function(req, email, password, done) {
        var paramName = req.body.name || req.query.name;
	 
		    process.nextTick(function() {
	    	var database = req.app.get('database');
		    database.UserModel.findOne({ 'email' :  email }, function(err, user) {
		        if (err) {
		            return done(err);
		        }
		        
		        if (user) {
		        	console.log('Already registered.');
		            return done(null, false, req.flash('signupMessage', 'Already registered.'));  
		        } else {
		        	var user = new database.UserModel({'email':email, 'password':password, 'name':paramName});
		        	user.save(function(err) {
		        		if (err) {
		        			throw err;
		        		}
		        		
		        	    console.log("Added User info");
		        	    return done(null, user);  
		        	});
		        }
		    });    
	    });

	});
