module.exports = {
    apps : [{
        name: "NEWSMARTPAI",
        script    : "bin/www",
        exec_mode : "cluster",
        instances: 'max',
        watch: true
    }]
}
