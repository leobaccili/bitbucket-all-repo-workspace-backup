const { Bitbucket } = require('bitbucket');
const { exec } = require('child_process');

const clientOptions = {
  auth: {
    username: '',
    password: '',
  },
};
const workspace = '';
const backupFolder = ''
let totalPages = 1;
const bitbucket = new Bitbucket(clientOptions);
const repositories = [];

function listRepos(page) {
  bitbucket.repositories
    .list({ workspace, page })
    .then(({ data }) => {
      repositories.push(...data.values.map((re) => re.slug));
      if (data.next) {
        totalPages++;
        listRepos(totalPages);
      } else {
        repositories.forEach((repository, index) => {
          setTimeout(() => {
            exec(
              `git clone https://${clientOptions.auth.username}@bitbucket.org/${workspace}/${repository} "${backupFolder}${repository}"`,
              (error, stdout, stderr) => {
                if (error) {
                  console.log(`error: ${error.message}`);
                  return;
                }
                if (stderr) {
                  console.log(`stderr: ${stderr}`);
                  return;
                }
                console.log(`stdout: ${stdout}`);
              }
            );

            exec(`cd "${backupFolder}${repository}" && git pull`, (error, stdout, stderr) => {
              if (error) {
                console.log(`error: ${error.message}`);
                return;
              }
              if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
              }
              console.log(`stdout: ${stdout}`);
            });
          }, 1000 * index);
        });
      }
    })
    .catch((err) => console.error(err));
}

listRepos(totalPages);
