const spawn = require('child_process').spawn;
const Chart = require('cli-chart')

let runCommandAsync = (cmd, options) => {
  cmd = spawn(cmd, options)
  return new Promise( (resolve, reject) => {
    cmd.stdout.on('data', (data) => {
      resolve(data)
    });

    cmd.stderr.on('data', (data) => {
      reject(data)
    });

    cmd.on('close', (code) => {
      if (code !== 0) {
        throw new Error('run ', cmd, options, 'failed, Error Code: ', code)
      }
    })
  })
}

let getLineChanges = (log) => {
  let lines = log.split('\n')
  let len = lines.length - 1

  let skipCommitTitle = /^\s\d+\sfile/
  let isInsertion = /(\d+)\sinsertion/
  let isDeletion = /(\d+)\sdeletion/

  let sum = 0
  let valueArray = []
  for (let i = len - 1; i > 0; i--) {
    let line = lines[i]
    if (skipCommitTitle.test(line)) {
      let matchInsertion = line.match(isInsertion)
      let matchDeletion = line.match(isDeletion)
      if (matchInsertion) {
        sum = sum + parseInt(matchInsertion[1])
      }
      if (matchDeletion) {
        sum = sum - parseInt(matchDeletion[1])
      }
      valueArray.push(sum)
    }
  }
  return valueArray
}

let plotChanges = (changes) => {
  let chart = new Chart({
    xlabel: 'commit',
    ylabel: 'code lines',
    direction: 'y',
    width: changes.length * 2,
    height: 10,
    lmargin: 15,
    step: 2
  })

  for (let i = 0; i < changes.length; i++) {
    chart.addBar(parseInt(changes[i]))
  }

  chart.draw();
}

let main = async () => {
  let log = await runCommandAsync('git', ['log', '--shortstat',  '--oneline'])
  let changes = getLineChanges(log.toString())
  plotChanges(changes)
}

(async () => {
  try {
    await main()
    process.exit(0)
  } catch(e) {
    console.log(e.stack)
  }
})()

