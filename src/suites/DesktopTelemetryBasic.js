import { exec } from 'child_process';
import { writeFile, unlink } from 'fs';
import { resolve } from 'path';
import { get } from 'https';
import Utils from '../utils/Utils'

class DesktopTelemetryBasic {

    getConfig = () => {
        return {
            steps: [
                { step: this.startProcess, event: this.createProcessEvent },
                { step: this.createFile, event: this.createFileEvent },
                { step: this.modifyFile, event: this.createFileEvent },
                { step: this.deleteFile, event: this.createFileEvent },
                { step: this.useNetwork, event: this.createNetworkEvent }],
            file: {
                location: 'test.txt',
                data: 'This is test data.',
                modified: 'This is modified test data.'
            },
            network: {
                url: 'https://api.exchangeratesapi.io/latest?base=USD'
            }
        }
    }

    startProcess = (stepValidator) => {
        const hello = exec('./hello.sh')
        hello.stdout.on('data', (data) => {})
        hello.stderr.on('data', (data) => {})
        hello.on('close', (code) => {
            stepValidator(this.createProcessEvent({ 
                process: hello 
            }))
        })
    }

    createFile = (stepValidator) => {
        writeFile(resolve(this.getConfig().file.location), this.getConfig().file.data, (err) => {
            if (err) console.log(`createFile failure ${err}`)
            stepValidator(this.createFileEvent({ 
                path: resolve(this.getConfig().file.location), 
                activity: 'create' 
            }))
        })
    }

    modifyFile = (stepValidator) => {
        writeFile(resolve(this.getConfig().file.location), this.getConfig().file.modified, (err) => {
            if (err) console.log(`modifyFile failure ${err}`)
            stepValidator(this.createFileEvent({ 
                path: resolve(this.getConfig().file.location), 
                activity: 'modify' 
            }))
        })
    }

    deleteFile = (stepValidator) => {
        unlink(resolve(this.getConfig().file.location), (err) => {
            if (err) console.log(`deleteFile failure ${err}`)
            stepValidator(this.createFileEvent({ 
                path: resolve(this.getConfig().file.location), 
                activity: 'delete' 
            }))
        })
    }

    useNetwork = (stepValidator) => {
        get(this.getConfig().network.url, (resp) => {
            resp.on('data', (chunk) => {})
            resp.on('end', () => {
                stepValidator({
                    destinationAddressPort: `${resp.client._httpMessage.agent.protocol}//${resp.client._httpMessage.connection.servername}:${resp.client._httpMessage.agent.defaultPort}`,
                    sourceAddressPort: Utils.getIpAddress(),
                    sentDataSize: resp.client._httpMessage.connection.bytesRead + resp.client._httpMessage.connection.bytesWritten,
                    protocol: resp.client._httpMessage.agent.protocol
                })
            })

        }).on('error', (err) => {})
    }

    createFileEvent = (data = {}) => {
        // If a process gets passed in - use that.  Otherwise use the main process
        const process = data.process ? data.process : window.process
        return {
            name: 'FileEvent',
            timeStamp: Utils.getTimeStamp(),
            fullPath: data.path,
            activity: data.activity,
            userName: Utils.getUserName(),
            process: {
                name: Utils.getProcessName(process),
                id: Utils.getProcessID(process),
                commandLine: Utils.getProcessCommandLine(process)
            }
        }
    }

    createProcessEvent = (data = {}) => {
        // If a process gets passed in - use that.  Otherwise use the main process
        const process = data.process ? data.process : process
        return {
            name: 'ProcessEvent',
            timeStamp: Utils.getTimeStamp(),
            userName: Utils.getUserName(),
            process: {
                name: Utils.getProcessName(process),
                id: Utils.getProcessID(process),
                commandLine: Utils.getProcessCommandLine(process)
            }
        }
    }

    createNetworkEvent = (data = {}) => {
        // If a process gets passed in - use that.  Otherwise use the main process
        const process = data.process ? data.process : process
        return {
            name: 'NetworkEvent',
            timeStamp: Utils.getTimeStamp(),
            userName: Utils.getUserName(),
            destinationAddressPort: data.destinationAddressPort,
            sourceAddressPort: data.sourceAddressPort,
            sentDataSize: data.sentDataSize,
            protocol: data.protocol,
            process: {
                name: Utils.getProcessName(process),
                id: Utils.getProcessID(process),
                commandLine: Utils.getProcessCommandLine(process)
            }
        }
    }
}

export default DesktopTelemetryBasic