const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
    let erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({test: 'nome invalido'})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({test: 'email invalido'})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({test: 'senha invalido'})
    }

    if(req.body.senha != req.body.senha2) {
        erros.push({test: 'as senhas sao diferentes, tente novamente'})
    }

    if(erros.length > 0) {
       res.render('usuarios/registro', {erros: erros}) 
    }

    else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario) {
            req.flash('error_msg', "ja tem uma conta com esse email")
            res.redirect('/usuarios/registro')
            }
            else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro) {
                            req.flash('error_msg', "erro durante o salvamento do usuario")
                            res.redirect('/') 
                        }
                        
                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', "usuario criado com sucesso")
                            res.redirect('/') 
                        }).catch((err) => {
                            req.flash('error_msg', "erro durante o salvamento do usuario")
                            res.redirect('/usuarios/registro') 
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', "erro interno")
            res.redirect('/')
        })
    }
})

router.get("/login", (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})
module.exports = router