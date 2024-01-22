const fs = require("fs");
const { exec, execSync } = require("child_process");
const dotenv = require("dotenv");

function exec_cmd(cmd) {
  // exec(cmd, (err, stdout, stderr) => {
  //   if (err) {
  //     console.log(err)
  //     return;
  //   }
  //   console.log(stdout);
  // })
  let stdout = execSync(cmd, { encoding: "utf-8" });
  console.log(stdout);
}

let arg = process.argv.slice(2);
let env = arg[0];
let env_data = fs.readFileSync(".env." + env, "utf8");
const parsedEnv = dotenv.parse(env_data);

Object.entries(parsedEnv)
  // .split('\n')
  //   .filter(line => line.trim().length > 0)
  .forEach(([key, value]) => {
    // let [key, value] = line.split('=')
    try {
      exec_cmd(`vercel env rm ${key} ${env} -y`);
    } catch (e) {
      console.error(e);
    }
    exec_cmd(`echo ${value} | vercel env add ${key} ${env}`);
  });
