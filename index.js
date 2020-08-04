const express = require('express')
const mqtt = require('mqtt')
const Tile38 = require('tile38')
const wkx = require('wkx')
const config = require('./server/config/key')

const app = express()
app.use(express.json())
const port = 3000

const mqttOption = {
    host : config.mqtt.ip
    ,port : config.mqtt.port
}

const tileOption = {
    host : config.tile38.ip
    , port : config.tile38.port
    , debug: true
}

const tileClient = new Tile38(tileOption)


const mqttClient = mqtt.connect(mqttOption)

mqttClient.on("connect",()=>{
    console.log("Mqtt Connected : " + mqttClient.connected)
})

mqttClient.on("error", (error) => {
        console.log("Can't connect" + error)
        mqttClient.end()
    }
)

app.get('/', (req, res) => res.send('Hello World!!!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


/**
 * Description  : memory DB에서 사용자 위치 정보를 가져오는 기능
 * parameter
 * deviceId       : 사용자 ID
 */
app.get('/module/device/get',(req, res) => {
    let deviceId = req.body.deviceId

    tileClient.get('DEVICE',deviceId).then(data => {
        return res.status(200).json({
            device : data.object
        })
    }).catch(err => res.status(400).json({success:false,err}))

})

/**
 * Description  : memory DB에 사용자 위치를 저장하는 기능
 * parameter
 * deviceId       : 사용자 ID
 * lon          : 경도(y)
 * lat          : 위도(x)
 */
app.get('/module/device/set',(req, res) => {
    let deviceId = req.body.deviceId
    let lon = req.body.lon
    let lat = req.body.lat

    tileClient.set('DEVICE',deviceId,[lat,lon]).then(data => {
        return res.status(200).json({
            result : data
        })
    }).catch(err => res.status(400).json({success:false,err}))

})

/**
 * Description  : memory DB에 fence를 저장하는 기능
 * parameter
 * fenceId      : fence ID
 * geoData      : wkt or wkb data
 */
app.get('/module/fence/set',(req,res) =>{

    let geometry = wkx.Geometry.parse(req.body.geoData)
    let fenceId = req.body.fenceId

    tileClient.setHook(fenceId,
        `mqtt://${mqttOption.ip}:${mqttOption.port}/DEVICE/EVENT`,
        null,
        'INTERSECTS',
        'DEVICE',
        {
            'detect' : 'enter,exit',
            'object' : geometry.toGeoJSON()
        }).then(data => res.status(200).json({
                result : data
            })
        ).catch(err => res.status(400).json({success:false,err}))
})



mqttClient.subscribe('DEVICE/EVENT')



mqttClient.on('message', (topic,message,packet) => {
    let data = JSON.parse(message)
    console.log("message is "+ message)
    console.log("topic is "+ topic)
});
