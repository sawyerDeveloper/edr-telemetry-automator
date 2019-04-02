import { writeFile } from 'fs'
import { remote } from 'electron'
const { dialog } = remote
import Desktop from './suites/DesktopTelemetryBasic'

class TelemetryAutomator {

    constructor(completeCallback = null) {
        // Could be numerous automation suites
        this.automationSuites = [new Desktop()]
        this.log = []
        this.currentStep = 0
        // Gets refilled for each Suite that runs through
        this.config = null

        // Gets set to a Class instance that has the telemetry steps and data for logging.
        this.currentSuite = null

        // Serves as a means of async callback to the parent that all suites are complete
        this.completeCallback = completeCallback
    }
    
    startSequence = () => {
        console.log('startSequence')
        this.currentStep = 0
        this.log = []
        this.config = this.getConfig()

        this.nextStep()
    }

    downloadLog = () => {
        var path = dialog.showOpenDialog({
            properties: ['openDirectory']
        })
        writeFile(path+'/log.json', JSON.stringify(this.log), 'utf8', () => {
            
        })
    }

    getConfig = () => {
        return this.automationSuites[this.currentStep].getConfig()
    }

    stepValidator = (event = {}) => {
        this.updateLog(event)
        if (this.currentStep < this.config.steps.length) {
            this.nextStep()
        }
    }

    nextStep = () => {
        console.log('nexStep ', this.currentStep, this.config.steps[this.currentStep])
        if (this.currentStep == this.config.steps.length) {
            this.config.steps[this.currentStep].step(this.stepValidator)
        } else {
            this.endSequence()
        }
        this.currentStep++
    }

    endSequence = () => {
        console.log('endSequence', this.completeCallback)
        this.completeCallback()
    }

    updateLog = (data) => {
        this.log.push(data)
    }
}
export default TelemetryAutomator