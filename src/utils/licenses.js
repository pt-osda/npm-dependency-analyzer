
module.exports = getLicences

const async = require('async')
const fs = require('fs')

const objToWrite = {}

function getLicences(){
	console.log('Starting to get licenses')

	const {dependencies} = JSON.parse( fs.readFileSync('build/dependencies.txt','UTF-8') )
	const keyQuantity = Object.keys(dependencies).length
	let count = 0
	async.forEachOf(dependencies, (value) => {
		objToWrite[value.name] = value.license
		if(++count == keyQuantity){
			writeFile('licenses.txt', JSON.stringify(objToWrite) )
			console.log('Licenses checked with success')
		}
	}, (error) => {
		console.log(`License check failed: \n\t ${error}`)
	})
}

function writeFile(fileName, data){
	const fileDescriptor = fs.openSync('build/'+fileName, 'w')
	fs.writeFileSync(fileDescriptor, data, 'utf-8')
	fs.closeSync(fileDescriptor)
}