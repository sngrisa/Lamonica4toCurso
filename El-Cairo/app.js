const createError = require('http-errors');
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('./config/passport');
const session = require('express-session')
const jwt = require ('jsonwebtoken')

const Usuario = require('./models/usuario');

const indexRouter = require('./routes/index');
const usuariosRouter = require('./routes/usuarios');
const bicicletasRouter = require('./routes/bicicletas');
const bicicletasAPIRouter = require('./routes/api/bicicletasapi');
const usuariosAPIRouter = require('./routes/api/usuariosapi');
const tokenRouter = require('./routes/token');
const authAPIRouter = require('./routes/api/auth');


app.use('/bicicletas', bicicletasRouter);
app.use('/api/bicicletas',validarUsuario, bicicletasAPIRouter);
app.use('/api/usuarios', usuariosAPIRouter);

app.use('/', indexRouter);
app.use('/usuarios', usuariosRouter);
app.use('/token', tokenRouter);
app.use('/bicicletas',loggedIn, bicicletasAPIRouter);
app.use('/api/bicicletas',validarUsuario, bicicletasAPIRouter);
app.use('/api/auth', authAPIRouter);
app.set('secretKey', 'jwt_pwd_!!223344')



const mongoose = require('mongoose');
const mongoDB = process.env.MONGO_URI || 'mongodb://localhost/bicicletas';
mongoose.connect(mongoDB, {
  useCreateIndex: true,
  useUnifiedTopology:true,
  useNewUrlParser: true
});

mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexion en base de datos'));


const store = new session.MemoryStore;

app.use(session({
  cookie: {maxAge: 240 * 60 * 60 * 1000},
  store: store,
  saveUninitialized: true,
  resave: 'true',
  secret: 'el_cairo_!!!%&/&____234234'
}))

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize())
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res)=>{
  res.render('session/login')
})

app.post('/login', (req, res, next) =>{
  var usuario = req.body;
  passport.authenticate('local', (err, usuario, info)=> {  
    if (err) return next(err);
    if (!usuario) return res.render('session/login', {info});
    req.logIn(usuario, function (err) {  
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

app.get('/logout', (req, res)=>{
  req.logOut() 
  res.redirect('/')
})

app.get('/forgotPassword', function(req,res) {
  res.render('session/forgotPassword');
});

app.post('/forgotPassword', function(req,res) {
  Usuario.findOne({ email: req.body.email }, function(err, usuario) {
    if (!usuario) return res.render('session/forgotPassword', { info: { message: 'No existe el email para un usuario existente' } });
    
    usuario.resetPassword(function(err) {
      if (err) return next(err);
      console.log('session/forgotPasswordMessage');
    });
    
    res.render('session/forgotPasswordMessage');
  });
});

app.get('/resetPassword/:token', function(req, res, next) {
  console.log(req.params.token);
  token.findOne({ token: req.params.token }, function(err, token) {
    if(!token) return res.status(400).send({ msg: 'No existe un usuario asociado al token, verifique que su token no haya expirado' });
    Usuario.findById(token._userId, function(err, usuario) {
      if(!usuario) return res.status(400).send({ msg: 'No existe un usuario asociado al token.' });
      res.render('session/resetPassword', {errors: { }, usuario: usuario});
    });
  });
});

app.post('/resetPassword', function(req, res) {
  if(req.body.password != req.body.confirm_password) {
    res.render('session/resetPassword', {errors: {confirm_password: {message: 'No coincide con el password ingresado'}}, usuario: new Usuario({email: req.body.email})});
    return;
  }
  Usuario.findOne({email: req.body.email}, function(err, usuario) {
    usuario.password = req.body.password;
    usuario.save(function(err) {
      if(err) {
        res.render('session/resetPassword', {errors: err.errors, usuario: new Usuario({email: req.body.email})});
      } else {
        res.redirect('/login');
      }
    });
  });
});

function loggedIn(req, res, next) {
  if(req.user) {
    next();
  } else {
    console.log('User sin loguearse');
    res.redirect('/login');
  }
};

function validarUsuario(req, res, next) {
  jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
    if (err) {
      console.log('Error en validar Usuario');
      res.json({ status: "error", message: err.message, data: null });
    } else {
      console.log('Pasó el usuario: ' + req.body.userId);
      req.body.userId = decoded.id;
      console.log('JWT verify: ' + decoded);
      next();
    }
  });
};

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;