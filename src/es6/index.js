const spawn = require('child_process').spawn;
const Chart = require('cli-chart')

let runCommandAsync = (cmd, options) => {
  cmd = spawn(cmd, options)
  return new Promise( (resolve, reject) => {
    cmd.stdout.on('data', (data) => {
      //console.log(`stdout: ${data}`);
      resolve(data)
    });

    cmd.stderr.on('data', (data) => {
      //console.log(`stderr: ${data}`);
      reject(data)
    });

    cmd.on('close', (code) => {
     // console.log(`child process exited with code ${code}`);
    });
  })
}

let getLineChanges = (log) => {
  let lines = log.split('\n')
  let len = lines.length - 1

  let skipCommitTitle = /^\s\d+\sfile/
  let isInsertion = /(\d+)\sinsertion/
  let isDeletion = /(\d+)\sdeletion/

  let sum = 0
  let sumString = []
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
      sumString.push(sum)
    } else {
      //console.log('skip ', line)
    }
  }
  return sumString
}

let plotChanges = (changes) => {
  console.log(changes.length)
  let chart = new Chart({
    xlabel: 'commits',
    ylabel: 'lines',
    direction: 'y',
    width: changes.length * 2,
    height: 10,
    lmargin: 15,
    step: 2
  })

  changes.forEach( (change) => {
    chart.addBar(parseInt(change))
  })
  chart.draw();
}

let main = async () => {
  let log = await runCommandAsync('git', ['log', '--shortstat',  '--oneline'])
  let changes = getLineChanges(log.toString())
  plotChanges(changes)
}

(async () => {
  await main()
  process.exit(0)
})()

