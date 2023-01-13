const { exec } = require('child_process')
const inquirer = require('inquirer')
const waitOn = require('wait-on')
const fs = require('fs')
const path = require('path')

const serviceList = require('../src/configs/service-list')

require('dotenv').config({
  path: path.resolve(process.cwd(), '.env.local'),
})

const isValidPath = name => {
  const targetPath = path.resolve(process.cwd(), '../', name)
  return fs.existsSync(targetPath)
}

function serviceTransformer({ port, projectName }) {
  const npmCommand = `cd ../${projectName} && npm start`
  const waitOnResource = `tcp:${port}`

  return { npmCommand, waitOnResource }
}

function processConsole(childProcess) {
  childProcess.stdout.on('data', data => {
    console.log(data)
  })
  childProcess.stderr.on('data', data => {
    if (!/EADDRINUSE/g.test(data)) console.error(data)
  })

  return childProcess
}

async function main() {
  let projectNames = []
  if (process.env.PROJECT_NAMES) {
    const values = process.env.PROJECT_NAMES.split(',').map(i => i.trim())
    projectNames = values
    console.log('🚀 快速启动：', values)
  } else {
    const res = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'projectNames',
        message: '请选择要运行的实现服务',
        choices: serviceList.map(({ name, projectName }) => ({
          name: `${name} (${projectName})`,
          value: projectName,
        })),
      },
    ])

    projectNames = res.projectNames
  }

  const childProcesses = []
  const waitOnResources = []

  // check
  const invalid = projectNames.find(p => !isValidPath(p))
  if (invalid) {
    console.log(`🐞 出错了，未找到项目：${invalid}，请确认本地已安装`)
    return
  }

  const projectMap = serviceList.reduce((acc, cur) => {
    acc[cur.projectName] = cur
    return acc
  }, {})

  projectNames.forEach(projectName => {
    const { npmCommand, waitOnResource } = serviceTransformer(projectMap[projectName])

    const childProcess = processConsole(exec(npmCommand))

    childProcesses.push(childProcess)
    waitOnResources.push(waitOnResource)
  })

  if (waitOnResources.length) await waitOn({ resources: waitOnResources })
  console.log('✅ 实现服务启动完成，正在启动网关\n')
  const gatewayChildProcess = processConsole(
    exec(
      `SERVICE_PROJECT_NAMES=${projectNames.join(
        ',',
      )} NODE_ENV=local tsnd --prefer-ts --no-deps -r tsconfig-paths/register src/`,
    ),
  )

  childProcesses.forEach(childProcess => {
    childProcess.stdout.on('data', data => {
      if (data.includes('service is running')) {
        console.log('⏳ 正在重启网关\n')
        exec('touch ./src/app.ts')
      }
    })
  })

  process.on('SIGINT', () => {
    childProcesses.forEach(childProcess => {
      exec(`kill ${childProcess.pid}`)
    })
    exec(`kill ${gatewayChildProcess.pid}`)
    process.exit(0)
  })
}

main()
