const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash=require('connect-flash');
const session=require('express-session');
const mongoose = require('mongoose');
const passport=require('passport');
const path=require('path');
const app = express();
const port = process.env.PORT || 5000;

//Passport config
require('./config/passport')(passport);

//mongodb connection
mongoose.Promise = global.Promise; //Map gloabal promise
mongoose.connect('mongodb://localhost:27017/natsu-app', {
    useNewUrlParser: true
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => console.log(err));

//handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//body-parser middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//method-override middlesware
app.use(methodOverride('_method'));

//Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

//passport init
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash())

//Global Variavble
app.use((req,res,next)=>{
    res.locals.success_msg=req.flash('success_msg');
    res.locals.error_msg=req.flash('error_msg');
    res.locals.error=req.flash('error');
    res.locals.user=req.user || null;
    next();
});

//Public Directory
app.use(express.static(path.join(__dirname,'public')));
//Load Routes
app.use('/ideas',require('./routes/ideas'));
app.use('/users',require('./routes/users'));


//Routes
app.get('/', (req, res) => {
    const title = "Welcome to Natsu"
    res.render('index', {
        title: title
    });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('*',(req,res)=>{
    res.send('Page not found');
})

app.listen(port, () => {
    console.log(`Server Started Successfully on port ${port}`);
});