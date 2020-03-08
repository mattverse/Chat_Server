
var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true   
	}, function(req, email, password, done) { 
		console.log('passport의 local-login Called: ' + email + ', ' + password);
		
		var database = req.app.get('database');
	    database.UserModel.findOne({ 'email' :  email }, function(err, user) {
	    	if (err) { return done(err); }

	    	if (!user) {
	    		console.log('계정이 일치하지 않음.');
	    		return done(null, false, req.flash('loginMessage', 'Not registered.')); 
	    	}
	    	
			var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
			if (!authenticated) {
				console.log('비밀번호 일치하지 않음.');
				return done(null, false, req.flash('loginMessage', 'Wrong PW.'));  
			} 
			
			console.log('LOGIN SUCCESS.');
			return done(null, user);  
	    });

	});

