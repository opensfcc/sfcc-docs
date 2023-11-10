const cluster = require('cluster')
const Debug = require('debug')
const os = require('os')

const debug = Debug('sfcc-docs:multicore')

const numCPUs = os.cpus().length

if (cluster.isMaster) {
  cluster.setupMaster({
    exec: 'server.cjs',
  })

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  Object.keys(cluster.workers).forEach((id) => {
    debug(`Worker id: ${id}/${numCPUs} with pid: ${cluster.workers[id].process.pid}`)
  })

  cluster.on('exit', (worker) => {
    debug(`Worker ${worker.process.pid} died: Respawning...`)
    cluster.fork()
  })
}
