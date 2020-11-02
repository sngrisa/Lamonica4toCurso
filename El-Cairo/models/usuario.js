var mongoose = require('mongoose');
var Reserva = require('./reserva');
var Schema = mongoose.Schema;
const Token = require('./token');
const uniqueValidator = require('mongoose-unique-validator');
let crypto = require('crypto');
const nodemailer = require('nodemailer');

const mailer = require('../mailer/mailer');


const bcrypt = require('bcrypt');
const saltRounds = 10;

const validateEmail = function (email) {
    const regExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
    return regExp.test(email);
  }

var usuarioSchema = new Schema({
    nombre: {
        type:String,
        trim:true,
        required:[true,'El nombre es obligatorio']
    },
    email:{
        type:String,
        trim:true,
        required:[true,'El email es obligatorio'],
        lowercase: true,
        unique:true,
        validate: [validateEmail, 'Por favor ingrese un email valido'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/] 
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio']
      },
      passwordResetToken: String,
      passwordResetTokenExpires: Date, 
      verificado: {
        type: Boolean,
        default: false 
      }
    });


usuarioSchema.plugin(uniqueValidator, {message: 'El {PATH} ya existe con otro usuario '});

usuarioSchema.pre('save', function(next){
    if ( this.isModified('password') ){
        this.password = bcrypt.hashSync(this.password, saltRounds);
    }
    next(); 
    });
      
usuarioSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
    }

usuarioSchema.methods.reservar = function (biciId, desde, hasta, cb){
    var reserva = new Reserva({
        usuario: this._id,
        bicicleta: biciId, 
        desde: desde, 
        hasta: hasta
    });
    reserva.save(cb);
}


usuarioSchema.methods.enviar_email_bienvenida =  function () {
    const token = new Token({ _userId: this.id, token: crypto.randomBytes(16).toString('hex') })
    const email_destination = this.email;

      token.save(function (err) {
        if (err) {
            return console.log(err.message);
        }
        return console.log("Sent  it");
    });
    
}


usuarioSchema.methods.resetPassword = (cb) =>{
    const token = new Token({_userId: this.id, token: crypto.randomBytes(16).toString('hex')});
    const email_destination = this.email;
    token.save(function(err) {
        if (err) { return cb(err); }
    
        cb(null);
    });
 
}

function sendemail(token){
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:  'delphine34@ethereal.email',
        pass:  'BkxZb9bakGFaQAgrpt'
    }
});

const mailOptions = {
    from: 'no-reply@elcairo.com',
    to: 'delphine34@ethereal.email',
    subject: 'Nodemailer - Test',
    text: 'Mensaje Enviado'
};

transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
         console.log('Error occurs',err);
    }
    console.log('Email sent!!!');
});

}


module.exports = mongoose.model('Usuario', usuarioSchema);