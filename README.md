# eXo PR Builds Action

Build Maven project using Github Actions

## Basic Usage example:

```yaml
name: PR Build
on:
  push:
jobs:
  build-ci:
    name: CI Build
    runs-on: ubuntu-latest
    timeout-minutes: 120
    permissions:
      pull-requests: write
    steps:
      - name: PR BUILD
        uses: exo-actions/pr-action@v1
        with:
          maven_version: "3.9.16"
          jdk_major_version: "21"
          jdk_distribution: "zulu"
```

## Inputs

| Name                    | Description                                                                           | Default value                |
|-------------------------|---------------------------------------------------------------------------------------|------------------------------|
| maven_version           | Maven version                                                                         | `3.9.16`                     |
| maven_profiles          | Comma-separated Maven build profiles                                                  | `default`                    |
| maven_args              | Additional Maven arguments                                                            | `` (empty)                   |
| extra_maven_opts        | Additional Maven JVM options (MAVEN_OPTS)                                             | `` (empty)                   |
| update_snapshots        | Force update of SNAPSHOT dependencies (`-U`)                                          | `true`                       |
| skip_gpg                | Skip GPG signing (`-Dgpg.skip=true`)                                                  | `true`                       |
| use_maven_wrapper       | Use the project Maven wrapper (`./mvnw`) instead of the installed Maven               | `false`                      |
| jdk_major_version       | JDK major version (`8`, `11`, `17`, `21`, `25`, ...)                                  | `17`                         |
| jdk_distribution        | JDK distribution (`temurin`, `zulu`, `adopt`, `liberica`, ...)                        | `zulu`                       |
| maximize_build_space    | Maximize build space for larger projects                                              | `false`                      |
| skip_tests              | Skip running tests                                                                    | `false`                      |
| fail_fast               | Fail the build at the first error (otherwise continue with `--fail-at-end`)           | `true`                       |
| build_timeout_minutes   | Timeout in minutes for the Maven build step                                           | `60`                         |
| check_module_versions   | Fail the build if a submodule version does not match the parent pom version           | `true`                       |
| enable_partial_build    | Enable partial build for PRs (only builds affected frontend modules)                  | `true`                       |
| partial_build_modules   | Comma-separated list of modules for manual partial build                              | `` (empty)                   |
| NEXUS_USERNAME          | *Secret* Maven repository username for private repositories                           | `` (empty)                   |
| NEXUS_PASSWORD          | *Secret* Maven repository password (token) for private repositories                   | `` (empty)                   |
| GH_TOKEN                | GitHub token for private repositories and PR label access                             | `` (empty)                   |
| M2_SETTINGS_FILE_URL    | Maven `settings.xml` file download URL                                                | `` (empty)                   |
| GIT_CHECKOUT_SHOW_PROGRESS | Show git checkout progress                                                        | `false`                      |

> Note: Maven dependency caching is handled automatically by `actions/setup-java` (cache: maven).

## PR Labels

The following labels can be applied to a PR to control build behavior:

| Label            | Effect                                                               |
|------------------|----------------------------------------------------------------------|
| `pr/debug`       | Runs Maven with `-X` (debug mode, full stack traces)                 |
| `pr/progress`    | Shows Maven download progress (hidden by default)                    |
| `pr/nocolors`    | Disables ANSI color output from Maven                                |