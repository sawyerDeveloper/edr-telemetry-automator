import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import TelemetryAutomator from './src/TelemetryAutomator'


class App extends Component {

    constructor(props){
        super(props)

        // Instantiate our automation framework
        this.ta = new TelemetryAutomator(this.sequenceComplete)

        this.state = {
            executing: false,
            complete: false,
            status: 'Press Start Sequence to begin.'
        }
    }

    startSequence = () => {
        this.setState({
            complete: false,
            executing: false,
            status: 'Executing'
        })

        this.ta.startSequence()
    }

    sequenceComplete = () => {
        this.setState({
            complete: 'true',
            executing: false,
            status: 'Complete!'
        })
        setTimeout(() => {
            console.log('yo')
            this.setState({
                status: 'Press Download Log or Start Sequence to begin.'
            })
        }, 3000);
    }

    downloadLog = () => {

        if(!this.state.complete){
            this.setState({status: 'Please run a sequence before downloading a log.'})
        }else{
            this.ta.downloadLog()
        }
        
    }

    render(){
        const styles = {
            container: {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: window.innerHeight,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#c8c8c8',
                position: 'fixed',
                top: 0,
                left: 0,
                fontFamily: 'Roboto'
            },
            button: {
                borderRadius: 10,
                margin: 20,
                padding: 20,
                color: '#726b68',
                fontSize: 18
            },
            buttonRow: {
                flexDirection: 'row'
            },
            status: {
                color: '#586261',
                fontSize: 24
            },
            header: {
                color: '#483d41',
                fontSize: 48,
                marginBottom: 100
            }
        }
        return (<div style={styles.container}>
                <div style={styles.header}>EDR Telemetry Automator</div>
                <div style={styles.status}>{this.state.status}</div>
                <div style={styles.buttonRow}>
                    <button style={styles.button} onClick={this.startSequence}>Start Sequence</button>
                    <button style={styles.button} onClick={this.downloadLog}>Download Log</button>
                </div>
                </div>)
    }
}

ReactDOM.render(<App />, document.getElementById('root'))
