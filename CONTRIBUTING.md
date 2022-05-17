# Contributing Guide

There are many ways in which you can contribute to the project, reporting issues, fixing them, implementing new features, making art, story writing or testing.

If anything in this contributing guide is not clear, don't hesitate to contact Torsin on our official [Discord Server](https://discord.gg/hUw2VmtzhX).

## Issues

### Creating Issues

* Anomalous Space uses the [Issues Tracker](https://github.com/the-crazyball/anomalousspace/issues) on GitHub.
* Issues are used to track work to be done (this includes bug fixes).
* Before making a new issue, make sure the same issue is not already listed in the issue tracker, either opened or already closed.
* In case it is listed and you have some more info, for example on how to reproduce a bug, post a comment in the original issue.

### Issue Labels

* ~bug
* ~documentation
* ~duplicate
* ~good first issue
* ~question
* ~wontfix
* ~content
* ~feature
* ~polish
* ~refactor
* ~suggestion

## Project Workflow

### Branching Structure

The project is using the following branching structure

* `main`
* feature branches (e.g. `001-fix-combat`)

**main** is the default branch. All feature branches should be branched from and merged into `main`.

**feature branches** are branches in which the actual development happens. The name of a feature branch should always contain the number of the issue that's being addressed (e.g. the `001` in `001-fix-combat`), and be all lowercase with hyphens between words.

### Using SSH keys

While not necessary, it is recommended to use SSH keys with git. Please follow [this page](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) to learn how to set up and use SSH keys.

### Forking and Syncing

All contributed work needs to be done in your own fork, in a branch created from the `main` branch. To learn more about forking a repository, follow [this guide](https://docs.github.com/en/get-started/quickstart/fork-a-repo).

In case your work on the contribution is taking longer, your branch may become out of date with the parent repository. [This article](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) will help you sync your fork with the upstream (parent) repository.

### Code Style and Linting

Anomalous Space uses ESLint and has a .eslintrc file with rules set up. When contributing code, please make sure to fix any errors and warnings produced by ESLint as your merge request won't be accepted otherwise.

Also please make sure to follow the [JS Style Guide](https://github.com/the-crazyball/anomalousspace).

### Merge Requests

Once you are done working on your contribution, you need to submit a merge request to merge your branch from your fork back into the upstream (parent) repository.

The merge request should have `main` as its target branch unless arranged otherwise.

You don't need to remove the source branch upon accepting the merge request if the merge request is being made from a fork.

Once your merge request is submitted, GitHub Actions will run a few tests on it. Should those tests fail, please address the failures.
A Merge Request with passing tests is ready to be merged.
