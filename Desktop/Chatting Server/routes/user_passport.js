
module.exports = function(router, passport) {
    console.log('user_passport Called.');

    router.route('/').get(function(req, res) {
        console.log('/ Path.');

        console.log('req.users info');
        console.dir(req.user);

        if (!req.user) {
            console.log('Not Authorized.');
            res.render('index.ejs', {login_success:false});
        } else {
            console.log('Logged in');
            res.render('index.ejs', {login_success:true});
        }
    });
    
    router.route('/login').get(function(req, res) {
        console.log('/login Path requested.');
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });
	 
    router.route('/signup').get(function(req, res) {
        console.log('/signup Path requested.');
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });
	 
    router.route('/profile').get(function(req, res) {
        console.log('/profile Path requested.');

        console.log('req.user requsted');
        console.dir(req.user);

        if (!req.user) {
            console.log('Not authorized.');
            res.redirect('/');
        } else {
            console.log('authorized');
            console.log('/profile path requested.');
            console.dir(req.user);

            if (Array.isArray(req.user)) {
                res.render('profile.ejs', {user: req.user[0]._doc});
            } else {
                res.render('profile.ejs', {user: req.user});
            }
        }
    });
	
    router.route('/logout').get(function(req, res) {
        console.log('/logout Path requested');
        req.logout();
        res.redirect('/');
    });


    router.route('/login').post(passport.authenticate('local-login', {
        successRedirect : '/profile', 
        failureRedirect : '/login', 
        failureFlash : true 
    }));

    router.route('/signup').post(passport.authenticate('local-signup', {
        successRedirect : '/profile', 
        failureRedirect : '/signup', 
        failureFlash : true 
    }));


};