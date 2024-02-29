const verifyLogin = (req, res, next) => {
    console.log("User session: ", req.session.loggedIn);
    if(req.session.loggedIn){
        next();
    }else{
        res.redirect('/login');
    }
};

module.exports = verifyLogin;