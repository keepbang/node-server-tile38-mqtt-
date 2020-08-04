if(process.env.NODE_ENV === 'production'){
    console.log('Production Server Start')
    module.exports = require('./application.prop.json');
}else{
    console.log('Development Server Start')
    module.exports = require('./application.dev.json');
}