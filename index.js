const express = require('express')
const app = express()
app.use(express.json())
const port = 3000

const Tile38 = require('tile38')
const client = new Tile38({host : 'localhost', port : 9851, debug: true})

const mqtt = require('mqtt')
const mqttOption = {
    host : 'localhost'
    ,port : 1883
}
const mqttClient = mqtt.connect(mqttOption)

mqttClient.on("connect",()=>{
    console.log("connected" + client.connected)
})

mqttClient.on("error", (error) => {
        console.log("Can't connect" + error)
        mqttClient.end()
    }
)

app.get('/', (req, res) => res.send('Hello World!!!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

app.get('/module/device/get',(req, res) => {
    let deviceId = req.body.deviceId

    client.get('DEVICE',deviceId).then(data => {
        return res.status(200).json({
            device : data.object
        })
    }).catch(err => res.status(400).json({success:false,err}))

})


app.get('/module/device/set',(req, res) => {
    let deviceId = req.body.deviceId
    let lon = req.body.lon
    let lat = req.body.lat

    client.set('DEVICE',deviceId,[lon,lat]).then(data => {
        return res.status(200).json({
            result : data
        })
    }).catch(err => res.status(400).json({success:false,err}))

})

let polygon = {"type":"Polygon","coordinates": [[[126.205444335937,37.6316347558065],[125.952758789062,35.9957853864203],[128.424682617188,35.8801489648836],[128.699340820312,36.976226784641],[126.205444335937,37.6316347558065]]]};
client.intersectsQuery('testFence').endPoints('mqtt://localhost:8443/RECEIVE/EVENT').detect('enter','exit').object(polygon)

mqttClient.subscribe('GEOCOMMAND/RECEIVE/EVENT')

mqttClient.on('message', (topic,message,packet) => {
    console.log("message is "+ message);
   console.log("topic is "+ topic);
})