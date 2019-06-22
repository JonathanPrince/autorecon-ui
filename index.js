const express = require('express')
const app = express()
const port = 1337
const fs = require('fs')
const util = require('util')
const path = require('path')
const asyncHandler = (fn) => {
  return (req, res, next) => {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next)
  }
}

const readDir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)

const listMachines = async (req, res, cb) => {
  const dirList = await readDir(process.cwd())
  const listItems = dirList.map(directory => `<li><a href="./${directory}/">${directory}</a></li>`).join('')

  res.send(`<ul>${listItems}</ul>`)
}

const showScans = async (req, res, cb) => {
  const cwd = process.cwd()
  const dirPath = path.join(cwd, req.params.ip, 'scans')
  const dirList = await readDir(dirPath)
  const htmlArray = await Promise.all(dirList.map(async filename => {
    const heading = `<h2>${filename}</h2>`
    const text = await readFile(path.join(dirPath, filename))

    return `<div>${heading}<pre>${text}</pre></div>`
  }))

  res.send(htmlArray.join(''))
}

app.get('/', asyncHandler(listMachines))
app.get('/:ip', asyncHandler(showScans))

app.listen(port, () => console.log(`listening on port: ${port}`))
