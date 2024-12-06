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
          maven_version: "3.9.9"
          jdk_major_version: "21"
          jdk_distribution: "zulu"
```

## Inputs


| Name                 | Description                                                                                          | Default value                    |
|----------------------|------------------------------------------------------------------------------------------------------|----------------------------------|
| maven_version        | Maven version                                                                                        | `3.9.9` (latest stable)          |
| maven_profiles       | Maven build profiles                                                                                 | `` (empty)                       |
| extra_maven_opts     | Maven extra options                                                                                  | `` (empty)                       |
| jdk_major_version    | JDK major version (`8`, `11`, `17`, `21`, `23`, ...)                                                 | `17`                             |
| jdk_distribution     | JDK distribtion (`temurin`, `zulu`, `adopt`, `liberica`, ...)                                        | `zulu`                           |
| maximize_build_space | Maximize Build Space for Bigger Projects Unit tests based on files and blocks                        | `false`                          |
| NEXUS_USERNAME       | *Secret* Maven repository username for private repositories                                          | `` (empty - optional secret)     |
| NEXUS_PASSWORD       | *Secret* Maven repository user password (token) for private repositories                             | `` (empty - optional secret)     |