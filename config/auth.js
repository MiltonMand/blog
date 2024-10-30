const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//model de usuarios
require("../models/usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario) {
                return done(null, false, {message: 'esta conta nao existe'})
            }

            bcrypt.compare(senha, usuario.senha, (erro, botem) => {
                if(botem) {
                    return done(null, usuario)
                }
                else {
                    return done(null, false, {message: 'senha incoreta'})
                }
            })
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const usuario = await Usuario.findById(id);
            done(null, usuario);
        } catch (err) {
            done(err, null);
        }
    });
}