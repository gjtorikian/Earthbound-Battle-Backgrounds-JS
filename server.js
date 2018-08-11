let express = require('express')
let app = express()
let path = require('path')
const PORT = 8888

app.use('/assets', express.static(path.join(__dirname, '/assets')))
app.use('/dist', express.static(path.join(__dirname, '/dist')))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT)

console.log(`Server started at localhost:${PORT}`)
