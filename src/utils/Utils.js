import os from 'os'
class Utils{

    static getTimeStamp = () => {
        return Date.now()
    }
    
    static getUserName = () => {
        return process.env.USER || process.env.USERNAME
    }
    
    static getIpAddress = () => {
        var interfaces = os.networkInterfaces()
        var addresses = []
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2]
                if ((address.family === 'IPv6' || address.family === 'IPv4') && !address.internal) {
                    addresses.push(address.address)
                }
            }
        }
        return addresses[0]
    }
    
    static getProcessID = (_process = process) => {
        return _process.pid
    }
    
    static getProcessName = (_process = process) => {
        if (_process.execPath) {
            return _process.execPath
        }
        // ChildProcess
        if (_process.spawnfile) {
            return _process.spawnfile
        }
        return ''
    }
    
    static getProcessCommandLine = (_process = process) => {
        if (_process.argv) {
            return _process.argv.reduce((string, arg) => `${string} ${arg}`)
        }
        // ChildProcess
        if (_process.spawnargs) {
            return _process.spawnargs.reduce((string, arg) => `${string} ${arg}`)
        }
        return ''
    }
}
export default Utils