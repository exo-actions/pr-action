import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  try {
    const inputs = {
      mavenVersion: core.getInput('maven_version'),
      mavenProfiles: core.getInput('maven_profiles'),
      extraMavenOpts: core.getInput('extra_maven_opts'),
      jdkVersion: core.getInput('jdk_major_version'),
      jdkDistribution: core.getInput('jdk_distribution'),
      maximizeBuildSpace: core.getInput('maximize_build_space') === 'true',
      nexusUsername: core.getInput('NEXUS_USERNAME'),
      nexusPassword: core.getInput('NEXUS_PASSWORD'),
      ghToken: core.getInput('GH_TOKEN') || process.env.GITHUB_TOKEN,
      m2SettingsUrl: core.getInput('M2_SETTINGS_FILE_URL'),
      showProgress: core.getInput('GIT_CHECKOUT_SHOW_PROGRESS') === 'true'
    };

    const context = github.context;

    if (inputs.maximizeBuildSpace) {
      await exec.exec('easimon/maximize-build-space@v10', [
        '--root-reserve-mb', '2048',
        '--temp-reserve-mb', '2048',
        '--swap-size-mb', '1024',
        '--remove-dotnet', 'true'
      ]);
    }

    const repoUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}.git`;

    await exec.exec('git', [
        'clone', '--no-shallow-submodules', repoUrl, '.'
    ]);


    let partialModules = '';
    const isFork = context.payload.pull_request?.head.repo.fork;
    const baseBranch = context.payload.pull_request?.base.ref;
    const pullNumber = context.payload.pull_request?.number;
    const cloneUrl = context.payload.pull_request?.head.repo.clone_url;

    if (!isFork) {
      const output = await exec.getExecOutput('find', ['.', '-name', 'pom.xml']);
      const pomFiles = output.stdout.split('\n').filter(f => f.trim() !== '');

      const frontendModules = pomFiles
        .filter(file => fs.readFileSync(file, 'utf8').includes('<packaging>war</packaging>'))
        .map(file => path.dirname(file))
        .join(',');
      if (frontendModules) {
        partialModules = frontendModules;
      }
    }

    core.setOutput('partialmodules', partialModules);

    await exec.exec('actions/setup-java@v5', [
      '--java-version', inputs.jdkVersion,
      '--distribution', inputs.jdkDistribution
    ]);

    await exec.exec('stCarolas/setup-maven@v5', [
      '--maven-version', inputs.mavenVersion
    ]);

    await exec.exec('actions/cache@v4', [
      '--path', '~/.m2/repository',
      '--key', `${process.platform}-m2-${Date.now()}`,
      '--restore-keys', `${process.platform}-m2-repository`
    ]);

    if (inputs.m2SettingsUrl) {
      fs.mkdirSync(path.join(process.env.HOME, '.m2'), { recursive: true });
      await exec.exec('wget', ['-q', inputs.m2SettingsUrl, '-O', path.join(process.env.HOME, '.m2/settings.xml')]);
    }

    if (partialModules) {
      await exec.exec('gh', ['pr', 'edit', pullNumber.toString(), '--add-label', 'partialCIBuild', '--repo', cloneUrl]);
    }

    let mvnArgs = ['clean', 'verify', '-B', `-P${inputs.mavenProfiles}`, '-Dstyle.color=always', '-Dmaven.artifact.threads=20', '-Dgpg.skip', '-U'];
    if (partialModules) {
      mvnArgs.push('-pl', partialModules.split(',').join(' -pl '));
    }

    await exec.exec('mvn', mvnArgs, {
      env: {
        ...process.env,
        MAVEN_OPTS: inputs.extraMavenOpts || '',
        NEXUS_USERNAME: inputs.nexusUsername,
        NEXUS_PASSWORD: inputs.nexusPassword
      }
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
