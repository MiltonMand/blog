if(process.env.NODE_ENV == "production") {
    module.exports = {mongoURI : "mongodb+srv://milton:123@clusterteste.sn2lk.mongodb.net/?retryWrites=true&w=majority&appName=Clusterteste"}
}else {
    module.exports = {mongoURI : "mongodb://localhost/blogapp"}
}