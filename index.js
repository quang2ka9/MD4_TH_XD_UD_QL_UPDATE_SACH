const mysql = require('mysql');
const express = require('express');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const app = express();
const PORT = 3000;


const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'book_manager',
    charset: 'utf8_general_ci',
});
connection.connect(function (err) {
    if (err) {
        throw err.stack;
    } else {
        console.log('connect database successfully')
    }
});


app.use(fileUpload({
    useTempFiles: true
}));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static('./public'))


app.get("/books", (req, res) => {
    let offset = req.query.offset || 0;
    const sql = "SELECT * FROM books limit 3 offset " + offset;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        res.render("index", {books: result});
    });
});


app.get("/books/:id/delete", (req, res) => {
    const idBook = req.params.id;
    const sql = "delete from books where id = " + idBook;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        res.redirect('/books')
    });
});


app.get('/books/create', (req, res) => {
    res.render('create')
})

app.post("/books/create", (req, res) => {
    const {name, price, status, author} = req.body;
    let images = req.files.image;
    images.mv('./public/images/' + images.name, function (err){
        if(err){
            console.log(err)
        }
    });
    const sqlInsert = 'insert into books(name, price, status, author,image) values ?'
    const value = [[name, price, status, author, images.name]];
    connection.query(sqlInsert, [value], function (err, result) {
        if (err) throw err;
        res.end('BAN DA THEM NHAN VIEN THANH CONG!');
    });
    res.redirect('/books')
});



app.get("/books/:id/update", (req, res) => {
    const idBook = req.params.id;
    const sql = "select * from books where id = " + idBook;
    connection.query(sql, (err, results) => {
        if (err) throw err;
        res.render('update', {book: results[0]});
    });
});

app.post('/books/:id/update', (req, res) => {
    const idBook = req.params.id;
    let images = req.files.image;
    images.mv('./public/images/' + images.name, function (err){
        if(err){
            console.log(err)
        }
    });
    const sql = `update books set name = ?, price = ?, author = ?, status = ?, image = ? where id = ? `;
    const {name, price, status, author} = req.body;
    const value = [name, price, author, status, images.name, idBook];
    connection.query(sql, value, (err, results) => {
        if (err) throw err;
        res.redirect('/books')
    });
});

app.listen(PORT, () => {
    console.log("Server running on port: + PORT");
});