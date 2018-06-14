let express = require('express')
let app = express()
const PORT = 8888

app.get('/', function (req, res) {
  res.redirect('index.html')
})

app.configure(function () {
  app.use(express.methodOverride())
  app.use(express.bodyParser())
  app.use(express.static(__dirname))
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }))
  app.use(app.router)
})

app.listen(PORT)

console.log(`Server started at localhost:${PORT}`)
