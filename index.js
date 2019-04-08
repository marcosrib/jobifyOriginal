const express = require('express')
const app = express()
 const port = process.env.PORT || 4000
 const path = require('path')
const sqlite = require('sqlite')
const dbConnection = sqlite.open(path.resolve(__dirname,'banco.sqlite'), Promise)
const bodyParser = require('body-parser')
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public'))
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', async (request, response)=> {
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias')
    const vagas = await db.all('select * from vagas')
     const categorias = categoriasDb.map(cat => {
         return{
             ...cat,
             vagas: vagas.filter(vaga => vaga.categoria == cat.id)
         }
     })
     //console.log(categorias);
     
    response.render('home', {
        categorias
    })
})
app.get('/vaga/:id', async(request, response)=> {
    const db = await dbConnection
   
    const vagas = await db.get('select * from vagas where id =' + request.params.id)
   console.log(vagas)
    response.render('vagas', {
    vagas
    })
})

app.get('/admin', (req,res) => {
    res.render('admin/home', {
        
    } )
})
app.get('/admin/vagas', async (req,res) => {
    const db = await dbConnection
    const vagas = await db.all('select * from vagas')
    res.render('admin/vagas', {
        vagas
    } )
})

app.get('/admin/vagas/delete/:id', async (req,res) => {
    const db = await dbConnection
 await db.run('delete from vagas where id = '+req.params.id )
  res.redirect('/admin/vagas')
})
app.get('/admin/vagas/editar/:id', async (req,res) => {
    const db = await dbConnection
 const vagas = await db.get('select * from vagas   where id = '+req.params.id )
 console.log(vagas );
 const categorias = await db.all('select * from categorias ' )
 //console.log(categorias);
 
  res.render('admin/editar-vaga',{
    vagas, categorias 
  })
})
/*
app.get('/admin/vagas/nova', async (req,res) => {
    const db = await dbConnection
// await db.send('delete from vagas where id = '+req.params.id )
 res.render('admin/nova-vaga', {
} )
})*/

app.post('/admin/vagas/nova', async (req,res) => {
    const db = await dbConnection
    const {titulo, categoria, descricao} = req.body

    await db.run(`insert into vagas(categoria, titulo, descricao) values('${categoria}','${titulo}','${descricao}')`)
 res.redirect('/admin/vagas')
})

app.post('/admin/vagas/editar/:id', async (req,res) => {
    const db = await dbConnection
    const {titulo, categoria, descricao} = req.body
console.log(descricao);

    await db.run(`update vagas set categoria='${categoria}',titulo = '${titulo}',descricao = '${descricao}' where id=`+req.params.id)
 res.redirect('/admin/vagas')
})
app.get('/admin/vagas/nova', async (req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
 res.render('admin/nova-vaga', {
     categorias
} )
})
const init = async()=> {
    const db = await dbConnection
    await db.run('create table if not exists  categorias (id INTEGER PRIMARY KEY, categoria TEXT );')
    await db.run('create table if not exists  vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT,descricao TEXT );')
    const vaga= 'Fullstack developer (remote)'
    const descricao= 'vaga para quem fez fullstack developer'
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
   // await db.run(`insert into vagas(categoria, titulo, descricao) values(1,'${vaga}','${descricao}')`)

}
init()
app.listen(port,(err)=>{
    if(err){
        console.log('não foi possivel iniciar o servidor do jobify')
    }else{
        console.log('servidor rodando');
        
    }
})
