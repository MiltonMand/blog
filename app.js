//caregando modulos
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require("body-parser")
const app = express()
const admin = require('./rotas/admin')
const path = require('path')
const mongoose = require("mongoose")
const session = require('express-session')
const flash = require('connect-flash');
const router = require('./rotas/admin');
const usuarios = require('./rotas/usuario')
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')

require('./models/postagem')
const Postagem = mongoose.model('postagens')
require('./models/categoria')
const Categoria = mongoose.model('categorias')

//configuracoes
//body-parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.set('view engine', 'handlebars');

//mongoose
mongoose.Promise = global.Promise

mongoose.connect(db.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

//public
app.use(express.static(path.join(__dirname, "public")))

//sessao
app.use(session({
  secret: 'cursodenode',
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

//rotas
app.use('/admin', admin)
app.use('/usuarios', usuarios)

app.get('/', (req, res) => {
  Postagem.find().populate('categoria').sort({ date: 'desc' }).then((postagens) => {
    res.render('index', { postagens: postagens })
  })
    .catch((err) => {
      req.flash('error_msg', "houve um erro")
      res.redirect('/404')
    })
})

app.get('/postagem/:slug', (req, res) => {
  Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
    if (postagem) {
      res.render('postagem/index', { postagem: postagem })
    }
    else {
      req.flash('error_msg', "esta postagem nao exeste")
      res.redirect('/')
    }
  })
    .catch((err) => {
      req.flash('error_msg', "erro interno")
      res.redirect('/')
    })
})

router.get('/404', (req, res) => {
  res.send('erro 404')
})

app.get('/categorias', (req, res) => {
  Categoria.find().sort({ date: 'desc' }).then((categorias) => {
    res.render('categorias/index', { categorias: categorias })
  })
    .catch((err) => {
      req.flash('error_msg', "houve um erro")
      res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
  Categoria.findOne({ slug: req.params.slug }).sort({ date: 'desc' }).then((categoria) => {
    if (categoria) {
      Postagem.find({ categoria: categoria._id }).then((postagens) => {
        res.render('categorias/postagens', { postagens: postagens, categoria: categoria })
      })
        .catch((err) => {
          req.flash('error_msg', "houve um erro")
          res.redirect('/')
        })
    }
    else {
      req.flash('error_msg', "esta categoria nao exeste")
      res.redirect('/')
    }
  })
    .catch((err) => {
      req.flash('error_msg', "houve um erro")
      res.redirect('/')
    })
})

//outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});