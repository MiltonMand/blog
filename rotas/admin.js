const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
require('../models/categoria')
const Categoria = mongoose.model('categorias')

require('../models/postagem')
const Postagem = mongoose.model('postagens')

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts', (req, res) => {
    res.send('pagina para postes')
})

router.get('/categorias', (req, res) => {
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    })
        .catch((error) => {
            req.flash('error_msg', "erro ao cadastrar categoria, tente novamente")
            res.redirect('/admin')
        })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res) => {
    let erros = []
    if (!req.body.nome || typeof req.body.nome == undefined || typeof req.body.nome == null || !req.body.slug || typeof req.body.slug == undefined || typeof req.body.slug == null) {
        erros.push({ text: "verifique os dados do formulario" })
    }

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    }

    else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'categoria criada com sucesso')
            res.redirect('/admin/categorias')
        })
        .catch((error) => {
            req.flash('error_msg', "erro ao cadastrar categoria, tente novamente")
            res.redirect('/admin/categorias')
        })
    }
})

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id:req.params.id }).then((categoria) => {
        res.render('admin/editcategoria', { categoria: categoria })
    })
    .catch((error) => {
        req.flash('error_msg', "esta categoria nao existe")
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({ _id:req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        req.flash('success_msg', 'categoria editada com sucesso')

        categoria.save().them(() => {
            req.flash('success_msg', 'categoria criada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((error) => {
            req.flash('error_msg', "houve um erro ao editer uma categoria")
            res.redirect('/admin/categorias')
        })

    }).catch((error) => {
        req.flash('error_msg', "houve um erro ao editer uma categoria")
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
        req.flash('success_msg', 'categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    })
    .catch((err) => {
        req.flash('error_msg', "houve um erro ao deletar uma categoria")
        res.redirect('/admin/categorias')
    });
})

router.get('/postagens', (req, res) => {
    Postagem.find().populate('categoria').sort({date: 'desc'}).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    })
    .catch((error) => {
        req.flash('error_msg', "erro ao cadastrar postagem, tente novamente")
        res.redirect('/admin')
    })
})

router.get('/postagens/add', (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    }) .catch((err) => {
        req.flash('error_msg', "houve um erro ao caregar o formulario")
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/nova', (req, res) => {
    let erros = []

    if(req.body.categoria == "0") {
        erros.push({text: 'categoria invalida'})
    }

    if(erros.lengrh > 0) {
        res.render('admin/addpostagem', { erros: erros })
    }

    else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'postagem criada com sucesso')
            res.redirect('/admin/postagens')
        })
        .catch((error) => {
            req.flash('error_msg', "erro ao cadastrar postagem, tente novamente")
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({_id: req.params.id}).then((postagem) => {

        Categoria.find().then((categorias) => {
            req.flash('success_msg', 'postagem editada com sucesso')
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        })
            .catch((error) => {
                req.flash('error_msg', "erro ao editar postagem, tente novamente")
                res.redirect('/admin/postagens')
            })
    })
    .catch((error) => {
        req.flash('error_msg', "erro ao editar postagem, tente novamente")
        res.redirect('admin/postagens')
    })
})

router.post('/postagens/edit', (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.conteudo = req.body.conteudo
        postagem.descricao = req.body.descricao
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'postagem editada com sucesso')
            res.redirect('/admin/postagens')
        })
        .catch((error) => {
            req.flash('error_msg', "erro ao editar postagem, tente novamente")
            res.redirect('/admin/postagens')
        })
    })
    .catch((error) => {
        req.flash('error_msg', "erro ao editar postagem, tente novamente")
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/deletar', (req, res) => {
    Postagem.deleteOne({ _id: req.body.id })
    .then(() => {
        req.flash('success_msg', 'postagem deletada com sucesso')
        res.redirect('/admin/postagens')
    })
    .catch((err) => {
        req.flash('error_msg', "houve um erro ao deletar uma postagem")
        res.redirect('/admin/postagens')
    });
})

module.exports = router 