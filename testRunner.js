const fs = require('fs')
const { resolve } = require('path')
const { spawn } = require('child_process')
const https = require('https')
const { dialog } = require('electron').remote
const os = require('os');

// FRAMEWORK BEGIN

let log = []
let currentStep = 0

runSequence = () => {
    console.log('test :: Run Sequence')
    config.steps[0].step()
}

downloadLog = () => {
    var path = dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    fs.writeFile(path+'/log.json', JSON.stringify(log), 'utf8', () => {
        console.log('test :: Download Log')
    })
}

stepValidator = (data = {}) => {
    updateLog(createEvent(data))
    if(currentStep < config.steps.length){
        nextStep()
    }
}

createEvent = (data) => {
    return config.steps[currentStep].event(data)
}

nextStep = () => {
    currentStep++
    if(currentStep < config.steps.length){
        config.steps[currentStep].step()
    }else{
        endSequence()
    }
}

endSequence = () => {
    document.getElementById("download").disabled = false
    console.log('test :: End Sequence', log)
}

updateLog = (data) => {
    log.push(data)
}

getTimeStamp = () => {
    return Date.now()
}

getUserName = () => {
    return process.env.USER
}

getIpAddress = () => {
    var interfaces = os.networkInterfaces()
    var addresses = []
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2]
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address)
            }
        }
    }
    return addresses[0]
}

getProcessID = (_process = process) => {
    return _process.pid
}

getProcessName = (_process = process) => {
    if(_process.execPath){
        return _process.execPath
    }
    // ChildProcess
    if(_process.spawnfile){
        return _process.spawnfile
    }
    return ''
}

getProcessCommandLine = (_process = process) => {
    if(_process.argv){
        return _process.argv.reduce((string, arg) => `${string}${arg}`)
    }
    // ChildProcess
    if(_process.spawnargs){
        return _process.spawnargs.reduce((string, arg) => `${string}${arg}`)
    }
    return ''
}

// FRAMEWORK END

/********************************/

// EDR tests

startProcess = () => {
    const hello = spawn('./hello.bin')
    hello.stdout.on('data', (data) => {
        //console.log(`stdout: ${data}`)
    })
    
    hello.stderr.on('data', (data) => {
        //console.log(`stderr: ${data}`)
    })
    
    hello.on('close', (code) => {
        //console.log(`hello exited with code ${code}`)
        stepValidator({process: hello})
    })
}

createFile = () => {
    fs.writeFile(resolve(config.file.location), config.file.data, (err) => {
        if (err) console.log(`createFile failure ${err}`)
        //console.log(`createFile success ${resolve(config.file.location)}`)
        stepValidator({path: resolve(config.file.location), activity: 'create'})
    })
}

modifyFile = () => {
    fs.writeFile(resolve(config.file.location), config.file.modified, (err) => {
        if (err) console.log(`modifyFile failure ${err}`)
        //console.log(`modifyFile success ${resolve(config.file.location)}`)
        stepValidator({path: resolve(config.file.location), activity: 'modify'})
    })
}

deleteFile = () => {
    fs.unlink(resolve(config.file.location), (err) => {
        if (err) console.log(`deleteFile failure ${err}`)
        //console.log(`deleteFile success ${resolve(config.file.location)}`)
        stepValidator({path: resolve(config.file.location), activity: 'delete'})
    })
}

useNetwork = () => {
    https.get(config.network.url, (resp) => {
    //let data = ''

    resp.on('data', (chunk) => {
        //data += chunk
    })

    resp.on('end', () => {
        stepValidator({destinationAddressPort: `${resp.client._httpMessage.agent.protocol}//${resp.client._httpMessage.connection.servername}:${resp.client._httpMessage.agent.defaultPort}`,
                        sourceAddressPort: getIpAddress(),
                        sentDataSize: resp.client._httpMessage.connection.bytesRead+resp.client._httpMessage.connection.bytesWritten,
                        protocol: resp.client._httpMessage.agent.protocol})
    })

    }).on('error', (err) => {
        //console.log('Error: ' + err.message)
    })
}

createFileEvent = (data = {}) => {
    // If a prcess gets passed in - use that.  Otherwise use the main process
    const process = data.process ? data.process : window.process
    return {
        name: 'FileEvent',
        timeStamp: getTimeStamp(),
        fullPath: data.path,
        activity: data.activity,
        userName: getUserName(),
        process: {
            name: getProcessName(process),
            id: getProcessID(process),
            commandLine: getProcessCommandLine(process)
        }
    }
}

createProcessEvent = (data = {}) => {
    // If a prcess gets passed in - use that.  Otherwise use the main process
    const process = data.process ? data.process : process
    return {
        name: 'ProcessEvent',
        timeStamp: getTimeStamp(),
        userName: getUserName(),
        process: {
            name: getProcessName(process),
            id: getProcessID(process),
            commandLine: getProcessCommandLine(process)
        }
    }
}

createNetworkEvent = (data = {}) => {
    return {
        name: 'NetworkEvent',
        timeStamp: getTimeStamp(),
        userName: getUserName(),
        destinationAddressPort: data.destinationAddressPort,
        sourceAddressPort: data.sourceAddressPort,
        sentDataSize: data.sentDataSize,
        protocol: data.protocol,
        process: {
            name: getProcessName(process),
            id: getProcessID(process),
            commandLine: getProcessCommandLine(process)
        }
    }
}

/**
 * config Object
 * 
 */
const config = {
    steps: [ 
        {step: startProcess, event: createProcessEvent}, 
        {step: createFile, event: createFileEvent},
        {step: modifyFile, event: createFileEvent},
        {step: deleteFile, event: createFileEvent}, 
        {step: useNetwork, event: createNetworkEvent}],
    file: {
        location: 'test.txt',
        data: 'This is test data.',
        modified: 'This is modified test data.'
    },
    network: {
        url: 'https://api.exchangeratesapi.io/latest?base=USD'
    }
}