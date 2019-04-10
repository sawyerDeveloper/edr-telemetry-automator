# EDR Telemetry Automator

This is an automation tool that generates usage telemetry on a pc for validating EDR application testing. 
It is a GUI and has a unique architecture where React.js and Node.js exist in the same context and even shared threads.  Everything ties together through Electron which empowers multiplatform desktop apps completely made from ES6.

## To Use

```bash
# Clone this repository
git clone git@bitbucket.org:sawyerdeveloper/edr-telemetry-automator.git
# Go into the repository
cd edr-telemetry-automator
# Install dependencies
npm install
# Run the app
npm start
```

Press 'Start Sequence'.  
Once that is complete the 'Download Log' button will be enabled.
Press 'Download Log' and select the folder you want the log saved to.
